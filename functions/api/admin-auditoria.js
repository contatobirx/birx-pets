import { adminAutorizado } from "../_lib/admin-auth.js";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-store",
    },
  });
}

function clean(value, max = 200) {
  return String(value ?? "").trim().slice(0, max);
}

export async function onRequestGet({ request, env }) {
  if (!(await adminAutorizado(request, env))) {
    return json({ sucesso: false, autenticado: false, mensagem: "Sessão administrativa inválida ou expirada." }, 401);
  }

  try {
    const url = new URL(request.url);
    const acao = clean(url.searchParams.get("acao"), 100);
    const alvo = clean(url.searchParams.get("alvo"), 200);
    const pagina = Math.max(1, Number.parseInt(url.searchParams.get("pagina"), 10) || 1);
    const limite = 50;
    const offset = (pagina - 1) * limite;
    const likeAcao = `%${acao}%`;
    const likeAlvo = `%${alvo}%`;

    const [lista, total] = await Promise.all([
      env.DB.prepare(`
        SELECT id, criado_em AS criadoEm, acao, alvo, detalhes
        FROM admin_auditoria
        WHERE (? = '' OR acao LIKE ?)
          AND (? = '' OR COALESCE(alvo, '') LIKE ?)
        ORDER BY id DESC
        LIMIT ? OFFSET ?
      `).bind(acao, likeAcao, alvo, likeAlvo, limite, offset).all(),
      env.DB.prepare(`
        SELECT COUNT(*) AS total
        FROM admin_auditoria
        WHERE (? = '' OR acao LIKE ?)
          AND (? = '' OR COALESCE(alvo, '') LIKE ?)
      `).bind(acao, likeAcao, alvo, likeAlvo).first(),
    ]);

    return json({
      sucesso: true,
      pagina,
      limite,
      total: Number(total?.total || 0),
      eventos: (lista.results || []).map((item) => ({
        id: item.id,
        criadoEm: item.criadoEm,
        acao: item.acao,
        alvo: item.alvo || "",
        detalhes: (() => {
          try { return item.detalhes ? JSON.parse(item.detalhes) : null; }
          catch { return null; }
        })(),
      })),
    });
  } catch (error) {
    console.error("admin-auditoria GET", error);
    return json({ sucesso: false, mensagem: "Não foi possível carregar o histórico administrativo." }, 500);
  }
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({ sucesso: false, mensagem: "Método não permitido." }, 405);
}
