
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

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const sessao = await sessaoAtual(request, env);

    if (!sessao) {
      return responder(
        { sucesso: false, autenticado: false, mensagem: "Sua sessão expirou." },
        401
      );
    }

    const corpo = await request.json().catch(() => ({}));
    const id = Number.parseInt(corpo.id, 10);
    const tagCodigo = texto(corpo.tagCodigo, 100);

    if (!id || !tagCodigo) {
      return responder({ sucesso: false, mensagem: "Dados incompletos." }, 400);
    }

    const documento = await documentoDoTutor(env, id, tagCodigo, sessao.email);

    if (!documento) {
      return responder(
        { sucesso: false, mensagem: "Documento não encontrado." },
        404
      );
    }

    const cloudName = env.CLOUDINARY_CLOUD_NAME;
    const apiKey = env.CLOUDINARY_API_KEY;
    const apiSecret = env.CLOUDINARY_API_SECRET;

    if (
      cloudName &&
      apiKey &&
      apiSecret &&
      documento.arquivo_public_id
    ) {
      const timestamp = Math.floor(Date.now() / 1000);
      const publicId = documento.arquivo_public_id;
      const assinatura = await hash(
        `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`,
        "SHA-1"
      );

      const dadosCloudinary = new FormData();
      dadosCloudinary.append("public_id", publicId);
      dadosCloudinary.append("timestamp", String(timestamp));
      dadosCloudinary.append("api_key", apiKey);
      dadosCloudinary.append("signature", assinatura);

      const recursoTipo = documento.recurso_tipo === "raw" ? "raw" : "image";

      const respostaCloudinary = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${recursoTipo}/destroy`,
        { method: "POST", body: dadosCloudinary }
      );

      if (!respostaCloudinary.ok) {
        console.warn(
          "Não foi possível remover o arquivo da Cloudinary; removendo apenas o registro."
        );
      }
    }

    await env.DB.prepare(`
      DELETE FROM documentos_pet
      WHERE id = ?
        AND UPPER(tag_codigo) = UPPER(?)
    `)
      .bind(id, tagCodigo)
      .run();

    return responder({
      sucesso: true,
      mensagem: "Documento excluído com sucesso.",
    });
  } catch (erro) {
    console.error("Erro em /api/documentos-excluir:", erro);
    return responder(
      { sucesso: false, mensagem: erro.message || "Erro ao excluir documento." },
      500
    );
  }
}

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return responder({ sucesso: false, mensagem: "Método não permitido." }, 405, {
      Allow: "POST",
    });
  }

  return onRequestPost(context);
}
