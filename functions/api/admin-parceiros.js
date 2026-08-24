const HEADERS = { "Content-Type": "application/json; charset=UTF-8", "Cache-Control": "no-store" };
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: HEADERS });
const clean = (value, max = 160) => String(value ?? "").trim().slice(0, max);
const email = value => clean(value, 180).toLowerCase();

async function sha(value) {
  const data = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(data)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

async function authorized(request, env) {
  const supplied = clean(request.headers.get("X-BIRX-Admin"), 500);
  const expected = clean(env.TAG_ADMIN_TOKEN, 500);
  return Boolean(supplied && expected && (await sha(supplied)) === (await sha(expected)));
}

function accessCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return [...bytes].map(byte => alphabet[byte % alphabet.length]).join("");
}

async function setup(env) {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS parceiros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    documento TEXT,
    email TEXT NOT NULL UNIQUE,
    whatsapp TEXT,
    cidade TEXT,
    estado TEXT,
    status TEXT NOT NULL DEFAULT 'pendente',
    codigo_acesso_hash TEXT,
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS parceiro_sessoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parceiro_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expira_em TEXT NOT NULL,
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS parceiro_estoque (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parceiro_id INTEGER NOT NULL,
    tag_codigo TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'estoque',
    recebido_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    vendido_em TEXT,
    atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS parceiro_vendas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parceiro_id INTEGER NOT NULL,
    tag_codigo TEXT NOT NULL UNIQUE,
    observacoes TEXT,
    vendido_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
}

export async function onRequestGet({ request, env }) {
  if (!await authorized(request, env)) return json({ sucesso: false, mensagem: env.TAG_ADMIN_TOKEN ? "Chave administrativa inválida." : "Configure TAG_ADMIN_TOKEN na Cloudflare." }, 401);
  try {
    await setup(env);
    const result = await env.DB.prepare(`SELECT
      p.id,p.nome,p.documento,p.email,p.whatsapp,p.cidade,p.estado,p.status,p.criado_em AS criadoEm,
      p.categoria,p.servicos,p.produtos,p.promocao,p.descricao,p.atende_emergencia AS atendeEmergencia,
      COUNT(e.id) AS totalTags,
      SUM(CASE WHEN e.status='estoque' THEN 1 ELSE 0 END) AS emEstoque,
      SUM(CASE WHEN e.status='vendida' THEN 1 ELSE 0 END) AS vendidas,
      SUM(CASE WHEN e.status='ativada' THEN 1 ELSE 0 END) AS ativadas
      FROM parceiros p LEFT JOIN parceiro_estoque e ON e.parceiro_id=p.id
      GROUP BY p.id ORDER BY CASE p.status WHEN 'pendente' THEN 0 WHEN 'ativo' THEN 1 ELSE 2 END, p.id DESC`).all();
    return json({ sucesso: true, parceiros: result.results || [] });
  } catch (error) {
    console.error("admin-parceiros GET", error);
    return json({ sucesso: false, mensagem: "Não foi possível listar os parceiros." }, 500);
  }
}

async function createPartner(env, body) {
  const nome = clean(body.nome, 120);
  const mail = email(body.email);
  const documento = clean(body.documento, 30);
  const whatsapp = clean(body.whatsapp, 30);
  const cidade = clean(body.cidade, 80);
  const estado = clean(body.estado, 2).toUpperCase();
  if (nome.length < 2 || !/^\S+@\S+\.\S+$/.test(mail)) return json({ sucesso: false, mensagem: "Informe nome e e-mail válidos." }, 400);
  const code = accessCode();
  await env.DB.prepare("INSERT INTO parceiros(nome,documento,email,whatsapp,cidade,estado,status,codigo_acesso_hash) VALUES(?,?,?,?,?,?,'ativo',?)").bind(nome, documento, mail, whatsapp, cidade, estado, await sha(code)).run();
  return json({ sucesso: true, mensagem: "Parceiro cadastrado e aprovado.", codigoAcesso: code }, 201);
}

async function approvePartner(env, body) {
  const id = Number.parseInt(body.id, 10);
  if (!id) return json({ sucesso: false, mensagem: "Parceiro inválido." }, 400);
  const partner = await env.DB.prepare("SELECT id,status FROM parceiros WHERE id=? LIMIT 1").bind(id).first();
  if (!partner) return json({ sucesso: false, mensagem: "Parceiro não encontrado." }, 404);
  if (partner.status !== "pendente") return json({ sucesso: false, mensagem: "Este parceiro já foi avaliado." }, 409);
  const code = accessCode();
  await env.DB.prepare("UPDATE parceiros SET status='ativo',codigo_acesso_hash=?,atualizado_em=CURRENT_TIMESTAMP WHERE id=?").bind(await sha(code), id).run();
  return json({ sucesso: true, mensagem: "Parceiro aprovado.", codigoAcesso: code });
}

async function changeStatus(env, body) {
  const id = Number.parseInt(body.id, 10);
  const status = clean(body.status, 20);
  if (!id || !["pendente", "ativo", "suspenso"].includes(status)) return json({ sucesso: false, mensagem: "Dados inválidos." }, 400);
  const partner = await env.DB.prepare("SELECT status FROM parceiros WHERE id=? LIMIT 1").bind(id).first();
  if (!partner) return json({ sucesso: false, mensagem: "Parceiro não encontrado." }, 404);
  if (partner.status === "pendente" && status === "ativo") return json({ sucesso: false, mensagem: "Aprove a solicitação para gerar o acesso do parceiro." }, 409);
  await env.DB.prepare("UPDATE parceiros SET status=?,atualizado_em=CURRENT_TIMESTAMP WHERE id=?").bind(status, id).run();
  if (status !== "ativo") await env.DB.prepare("DELETE FROM parceiro_sessoes WHERE parceiro_id=?").bind(id).run();
  return json({ sucesso: true, mensagem: `Parceiro marcado como ${status}.` });
}

async function resetAccess(env, body) {
  const id = Number.parseInt(body.id, 10);
  if (!id) return json({ sucesso: false, mensagem: "Parceiro inválido." }, 400);
  const code = accessCode();
  await env.DB.batch([
    env.DB.prepare("UPDATE parceiros SET codigo_acesso_hash=?,status='ativo',atualizado_em=CURRENT_TIMESTAMP WHERE id=?").bind(await sha(code), id),
    env.DB.prepare("DELETE FROM parceiro_sessoes WHERE parceiro_id=?").bind(id)
  ]);
  return json({ sucesso: true, mensagem: "Novo código de acesso criado.", codigoAcesso: code });
}

async function distribute(env, body) {
  const id = Number.parseInt(body.id, 10);
  const codes = [...new Set(String(body.codigos || "").toUpperCase().split(/[\s,;]+/).map(code => code.trim()).filter(Boolean))].slice(0, 100);
  if (!id || !codes.length) return json({ sucesso: false, mensagem: "Informe o parceiro e pelo menos uma tag." }, 400);
  const partner = await env.DB.prepare("SELECT id FROM parceiros WHERE id=? AND status='ativo'").bind(id).first();
  if (!partner) return json({ sucesso: false, mensagem: "Parceiro não está ativo." }, 409);
  let distributed = 0;
  for (const code of codes) {
    const tag = await env.DB.prepare("SELECT codigo,ativada,bloqueada FROM tags WHERE UPPER(codigo)=UPPER(?) LIMIT 1").bind(code).first();
    if (!tag || Number(tag.ativada) === 1 || Number(tag.bloqueada) === 1) continue;
    try {
      await env.DB.prepare(`INSERT INTO parceiro_estoque(parceiro_id,tag_codigo,status) VALUES(?,?,'estoque')
        ON CONFLICT(tag_codigo) DO UPDATE SET parceiro_id=excluded.parceiro_id,status='estoque',vendido_em=NULL,atualizado_em=CURRENT_TIMESTAMP`).bind(id, tag.codigo).run();
      distributed++;
    } catch (error) { console.error("distribuir tag", code, error); }
  }
  return json({ sucesso: true, mensagem: `${distributed} tag${distributed === 1 ? "" : "s"} enviada${distributed === 1 ? "" : "s"} ao parceiro.`, distribuidas: distributed });
}

export async function onRequestPost({ request, env }) {
  if (!await authorized(request, env)) return json({ sucesso: false, mensagem: env.TAG_ADMIN_TOKEN ? "Chave administrativa inválida." : "Configure TAG_ADMIN_TOKEN na Cloudflare." }, 401);
  try {
    await setup(env);
    const body = await request.json().catch(() => ({}));
    const action = clean(body.acao, 30);
    if (action === "criar") return createPartner(env, body);
    if (action === "aprovar") return approvePartner(env, body);
    if (action === "status") return changeStatus(env, body);
    if (action === "redefinir") return resetAccess(env, body);
    if (action === "distribuir") return distribute(env, body);
    return json({ sucesso: false, mensagem: "Ação inválida." }, 400);
  } catch (error) {
    console.error("admin-parceiros POST", error);
    if (String(error.message).toLowerCase().includes("unique")) return json({ sucesso: false, mensagem: "Já existe um parceiro com este e-mail." }, 409);
    return json({ sucesso: false, mensagem: "Não foi possível atualizar o parceiro." }, 500);
  }
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  if (context.request.method === "POST") return onRequestPost(context);
  return json({ sucesso: false, mensagem: "Método não permitido." }, 405);
}
