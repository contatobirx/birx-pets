import { adminAutorizado, criarCookieAdmin, limparCookieAdmin, validarChaveAdmin } from "../_lib/admin-auth.js";

const JANELA_MS = 15 * 60 * 1000;
const BLOQUEIO_MS = 30 * 60 * 1000;
const MAX_TENTATIVAS = 8;

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

async function hashTexto(valor) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(String(valor || ""))
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function ipCliente(request) {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    "desconhecido"
  );
}

async function prepararTabela(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS admin_login_tentativas (
      ip_hash TEXT PRIMARY KEY,
      tentativas INTEGER NOT NULL DEFAULT 0,
      janela_inicio INTEGER NOT NULL,
      bloqueado_ate INTEGER,
      atualizado_em INTEGER NOT NULL
    )
  `).run();
}

async function estadoTentativas(env, ipHash) {
  return env.DB.prepare(`
    SELECT tentativas, janela_inicio, bloqueado_ate
    FROM admin_login_tentativas
    WHERE ip_hash = ?
    LIMIT 1
  `)
    .bind(ipHash)
    .first();
}

async function registrarFalha(env, ipHash) {
  const agora = Date.now();
  const atual = await estadoTentativas(env, ipHash);

  if (!atual || agora - Number(atual.janela_inicio || 0) > JANELA_MS) {
    await env.DB.prepare(`
      INSERT INTO admin_login_tentativas (
        ip_hash, tentativas, janela_inicio, bloqueado_ate, atualizado_em
      ) VALUES (?, 1, ?, NULL, ?)
      ON CONFLICT(ip_hash) DO UPDATE SET
        tentativas = 1,
        janela_inicio = excluded.janela_inicio,
        bloqueado_ate = NULL,
        atualizado_em = excluded.atualizado_em
    `)
      .bind(ipHash, agora, agora)
      .run();
    return { bloqueado: false, restantes: MAX_TENTATIVAS - 1 };
  }

  const novasTentativas = Number(atual.tentativas || 0) + 1;
  const bloquear = novasTentativas >= MAX_TENTATIVAS;
  const bloqueadoAte = bloquear ? agora + BLOQUEIO_MS : null;

  await env.DB.prepare(`
    UPDATE admin_login_tentativas
    SET tentativas = ?, bloqueado_ate = ?, atualizado_em = ?
    WHERE ip_hash = ?
  `)
    .bind(novasTentativas, bloqueadoAte, agora, ipHash)
    .run();

  return {
    bloqueado: bloquear,
    restantes: Math.max(0, MAX_TENTATIVAS - novasTentativas),
    bloqueadoAte,
  };
}

async function limparFalhas(env, ipHash) {
  await env.DB.prepare(`DELETE FROM admin_login_tentativas WHERE ip_hash = ?`)
    .bind(ipHash)
    .run();
}

async function estaBloqueado(env, ipHash) {
  const atual = await estadoTentativas(env, ipHash);
  if (!atual?.bloqueado_ate) return false;

  const agora = Date.now();
  const bloqueadoAte = Number(atual.bloqueado_ate);

  if (Number.isFinite(bloqueadoAte) && bloqueadoAte > agora) {
    return bloqueadoAte;
  }

  await env.DB.prepare(`DELETE FROM admin_login_tentativas WHERE ip_hash = ?`)
    .bind(ipHash)
    .run();
  return false;
}

export async function onRequestGet({ request, env }) {
  const autenticado = await adminAutorizado(request, env);
  return json({ sucesso: true, autenticado });
}

export async function onRequestPost({ request, env }) {
  if (!env.TAG_ADMIN_TOKEN) {
    return json({ sucesso: false, mensagem: "Acesso administrativo indisponível." }, 503);
  }

  try {
    await prepararTabela(env);

    const ipHash = await hashTexto(ipCliente(request));
    const bloqueadoAte = await estaBloqueado(env, ipHash);

    if (bloqueadoAte) {
      const segundos = Math.max(1, Math.ceil((bloqueadoAte - Date.now()) / 1000));
      return json(
        {
          sucesso: false,
          mensagem: "Muitas tentativas de acesso. Tente novamente mais tarde.",
        },
        429,
        { "Retry-After": String(segundos) }
      );
    }

    const body = await request.json().catch(() => ({}));
    const valida = await validarChaveAdmin(body.chave, env);

    if (!valida) {
      const resultado = await registrarFalha(env, ipHash);
      const headers = resultado.bloqueado
        ? { "Retry-After": String(Math.ceil(BLOQUEIO_MS / 1000)) }
        : {};

      return json(
        {
          sucesso: false,
          mensagem: resultado.bloqueado
            ? "Muitas tentativas de acesso. Tente novamente mais tarde."
            : "Credencial administrativa inválida.",
        },
        resultado.bloqueado ? 429 : 401,
        headers
      );
    }

    await limparFalhas(env, ipHash);

    return json(
      { sucesso: true, autenticado: true, mensagem: "Acesso administrativo liberado." },
      200,
      { "Set-Cookie": await criarCookieAdmin(env, request) }
    );
  } catch (erro) {
    console.error("Erro em /api/admin-login:", erro);
    return json({ sucesso: false, mensagem: "Não foi possível validar o acesso administrativo." }, 500);
  }
}

export async function onRequestDelete({ request }) {
  return json(
    { sucesso: true, autenticado: false },
    200,
    { "Set-Cookie": limparCookieAdmin(request) }
  );
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  if (context.request.method === "POST") return onRequestPost(context);
  if (context.request.method === "DELETE") return onRequestDelete(context);
  return json({ sucesso: false, mensagem: "Método não permitido." }, 405);
}
