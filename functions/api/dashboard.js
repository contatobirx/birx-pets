import { obterSessaoTutor } from "../_lib/auth.js";

function json(dados, status = 200) {
  return new Response(JSON.stringify(dados), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-store",
    },
  });
}

function emailCanonico(valor) {
  return String(valor || "").trim().toLowerCase().replace(/[\s\u00a0\u200b]+/g, "");
}

const EMAIL_SQL = `LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(p.email), ' ', ''), char(9), ''), char(10), ''), char(13), ''), char(160), ''), char(8203), ''))`;
const EMAIL_SQL_RECENTES = `LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(email), ' ', ''), char(9), ''), char(10), ''), char(13), ''), char(160), ''), char(8203), ''))`;

export async function onRequestGet({ request, env }) {
  try {
    const sessao = await obterSessaoTutor(request, env);
    if (!sessao) {
      return json({ sucesso: false, autenticado: false, mensagem: "Sua sessão expirou. Entre novamente." }, 401);
    }

    const email = emailCanonico(sessao.email);

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
        WHERE ${EMAIL_SQL} = ?
      `).bind(email).first(),

      env.DB.prepare(`
        SELECT tag_codigo, nome, especie, raca, perdido, foto_url, data_cadastro
        FROM pets
        WHERE ${EMAIL_SQL_RECENTES} = ?
        ORDER BY datetime(data_cadastro) DESC, id DESC
        LIMIT 3
      `).bind(email).all(),
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
