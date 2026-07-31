function json(dados, status = 200) {
  return Response.json(dados, { status, headers: { "Cache-Control": "no-store" } });
}

function cookie(request, nome) {
  for (const parte of (request.headers.get("Cookie") || "").split(";")) {
    const [chave, ...valor] = parte.trim().split("=");
    if (chave === nome) return decodeURIComponent(valor.join("="));
  }
  return null;
}

async function sessaoTutor(request, env) {
  const token = cookie(request, "orbitek_sessao");
  if (!token) return null;
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  const tokenHash = [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
  const sessao = await env.DB.prepare(`SELECT email, expira_em FROM sessoes_tutor WHERE token_hash = ?`).bind(tokenHash).first();
  return sessao && Date.now() <= Number(sessao.expira_em) ? sessao : null;
}

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const cidade = String(url.searchParams.get("cidade") || "").trim();
    const especie = String(url.searchParams.get("especie") || "").trim();
    const resultado = await env.DB.prepare(`
      SELECT p.tag_codigo, p.nome, p.especie, p.raca, p.sexo, p.foto_url,
             p.bairro, p.cidade, p.estado, p.comportamento,
             ROUND(l.latitude, 2) AS latitude_aproximada,
             ROUND(l.longitude, 2) AS longitude_aproximada,
             l.criado_em AS localizado_em
      FROM pets p
      LEFT JOIN localizacoes_pet l ON l.id = (
        SELECT id FROM localizacoes_pet
        WHERE tag_codigo = p.tag_codigo
        ORDER BY datetime(criado_em) DESC, id DESC LIMIT 1
      )
      WHERE p.perdido = 1 AND p.publico_perdidos = 1
        AND (? = '' OR LOWER(p.cidade) = LOWER(?))
        AND (? = '' OR LOWER(p.especie) = LOWER(?))
      ORDER BY COALESCE(l.criado_em, p.data_cadastro) DESC
      LIMIT 100
    `).bind(cidade, cidade, especie, especie).all();

    return json({ sucesso: true, pets: (resultado.results || []).map((pet) => ({
      tag: pet.tag_codigo, nome: pet.nome, especie: pet.especie, raca: pet.raca,
      sexo: pet.sexo, fotoUrl: pet.foto_url, bairro: pet.bairro, cidade: pet.cidade,
      estado: pet.estado, observacoes: pet.comportamento,
      latitudeAproximada: pet.latitude_aproximada,
      longitudeAproximada: pet.longitude_aproximada,
      localizadoEm: pet.localizado_em
    })) });
  } catch (erro) {
    console.error("Erro ao listar pets perdidos:", erro);
    return json({ sucesso: false, mensagem: "Não foi possível carregar os animais perdidos." }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const sessao = await sessaoTutor(request, env);
    if (!sessao) return json({ sucesso: false, autenticado: false }, 401);
    const corpo = await request.json();
    const tag = String(corpo.tag || "").trim().toUpperCase();
    const publicar = corpo.publicar;
    if (!tag || typeof publicar !== "boolean") return json({ sucesso: false, mensagem: "Dados inválidos." }, 400);

    const pet = await env.DB.prepare(`SELECT perdido FROM pets WHERE tag_codigo = ? AND LOWER(email) = LOWER(?)`).bind(tag, sessao.email).first();
    if (!pet) return json({ sucesso: false, mensagem: "Pet não encontrado." }, 404);
    if (publicar && Number(pet.perdido) !== 1) return json({ sucesso: false, mensagem: "Ative o modo perdido antes de publicar." }, 409);

    await env.DB.prepare(`UPDATE pets SET publico_perdidos = ? WHERE tag_codigo = ? AND LOWER(email) = LOWER(?)`).bind(publicar ? 1 : 0, tag, sessao.email).run();
    return json({ sucesso: true, publicoPerdidos: publicar, mensagem: publicar ? "Pet publicado no diretório de perdidos." : "Pet removido do diretório público." });
  } catch (erro) {
    console.error("Erro ao alterar diretório público:", erro);
    return json({ sucesso: false, mensagem: "Não foi possível atualizar a publicação." }, 500);
  }
}
