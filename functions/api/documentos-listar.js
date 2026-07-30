
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

function cookies(request) {
  const resultado = {};
  const cabecalho = request.headers.get("Cookie") || "";

  for (const parte of cabecalho.split(";")) {
    const indice = parte.indexOf("=");
    if (indice < 0) continue;

    const nome = parte.slice(0, indice).trim();
    const valor = parte.slice(indice + 1).trim();

    if (!nome) continue;

    try { resultado[nome] = decodeURIComponent(valor); }
    catch { resultado[nome] = valor; }
  }

  return resultado;
}

function tokenSessao(request) {
  const dados = cookies(request);
  const nomes = [
    "sessao_tutor",
    "tutor_session",
    "orbitek_session",
    "orbitek_sessao",
    "session",
  ];

  for (const nome of nomes) {
    if (dados[nome]) return dados[nome];
  }

  return "";
}

async function hash(valor, algoritmo = "SHA-256") {
  const bytes = new TextEncoder().encode(valor);
  const digest = await crypto.subtle.digest(algoritmo, bytes);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function agoraSql() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function texto(valor, limite = 1000) {
  return String(valor ?? "").trim().slice(0, limite);
}

function slug(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

async function sessaoAtual(request, env) {
  const token = tokenSessao(request);
  if (!token) return null;

  const tokenHash = await hash(token);

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
    email: texto(sessao.email, 254).toLowerCase(),
  };
}

async function petDoTutor(env, tagCodigo, email) {
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

async function documentoDoTutor(env, id, tagCodigo, email) {
  return env.DB.prepare(`
    SELECT
      d.id,
      d.tag_codigo,
      d.arquivo_url,
      d.arquivo_public_id,
      d.recurso_tipo
    FROM documentos_pet d
    INNER JOIN pets p
      ON UPPER(p.tag_codigo) = UPPER(d.tag_codigo)
    WHERE d.id = ?
      AND UPPER(d.tag_codigo) = UPPER(?)
      AND LOWER(p.email) = LOWER(?)
    LIMIT 1
  `)
    .bind(id, tagCodigo, email)
    .first();
}

export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    const sessao = await sessaoAtual(request, env);

    if (!sessao) {
      return responder(
        { sucesso: false, autenticado: false, mensagem: "Sua sessão expirou." },
        401
      );
    }

    const url = new URL(request.url);
    const tagCodigo = texto(url.searchParams.get("tagCodigo"), 100);

    if (!tagCodigo) {
      return responder({ sucesso: false, mensagem: "Tag não informada." }, 400);
    }

    const pet = await petDoTutor(env, tagCodigo, sessao.email);

    if (!pet) {
      return responder(
        { sucesso: false, mensagem: "Pet não encontrado ou acesso negado." },
        403
      );
    }

    const resultado = await env.DB.prepare(`
      SELECT
        id,
        tag_codigo AS tagCodigo,
        categoria,
        titulo,
        arquivo_url AS arquivoUrl,
        arquivo_tipo AS arquivoTipo,
        arquivo_public_id AS arquivoPublicId,
        recurso_tipo AS recursoTipo,
        nome_arquivo AS nomeArquivo,
        tamanho_bytes AS tamanhoBytes,
        criado_em AS criadoEm,
        atualizado_em AS atualizadoEm
      FROM documentos_pet
      WHERE UPPER(tag_codigo) = UPPER(?)
      ORDER BY criado_em DESC, id DESC
    `)
      .bind(tagCodigo)
      .all();

    return responder({
      sucesso: true,
      documentos: resultado.results || [],
    });
  } catch (erro) {
    console.error("Erro em /api/documentos-listar:", erro);
    return responder(
      { sucesso: false, mensagem: erro.message || "Erro ao listar documentos." },
      500
    );
  }
}

export async function onRequest(context) {
  if (context.request.method !== "GET") {
    return responder({ sucesso: false, mensagem: "Método não permitido." }, 405, {
      Allow: "GET",
    });
  }

  return onRequestGet(context);
}
