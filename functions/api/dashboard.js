function json(dados, status = 200) {
  return new Response(JSON.stringify(dados), {
    status,
    headers: { "Content-Type": "application/json; charset=UTF-8" },
  });
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
  return [...new Uint8Array(hash)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function obterSessao(request, env) {
  const token = obterCookie(request, "orbitek_sessao");
  if (!token) return null;

  const tokenHash = await sha256(token);
  const sessao = await env.DB.prepare(`
    SELECT email, expira_em
    FROM sessoes_tutor
    WHERE token_hash = ?
  `).bind(tokenHash).first();

  if (!sessao || Date.now() > Number(sessao.expira_em)) {
    if (sessao) {
      await env.DB.prepare(`DELETE FROM sessoes_tutor WHERE token_hash = ?`)
        .bind(tokenHash)
        .run();
    }
    return null;
  }

  return sessao;
}

export async function onRequestGet({ request, env }) {
  try {
    const sessao = await obterSessao(request, env);
    if (!sessao) {
      return json({ sucesso: false, autenticado: false, mensagem: "Sessão inválida." }, 401);
    }

    const [resumo, recentes] = await Promise.all([
      env.DB.prepare(`
        SELECT
          COUNT(*) AS total_pets,
          COALESCE(SUM(CASE WHEN COALESCE(p.perdido, 0) = 1 THEN 1 ELSE 0 END), 0) AS pets_perdidos,
          COALESCE(SUM(CASE WHEN COALESCE(t.ativada, 0) = 1 THEN 1 ELSE 0 END), 0) AS tags_ativas,
          SUM(CASE
            WHEN strftime('%Y-%m', p.data_cadastro) = strftime('%Y-%m', 'now') THEN 1
            ELSE 0
          END) AS cadastros_mes
        FROM pets p
        LEFT JOIN tags t ON t.codigo = p.tag_codigo
        WHERE p.email = ?
      `).bind(sessao.email).first(),

      env.DB.prepare(`
        SELECT tag_codigo, nome, especie, raca, perdido, foto_url, data_cadastro
        FROM pets
        WHERE email = ?
        ORDER BY datetime(data_cadastro) DESC, id DESC
        LIMIT 3
      `).bind(sessao.email).all(),
    ]);

    return json({
      sucesso: true,
      autenticado: true,
      resumo: {
        totalPets: Number(resumo?.total_pets || 0),
        tagsAtivas: Number(resumo?.tags_ativas || 0),
        petsPerdidos: Number(resumo?.pets_perdidos || 0),
        cadastrosMes: Number(resumo?.cadastros_mes || 0),
      },
      atualizadoEm: new Date().toISOString(),
      ultimosPets: (recentes.results || []).map((pet) => ({
        tagCodigo: pet.tag_codigo,
        nome: pet.nome,
        especie: pet.especie,
        raca: pet.raca,
        perdido: pet.perdido == 1,
        fotoUrl: pet.foto_url,
        dataCadastro: pet.data_cadastro,
      })),
    });
  } catch (erro) {
    console.error("Erro no dashboard:", erro);
    return json({ sucesso: false, mensagem: "Não foi possível carregar o resumo do painel." }, 500);
  }
}
