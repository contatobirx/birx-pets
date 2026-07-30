
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

export async function onRequestGet(context) {
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

    const url = new URL(request.url);
    const tagCodigo = texto(url.searchParams.get("tagCodigo"), 100);

    if (!tagCodigo) {
      return responder(
        { sucesso: false, mensagem: "Código da tag não informado." },
        400
      );
    }

    const pet = await petPertenceAoTutor(env, tagCodigo, sessao.email);

    if (!pet) {
      return responder(
        {
          sucesso: false,
          mensagem: "Pet não encontrado ou sem permissão de acesso.",
        },
        403
      );
    }

    const resultado = await env.DB.prepare(`
      SELECT
        id,
        tag_codigo AS tagCodigo,
        tipo,
        nome,
        data_aplicacao AS dataAplicacao,
        proxima_data AS proximaData,
        fabricante,
        lote,
        veterinario,
        observacoes,
        criado_em AS criadoEm
      FROM saude_pet
      WHERE UPPER(tag_codigo) = UPPER(?)
        AND tipo = 'Vacina'
      ORDER BY
        COALESCE(data_aplicacao, criado_em) DESC,
        id DESC
    `)
      .bind(tagCodigo)
      .all();

    return responder({
      sucesso: true,
      registros: resultado.results || [],
    });
  } catch (erro) {
    console.error("Erro em /api/saude-listar:", erro);

    return responder(
      {
        sucesso: false,
        mensagem: erro.message || "Erro interno ao listar registros.",
      },
      500
    );
  }
}

export async function onRequest(context) {
  if (context.request.method !== "GET") {
    return responder(
      { sucesso: false, mensagem: "Método não permitido." },
      405,
      { Allow: "GET" }
    );
  }

  return onRequestGet(context);
}
