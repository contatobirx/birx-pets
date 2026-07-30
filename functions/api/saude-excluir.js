
const CABECALHOS_JSON = {
  "Content-Type": "application/json; charset=UTF-8",
  "Cache-Control": "no-store",
};

function responder(dados, status = 200, extras = {}) {
  return new Response(JSON.stringify(dados), {
    status,
    headers: { ...CABECALHOS_JSON, ...extras },
  });
}

function obterCookies(request) {
  const cookies = {};
  const cabecalho = request.headers.get("Cookie") || "";

  for (const parte of cabecalho.split(";")) {
    const indice = parte.indexOf("=");
    if (indice === -1) continue;

    const nome = parte.slice(0, indice).trim();
    const valor = parte.slice(indice + 1).trim();
    if (!nome) continue;

    try {
      cookies[nome] = decodeURIComponent(valor);
    } catch {
      cookies[nome] = valor;
    }
  }

  return cookies;
}

function obterTokenSessao(request) {
  const cookies = obterCookies(request);
  const nomesAceitos = [
    "sessao_tutor",
    "tutor_session",
    "orbitek_session",
    "orbitek_sessao",
    "session",
  ];

  for (const nome of nomesAceitos) {
    if (cookies[nome]) return cookies[nome];
  }

  return "";
}

async function hashSha256(valor) {
  const bytes = new TextEncoder().encode(valor);
  const hash = await crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function agoraSql() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

async function obterSessao(request, env) {
  const token = obterTokenSessao(request);
  if (!token) return null;

  const tokenHash = await hashSha256(token);

  const sessao = await env.DB.prepare(`
    SELECT id, email
    FROM sessoes_tutor
    WHERE token_hash = ?
      AND expira_em > ?
    LIMIT 1
  `)
    .bind(tokenHash, agoraSql())
    .first();

  if (!sessao) return null;

  return {
    id: sessao.id,
    email: String(sessao.email || "").trim().toLowerCase(),
  };
}

async function petPertenceAoTutor(env, tagCodigo, email) {
  return env.DB.prepare(`
    SELECT id, tag_codigo
    FROM pets
    WHERE UPPER(tag_codigo) = UPPER(?)
      AND LOWER(email) = LOWER(?)
    LIMIT 1
  `)
    .bind(tagCodigo, email)
    .first();
}

function texto(valor, limite = 1000) {
  return String(valor ?? "").trim().slice(0, limite);
}

function dataValidaOuVazia(valor) {
  const data = texto(valor, 10);
  if (!data) return "";

  return /^\d{4}-\d{2}-\d{2}$/.test(data) ? data : null;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const sessao = await obterSessao(request, env);

    if (!sessao) {
      return responder(
        {
          sucesso: false,
          autenticado: false,
          mensagem: "Sua sessão expirou. Entre novamente.",
        },
        401
      );
    }

    const corpo = await request.json().catch(() => ({}));
    const id = Number.parseInt(corpo.id, 10);
    const tagCodigo = texto(corpo.tagCodigo, 100);

    if (!id || !tagCodigo) {
      return responder(
        {
          sucesso: false,
          mensagem: "Registro e código da tag são obrigatórios.",
        },
        400
      );
    }

    const existente = await env.DB.prepare(`
      SELECT s.id
      FROM saude_pet s
      INNER JOIN pets p
        ON UPPER(p.tag_codigo) = UPPER(s.tag_codigo)
      WHERE s.id = ?
        AND s.tipo = 'Vacina'
        AND UPPER(s.tag_codigo) = UPPER(?)
        AND LOWER(p.email) = LOWER(?)
      LIMIT 1
    `)
      .bind(id, tagCodigo, sessao.email)
      .first();

    if (!existente) {
      return responder(
        { sucesso: false, mensagem: "Registro não encontrado." },
        404
      );
    }

    await env.DB.prepare(`
      DELETE FROM saude_pet
      WHERE id = ?
        AND UPPER(tag_codigo) = UPPER(?)
    `)
      .bind(id, tagCodigo)
      .run();

    return responder({
      sucesso: true,
      mensagem: "Vacina excluída com sucesso.",
    });
  } catch (erro) {
    console.error("Erro em /api/saude-excluir:", erro);

    return responder(
      {
        sucesso: false,
        mensagem: erro.message || "Erro interno ao excluir o registro.",
      },
      500
    );
  }
}

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return responder(
      { sucesso: false, mensagem: "Método não permitido." },
      405,
      { Allow: "POST" }
    );
  }

  return onRequestPost(context);
}
