
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

const CATEGORIAS = new Set([
  "Carteira de vacinação",
  "Receita",
  "Exame",
  "Laudo",
  "Foto",
  "Outro",
]);

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

    const cloudName = env.CLOUDINARY_CLOUD_NAME;
    const apiKey = env.CLOUDINARY_API_KEY;
    const apiSecret = env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return responder(
        { sucesso: false, mensagem: "Cloudinary não configurada." },
        500
      );
    }

    const formulario = await request.formData();
    const tagCodigo = texto(formulario.get("tagCodigo"), 100).toUpperCase();
    const categoria = texto(formulario.get("categoria"), 60);
    const titulo = texto(formulario.get("titulo"), 120);
    const arquivo = formulario.get("arquivo");

    if (!tagCodigo || !categoria || !titulo) {
      return responder(
        { sucesso: false, mensagem: "Tag, categoria e título são obrigatórios." },
        400
      );
    }

    if (!CATEGORIAS.has(categoria)) {
      return responder({ sucesso: false, mensagem: "Categoria inválida." }, 400);
    }

    if (!arquivo || typeof arquivo.arrayBuffer !== "function") {
      return responder({ sucesso: false, mensagem: "Selecione um arquivo." }, 400);
    }

    const tipos = new Set([
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ]);

    if (!tipos.has(arquivo.type)) {
      return responder(
        { sucesso: false, mensagem: "Envie JPG, PNG, WEBP ou PDF." },
        400
      );
    }

    if (arquivo.size > 10 * 1024 * 1024) {
      return responder(
        { sucesso: false, mensagem: "O arquivo deve ter no máximo 10 MB." },
        400
      );
    }

    const pet = await petDoTutor(env, tagCodigo, sessao.email);

    if (!pet) {
      return responder(
        { sucesso: false, mensagem: "Pet não encontrado ou acesso negado." },
        403
      );
    }

    const recursoTipo = arquivo.type === "application/pdf" ? "raw" : "image";
    const timestamp = Math.floor(Date.now() / 1000);
    const pasta = `orbitek-pets/documentos/${slug(tagCodigo)}`;
    const publicId = `${Date.now()}-${slug(arquivo.name.replace(/\.[^.]+$/, "")) || "documento"}`;

    const assinaturaTexto =
      `folder=${pasta}` +
      `&public_id=${publicId}` +
      `&timestamp=${timestamp}` +
      apiSecret;

    const assinatura = await hash(assinaturaTexto, "SHA-1");

    const dadosCloudinary = new FormData();
    dadosCloudinary.append("file", arquivo);
    dadosCloudinary.append("api_key", apiKey);
    dadosCloudinary.append("timestamp", String(timestamp));
    dadosCloudinary.append("signature", assinatura);
    dadosCloudinary.append("folder", pasta);
    dadosCloudinary.append("public_id", publicId);

    const respostaCloudinary = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${recursoTipo}/upload`,
      { method: "POST", body: dadosCloudinary }
    );

    const cloud = await respostaCloudinary.json();

    if (!respostaCloudinary.ok || !cloud.secure_url) {
      console.error("Cloudinary documentos:", cloud);
      return responder(
        {
          sucesso: false,
          mensagem: cloud?.error?.message || "Falha ao enviar o arquivo.",
        },
        respostaCloudinary.status || 502
      );
    }

    const resultado = await env.DB.prepare(`
      INSERT INTO documentos_pet (
        tag_codigo,
        categoria,
        titulo,
        arquivo_url,
        arquivo_tipo,
        arquivo_public_id,
        recurso_tipo,
        nome_arquivo,
        tamanho_bytes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
      .bind(
        tagCodigo,
        categoria,
        titulo,
        cloud.secure_url,
        arquivo.type,
        cloud.public_id,
        recursoTipo,
        texto(arquivo.name, 255),
        arquivo.size
      )
      .run();

    return responder(
      {
        sucesso: true,
        mensagem: "Documento enviado com sucesso.",
        id: resultado.meta?.last_row_id || null,
      },
      201
    );
  } catch (erro) {
    console.error("Erro em /api/documentos-upload:", erro);
    return responder(
      { sucesso: false, mensagem: erro.message || "Erro ao enviar documento." },
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
