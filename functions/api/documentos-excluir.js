import { obterSessaoTutor, petPertenceAoTutor } from "../_lib/auth.js";

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

async function hash(valor, algoritmo = "SHA-256") {
  const bytes = new TextEncoder().encode(valor);
  const digest = await crypto.subtle.digest(algoritmo, bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function texto(valor, limite = 1000) {
  return String(valor ?? "").trim().slice(0, limite);
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
    INNER JOIN pets p ON UPPER(p.tag_codigo) = UPPER(d.tag_codigo)
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
    const sessao = await obterSessaoTutor(request, env);
    if (!sessao) {
      return responder({ sucesso: false, autenticado: false, mensagem: "Sua sessão expirou." }, 401);
    }

    const corpo = await request.json().catch(() => ({}));
    const id = Number.parseInt(corpo.id, 10);
    const tagCodigo = texto(corpo.tagCodigo, 100);

    if (!id || !tagCodigo) {
      return responder({ sucesso: false, mensagem: "Dados incompletos." }, 400);
    }

    const pet = await petPertenceAoTutor(env, tagCodigo, sessao.email);
    if (!pet) {
      return responder({ sucesso: false, mensagem: "Documento não encontrado." }, 404);
    }

    const documento = await documentoDoTutor(env, id, tagCodigo, sessao.email);
    if (!documento) {
      return responder({ sucesso: false, mensagem: "Documento não encontrado." }, 404);
    }

    const cloudName = env.CLOUDINARY_CLOUD_NAME;
    const apiKey = env.CLOUDINARY_API_KEY;
    const apiSecret = env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret && documento.arquivo_public_id) {
      const timestamp = Math.floor(Date.now() / 1000);
      const publicId = documento.arquivo_public_id;
      const assinatura = await hash(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`, "SHA-1");
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
        console.warn("Não foi possível remover o arquivo da Cloudinary; removendo apenas o registro.");
      }
    }

    const exclusao = await env.DB.prepare(`
      DELETE FROM documentos_pet
      WHERE id = ?
        AND UPPER(tag_codigo) = UPPER(?)
        AND EXISTS (
          SELECT 1 FROM pets p
          WHERE UPPER(p.tag_codigo) = UPPER(documentos_pet.tag_codigo)
            AND LOWER(p.email) = LOWER(?)
        )
    `)
      .bind(id, tagCodigo, sessao.email)
      .run();

    if (!exclusao.meta?.changes) {
      return responder({ sucesso: false, mensagem: "Documento não encontrado." }, 404);
    }

    return responder({ sucesso: true, mensagem: "Documento excluído com sucesso." });
  } catch (erro) {
    console.error("Erro em /api/documentos-excluir:", erro);
    return responder({ sucesso: false, mensagem: "Não foi possível excluir o documento." }, 500);
  }
}

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return responder({ sucesso: false, mensagem: "Método não permitido." }, 405, { Allow: "POST" });
  }
  return onRequestPost(context);
}
