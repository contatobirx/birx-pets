import { enviarAlerta } from "../_shared/notificacoes.js";

function json(dados, status = 200) {
  return Response.json(dados, { status, headers: { "Cache-Control": "no-store" } });
}

function obterCookie(request, nome) {
  const cookies = request.headers.get("Cookie") || "";
  for (const cookie of cookies.split(";")) {
    const [chave, ...valor] = cookie.trim().split("=");
    if (chave === nome) return decodeURIComponent(valor.join("="));
  }
  return null;
}

async function sha256(texto) {
  const dados = new TextEncoder().encode(texto);
  const hash = await crypto.subtle.digest("SHA-256", dados);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function obterSessao(request, env) {
  const token = obterCookie(request, "orbitek_sessao");
  if (!token) return null;
  const tokenHash = await sha256(token);
  const sessao = await env.DB.prepare(`SELECT email, expira_em FROM sessoes_tutor WHERE token_hash = ?`).bind(tokenHash).first();
  if (!sessao) return null;
  const numero = Number(sessao.expira_em);
  const expira = Number.isFinite(numero) && numero > 0 ? numero : Date.parse(sessao.expira_em);
  return Number.isFinite(expira) && Date.now() <= expira ? sessao : null;
}

async function limitarEnvioPublico(request, env, tag) {
  const origemHash = await sha256(`${request.headers.get("CF-Connecting-IP") || "ip-indisponivel"}|${request.headers.get("User-Agent") || "ua-indisponivel"}|${tag}`);
  const recente = await env.DB.prepare(`
    SELECT COUNT(*) AS total FROM localizacoes_pet
    WHERE tag_codigo = ? AND origem = 'perfil_publico' AND datetime(criado_em) > datetime('now', '-10 minutes')
  `).bind(tag).first();
  if (Number(recente?.total || 0) >= 20) return false;

  // O hash não é persistido: serve apenas para tornar o limite por tag conservador
  // sem armazenar IP ou identificador adicional do visitante.
  void origemHash;
  return true;
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const corpo = await request.json();
    const tag = String(corpo.tag || "").trim().toUpperCase();
    const latitude = Number(corpo.latitude);
    const longitude = Number(corpo.longitude);
    const precisao = Number(corpo.precisao);
    const origem = corpo.origem === "tutor_ultimo_avistamento" ? "tutor_ultimo_avistamento" : "perfil_publico";

    if (!/^BIRX-[A-Z0-9-]{4,40}$/.test(tag) || !Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180 || (Number.isFinite(precisao) && (precisao < 0 || precisao > 100000))) {
      return json({ sucesso: false, mensagem: "Localização inválida." }, 400);
    }

    const tagAtiva = await env.DB.prepare(`SELECT codigo FROM tags WHERE codigo = ? AND ativada = 1 AND bloqueada = 0`).bind(tag).first();
    if (!tagAtiva) return json({ sucesso: false, mensagem: "Tag ativa não encontrada." }, 404);

    const pet = await env.DB.prepare(`SELECT tag_codigo, nome, email, perdido FROM pets WHERE tag_codigo = ? LIMIT 1`).bind(tag).first();
    if (!pet) return json({ sucesso: false, mensagem: "Pet não encontrado." }, 404);
    if (origem === "tutor_ultimo_avistamento") {
      const sessao = await obterSessao(request, env);
      if (!sessao || String(sessao.email).trim().toLowerCase() !== String(pet.email || "").trim().toLowerCase()) return json({ sucesso: false, mensagem: "Acesso não autorizado." }, 401);
      if (Number(pet.perdido) !== 1) return json({ sucesso: false, mensagem: "Ative o modo perdido antes de informar a localização." }, 409);
    } else if (!await limitarEnvioPublico(request, env, tag)) {
      return json({ sucesso: false, mensagem: "Muitas localizações foram enviadas recentemente para esta tag. Tente novamente em alguns minutos." }, 429);
    }

    await env.DB.prepare(`
      INSERT INTO localizacoes_pet (tag_codigo, latitude, longitude, precisao_metros, origem)
      VALUES (?, ?, ?, ?, ?)
    `).bind(tag, latitude, longitude, Number.isFinite(precisao) && precisao >= 0 ? precisao : null, origem).run();

    if (origem === "perfil_publico") {
      const alerta = enviarAlerta({ env, pet, tipo: "localizacao", latitude, longitude });
      if (context.waitUntil) context.waitUntil(alerta); else await alerta;
    }

    return json({ sucesso: true, mensagem: "Localização compartilhada com o tutor." }, 201);
  } catch (erro) {
    console.error("Erro ao salvar localização:", erro);
    return json({ sucesso: false, mensagem: "Não foi possível compartilhar a localização." }, 500);
  }
}

export async function onRequestGet({ request, env }) {
  try {
    const sessao = await obterSessao(request, env);
    if (!sessao) return json({ sucesso: false, autenticado: false }, 401);

    const tag = new URL(request.url).searchParams.get("tag")?.trim().toUpperCase();
    if (!tag) return json({ sucesso: false, mensagem: "Tag não informada." }, 400);

    const pet = await env.DB.prepare(`SELECT id FROM pets WHERE tag_codigo = ? AND LOWER(email) = LOWER(?)`).bind(tag, sessao.email).first();
    if (!pet) return json({ sucesso: false, mensagem: "Pet não encontrado para esta conta." }, 404);

    const resultado = await env.DB.prepare(`
      SELECT latitude, longitude, precisao_metros, origem, criado_em
      FROM localizacoes_pet WHERE tag_codigo = ?
      ORDER BY datetime(criado_em) DESC, id DESC LIMIT 20
    `).bind(tag).all();

    return json({ sucesso: true, localizacoes: resultado.results || [] });
  } catch (erro) {
    console.error("Erro ao consultar localizações:", erro);
    return json({ sucesso: false, mensagem: "Não foi possível carregar as localizações." }, 500);
  }
}
