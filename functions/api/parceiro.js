const HEADERS = { "Content-Type": "application/json; charset=UTF-8", "Cache-Control": "no-store" };
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: HEADERS });
const clean = (value, max = 300) => String(value ?? "").trim().slice(0, max);
const sessionToken = request => request.headers.get("Cookie")?.match(/(?:^|;\s*)birx_partner=([^;]+)/)?.[1] || "";

async function sha(value) {
  const data = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(data)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

async function session(request, env) {
  const raw = sessionToken(request);
  if (!raw) return null;
  return env.DB.prepare(`SELECT p.id,p.nome,p.email,p.whatsapp,p.cidade,p.estado,p.categoria,p.endereco,p.cep,p.bairro,p.latitude,p.longitude,p.horarios,p.servicos,p.especialidades,p.atende_emergencia AS atendeEmergencia,p.promocao,p.promocao_codigo AS promocaoCodigo,promocao_validade AS promocaoValidade,p.produtos,p.descricao,p.publico,p.verificado FROM parceiro_sessoes s INNER JOIN parceiros p ON p.id=s.parceiro_id WHERE s.token_hash=? AND s.expira_em>CURRENT_TIMESTAMP AND p.status='ativo' LIMIT 1`).bind(await sha(raw)).first();
}

async function stock(env, partnerId) {
  const result = await env.DB.prepare(`SELECT e.tag_codigo AS codigo,CASE WHEN t.ativada=1 THEN 'ativada' ELSE e.status END AS status,t.modelo,t.lote,e.recebido_em AS recebidoEm,e.vendido_em AS vendidoEm FROM parceiro_estoque e INNER JOIN tags t ON UPPER(t.codigo)=UPPER(e.tag_codigo) WHERE e.parceiro_id=? ORDER BY e.id DESC LIMIT 300`).bind(partnerId).all();
  return result.results || [];
}

export async function onRequestGet({ request, env }) {
  const partner = await session(request, env);
  if (!partner) return json({ sucesso: false, autenticado: false, mensagem: "Entre novamente no Painel do Parceiro." }, 401);
  try {
    const tags = await stock(env, partner.id);
    const resumo = {
      total: tags.length,
      estoque: tags.filter(tag => tag.status === "estoque").length,
      vendidas: tags.filter(tag => tag.status === "vendida").length,
      ativadas: tags.filter(tag => tag.status === "ativada").length
    };
    return json({ sucesso: true, parceiro: partner, resumo, tags });
  } catch (error) {
    console.error("parceiro GET", error);
    return json({ sucesso: false, mensagem: "Não foi possível carregar o painel." }, 500);
  }
}

const validDate = value => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

async function savePublicProfile(env, partner, body) {
  const categories = ["Pet shop", "Clínica veterinária", "Banho e tosa", "Creche", "Hotel", "Adestramento", "Outro"];
  const category = categories.includes(body.categoria) ? body.categoria : "Outro";
  const whatsapp = clean(body.whatsapp, 30);
  const city = clean(body.cidade, 100);
  const state = clean(body.estado, 2).toUpperCase();
  const latitude = Number(body.latitude);
  const longitude = Number(body.longitude);
  const promotion = clean(body.promocao, 500);
  const promotionCode = clean(body.promocaoCodigo, 30).toUpperCase().replace(/[^A-Z0-9_-]/g, "");
  const promotionExpiry = clean(body.promocaoValidade, 10);
  const isPublic = body.publico ? 1 : 0;
  if (isPublic && (!whatsapp || !city)) return json({ sucesso: false, mensagem: "Informe WhatsApp e cidade antes de publicar." }, 400);
  if (promotionCode && !promotion) return json({ sucesso: false, mensagem: "Descreva o benefício antes de informar um cupom." }, 400);
  if (promotionExpiry && !validDate(promotionExpiry)) return json({ sucesso: false, mensagem: "Informe uma data de validade válida para a promoção." }, 400);
  await env.DB.prepare(`UPDATE parceiros SET whatsapp=?,categoria=?,endereco=?,cep=?,bairro=?,cidade=?,estado=?,latitude=?,longitude=?,horarios=?,servicos=?,especialidades=?,atende_emergencia=?,promocao=?,promocao_codigo=?,promocao_validade=?,produtos=?,descricao=?,publico=?,verificado=1,atualizado_em=CURRENT_TIMESTAMP WHERE id=?`).bind(
    whatsapp, category, clean(body.endereco, 240), clean(body.cep, 9), clean(body.bairro, 100), city, state,
    Number.isFinite(latitude) ? latitude : null, Number.isFinite(longitude) ? longitude : null,
    clean(body.horarios, 500), clean(body.servicos, 700), clean(body.especialidades, 500), body.atendeEmergencia ? 1 : 0,
    promotion, promotionCode || null, promotionExpiry || null, clean(body.produtos, 700), clean(body.descricao, 1000), isPublic, partner.id
  ).run();
  return json({ sucesso: true, mensagem: isPublic ? "Perfil verificado e publicado na Rede BIRX." : "Perfil atualizado." });
}

async function registerSale(env, partner, body) {
  const code = clean(body.codigo, 60).toUpperCase();
  if (!code) return json({ sucesso: false, mensagem: "Informe o código da tag." }, 400);
  const item = await env.DB.prepare(`SELECT e.id,e.status,t.ativada,t.bloqueada FROM parceiro_estoque e INNER JOIN tags t ON UPPER(t.codigo)=UPPER(e.tag_codigo) WHERE e.parceiro_id=? AND UPPER(e.tag_codigo)=UPPER(?) LIMIT 1`).bind(partner.id, code).first();
  if (!item) return json({ sucesso: false, mensagem: "Esta tag não pertence ao estoque do parceiro." }, 404);
  if (Number(item.bloqueada) === 1) return json({ sucesso: false, mensagem: "Esta tag está bloqueada. Fale com a BIRX." }, 409);
  if (Number(item.ativada) === 1) return json({ sucesso: false, mensagem: "Esta tag já foi ativada." }, 409);
  if (item.status !== "estoque") return json({ sucesso: false, mensagem: "Esta venda já foi registrada." }, 409);
  await env.DB.batch([
    env.DB.prepare("UPDATE parceiro_estoque SET status='vendida',vendido_em=CURRENT_TIMESTAMP,atualizado_em=CURRENT_TIMESTAMP WHERE id=?").bind(item.id),
    env.DB.prepare("INSERT OR IGNORE INTO parceiro_vendas(parceiro_id,tag_codigo,observacoes) VALUES(?,?,?)").bind(partner.id, code, clean(body.observacoes, 300)),
    env.DB.prepare("UPDATE tags SET preparo_status='vendida',vendida_em=CURRENT_TIMESTAMP WHERE UPPER(codigo)=UPPER(?) AND ativada=0").bind(code)
  ]);
  return json({ sucesso: true, mensagem: `Venda da tag ${code} registrada.`, urlAtivacao: `/q/${encodeURIComponent(code)}` });
}

export async function onRequestPost({ request, env }) {
  const partner = await session(request, env);
  if (!partner) return json({ sucesso: false, autenticado: false, mensagem: "Entre novamente no Painel do Parceiro." }, 401);
  try {
    const body = await request.json().catch(() => ({}));
    const action = clean(body.acao, 40);
    if (action === "salvar-perfil-publico") return savePublicProfile(env, partner, body);
    if (action === "venda") return registerSale(env, partner, body);
    return json({ sucesso: false, mensagem: "Ação inválida." }, 400);
  } catch (error) {
    console.error("parceiro POST", error);
    return json({ sucesso: false, mensagem: "Não foi possível concluir a operação." }, 500);
  }
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  if (context.request.method === "POST") return onRequestPost(context);
  return json({ sucesso: false }, 405);
}
