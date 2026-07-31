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
  return sessao && Date.now() <= Number(sessao.expira_em) ? sessao : null;
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const corpo = await request.json();
    const tag = String(corpo.tag || "").trim().toUpperCase();
    const latitude = Number(corpo.latitude);
    const longitude = Number(corpo.longitude);
    const precisao = Number(corpo.precisao);

    if (!tag || !Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      return json({ sucesso: false, mensagem: "Localização inválida." }, 400);
    }

    const tagAtiva = await env.DB.prepare(`SELECT codigo FROM tags WHERE codigo = ? AND ativada = 1 AND bloqueada = 0`).bind(tag).first();
    if (!tagAtiva) return json({ sucesso: false, mensagem: "Tag ativa não encontrada." }, 404);

    const pet = await env.DB.prepare(`SELECT tag_codigo, nome, email, perdido FROM pets WHERE tag_codigo = ? LIMIT 1`).bind(tag).first();
    if (!pet) return json({ sucesso: false, mensagem: "Pet não encontrado." }, 404);

    await env.DB.prepare(`
      INSERT INTO localizacoes_pet (tag_codigo, latitude, longitude, precisao_metros, origem)
      VALUES (?, ?, ?, ?, 'perfil_publico')
    `).bind(tag, latitude, longitude, Number.isFinite(precisao) && precisao >= 0 ? precisao : null).run();

    const alerta = enviarAlerta({ env, pet, tipo: "localizacao", latitude, longitude });
    if (context.waitUntil) context.waitUntil(alerta); else await alerta;

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
      SELECT latitude, longitude, precisao_metros, criado_em
      FROM localizacoes_pet WHERE tag_codigo = ?
      ORDER BY datetime(criado_em) DESC, id DESC LIMIT 20
    `).bind(tag).all();

    return json({ sucesso: true, localizacoes: resultado.results || [] });
  } catch (erro) {
    console.error("Erro ao consultar localizações:", erro);
    return json({ sucesso: false, mensagem: "Não foi possível carregar as localizações." }, 500);
  }
}
