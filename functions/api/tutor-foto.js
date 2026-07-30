const CABECALHOS_JSON = {
  "Content-Type": "application/json; charset=UTF-8",
  "Cache-Control": "no-store",
};

function responder(dados, status = 200, extras = {}) {
  return new Response(JSON.stringify(dados), {
    status,
    headers: {
      ...CABECALHOS_JSON,
      ...extras,
    },
  });
}

function obterCookies(request) {
  const cabecalho = request.headers.get("Cookie") || "";
  const cookies = {};

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
  const dados = new TextEncoder().encode(valor);
  const hash = await crypto.subtle.digest("SHA-256", dados);

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hashSha1(valor) {
  const dados = new TextEncoder().encode(valor);
  const hash = await crypto.subtle.digest("SHA-1", dados);

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function dataSqlAtual() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function limparCodigo(valor) {
  return String(valor || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .slice(0, 120);
}

async function obterSessao(request, env) {
  const token = obterTokenSessao(request);
  if (!token) return null;

  const tokenHash = await hashSha256(token);
  const agora = dataSqlAtual();

  const sessao = await env.DB.prepare(`
    SELECT id, email
    FROM sessoes_tutor
    WHERE token_hash = ?
      AND expira_em > ?
    LIMIT 1
  `)
    .bind(tokenHash, agora)
    .first();

  if (!sessao) return null;

  return {
    id: sessao.id,
    email: String(sessao.email || "").trim().toLowerCase(),
  };
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    if (!env.DB) {
      return responder(
        { sucesso: false, mensagem: "Banco de dados não configurado." },
        500
      );
    }

    const {
      CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET,
    } = env;

    if (
      !CLOUDINARY_CLOUD_NAME ||
      !CLOUDINARY_API_KEY ||
      !CLOUDINARY_API_SECRET
    ) {
      return responder(
        {
          sucesso: false,
          mensagem: "Credenciais da Cloudinary não configuradas.",
        },
        500
      );
    }

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

    const formulario = await request.formData();
    const arquivo = formulario.get("foto");
    const tagCodigo = String(
      formulario.get("tagCodigo") || formulario.get("codigoTag") || ""
    )
      .trim()
      .toUpperCase();

    if (!tagCodigo) {
      return responder(
        { sucesso: false, mensagem: "Código da tag não informado." },
        400
      );
    }

    if (!arquivo || typeof arquivo.arrayBuffer !== "function") {
      return responder(
        { sucesso: false, mensagem: "Nenhuma foto foi enviada." },
        400
      );
    }

    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
    const tamanhoMaximo = 5 * 1024 * 1024;

    if (!tiposPermitidos.includes(arquivo.type)) {
      return responder(
        {
          sucesso: false,
          mensagem: "Envie uma imagem JPG, PNG ou WEBP.",
        },
        400
      );
    }

    if (arquivo.size > tamanhoMaximo) {
      return responder(
        {
          sucesso: false,
          mensagem: "A foto deve ter no máximo 5 MB.",
        },
        400
      );
    }

    const pet = await env.DB.prepare(`
      SELECT id, tag_codigo
      FROM pets
      WHERE tag_codigo = ?
        AND LOWER(email) = LOWER(?)
      LIMIT 1
    `)
      .bind(tagCodigo, sessao.email)
      .first();

    if (!pet) {
      return responder(
        {
          sucesso: false,
          mensagem:
            "Pet não encontrado ou você não possui permissão para alterar esta foto.",
        },
        403
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const pasta = "orbitek-pets";
    const publicId = limparCodigo(tagCodigo);

    const stringAssinatura =
      `folder=${pasta}` +
      `&overwrite=true` +
      `&public_id=${publicId}` +
      `&timestamp=${timestamp}` +
      CLOUDINARY_API_SECRET;

    const assinatura = await hashSha1(stringAssinatura);
    const formularioCloudinary = new FormData();

    formularioCloudinary.append("file", arquivo);
    formularioCloudinary.append("api_key", CLOUDINARY_API_KEY);
    formularioCloudinary.append("timestamp", String(timestamp));
    formularioCloudinary.append("signature", assinatura);
    formularioCloudinary.append("folder", pasta);
    formularioCloudinary.append("public_id", publicId);
    formularioCloudinary.append("overwrite", "true");

    const respostaCloudinary = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formularioCloudinary,
      }
    );

    const resultadoCloudinary = await respostaCloudinary.json();

    if (!respostaCloudinary.ok || !resultadoCloudinary.secure_url) {
      console.error("Erro Cloudinary:", resultadoCloudinary);

      return responder(
        {
          sucesso: false,
          mensagem:
            resultadoCloudinary?.error?.message ||
            "Não foi possível enviar a foto.",
        },
        respostaCloudinary.status || 502
      );
    }

    const atualizacao = await env.DB.prepare(`
      UPDATE pets
      SET foto_url = ?
      WHERE id = ?
        AND LOWER(email) = LOWER(?)
    `)
      .bind(resultadoCloudinary.secure_url, pet.id, sessao.email)
      .run();

    if (!atualizacao.success) {
      throw new Error("O banco de dados não confirmou a atualização da foto.");
    }

    return responder(
      {
        sucesso: true,
        mensagem: "Foto atualizada com sucesso.",
        fotoUrl: resultadoCloudinary.secure_url,
        publicId: resultadoCloudinary.public_id,
      },
      201
    );
  } catch (erro) {
    console.error("Erro em /api/tutor-foto:", erro);

    return responder(
      {
        sucesso: false,
        mensagem: erro.message || "Erro interno ao atualizar a foto.",
      },
      500
    );
  }
}

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return responder(
      {
        sucesso: false,
        mensagem: "Método não permitido.",
      },
      405,
      { Allow: "POST" }
    );
  }

  return onRequestPost(context);
}
