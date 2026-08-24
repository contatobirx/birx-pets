const HEADERS = { "Content-Type": "application/json; charset=UTF-8", "Cache-Control": "public, max-age=120" };
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: HEADERS });

export async function onRequestGet({ request, env }) {
  try {
    const id = Number.parseInt(new URL(request.url).searchParams.get("id"), 10);
    if (!id) return json({ sucesso: false, mensagem: "Parceiro não informado." }, 400);
    const partner = await env.DB.prepare(`SELECT
      id,nome,whatsapp,categoria,endereco,cep,bairro,cidade,estado,latitude,longitude,horarios,servicos,especialidades,
      atende_emergencia AS atendeEmergencia,produtos,descricao,verificado,
      CASE WHEN promocao_validade IS NULL OR promocao_validade='' OR date(promocao_validade)>=date('now','localtime') THEN promocao ELSE NULL END AS promocao,
      CASE WHEN promocao_validade IS NULL OR promocao_validade='' OR date(promocao_validade)>=date('now','localtime') THEN promocao_codigo ELSE NULL END AS promocaoCodigo,
      CASE WHEN promocao_validade IS NULL OR promocao_validade='' OR date(promocao_validade)>=date('now','localtime') THEN promocao_validade ELSE NULL END AS promocaoValidade
      FROM parceiros WHERE id=? AND status='ativo' AND publico=1 AND verificado=1 LIMIT 1`).bind(id).first();
    if (!partner) return json({ sucesso: false, mensagem: "Parceiro não encontrado ou indisponível." }, 404);
    return json({ sucesso: true, parceiro: partner });
  } catch (error) {
    console.error("parceiro-publico GET", error);
    return json({ sucesso: false, mensagem: "Não foi possível carregar este parceiro." }, 500);
  }
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({ sucesso: false, mensagem: "Método não permitido." }, 405);
}
