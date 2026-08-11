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
  return String(valor || "")
    .trim()
    .toLowerCase()
    .replace(/[\s\u00a0\u200b]+/g, "");
}

const EMAIL_SQL = `LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(email), ' ', ''), char(9), ''), char(10), ''), char(13), ''), char(160), ''), char(8203), ''))`;

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const sessao = await obterSessaoTutor(request, env);

    if (!sessao) {
      return json({
        sucesso: false,
        autenticado: false,
        mensagem: "Sua sessão expirou. Entre novamente.",
      }, 401);
    }

    const email = emailCanonico(sessao.email);

    const pets = await env.DB.prepare(`
      SELECT
        id,
        tag_codigo,
        nome,
        especie,
        raca,
        sexo,
        idade,
        comportamento,
        nome_tutor,
        whatsapp,
        email,
        cep,
        logradouro,
        cidade,
        estado,
        perdido,
        publico_perdidos,
        status,
        foto_url
      FROM pets
      WHERE ${EMAIL_SQL} = ?
      ORDER BY data_cadastro DESC, id DESC
    `)
      .bind(email)
      .all();

    const resultados = pets.results || [];

    // Corrige silenciosamente cadastros antigos com espaços/caracteres invisíveis no e-mail.
    if (resultados.some((pet) => String(pet.email || "") !== email)) {
      await env.DB.prepare(`
        UPDATE pets
        SET email = ?
        WHERE ${EMAIL_SQL} = ?
      `).bind(email, email).run().catch((erro) => {
        console.error("Não foi possível normalizar e-mail legado do tutor:", erro);
      });
    }

    const lista = resultados.map((pet) => ({
      tagCodigo: pet.tag_codigo,
      nome: pet.nome,
      especie: pet.especie,
      raca: pet.raca,
      sexo: pet.sexo,
      idade: pet.idade,
      comportamento: pet.comportamento,
      perdido: pet.perdido == 1,
      publicoPerdidos: pet.publico_perdidos == 1,
      fotoUrl: pet.foto_url,
      tutor: {
        nome: pet.nome_tutor || "",
        email,
        whatsapp: pet.whatsapp || "",
      },
      localizacao: {
        cep: pet.cep || "",
        logradouro: pet.logradouro || "",
        cidade: pet.cidade || "",
        estado: pet.estado || "",
      },
    }));

    return json({
      sucesso: true,
      autenticado: true,
      tutor: {
        nome: resultados[0]?.nome_tutor || "",
        email,
        whatsapp: resultados[0]?.whatsapp || "",
      },
      pets: lista,
    });
  } catch (erro) {
    console.error("Erro em /api/tutor:", erro);
    return json({
      sucesso: false,
      mensagem: "Não foi possível carregar os dados da sua conta.",
    }, 500);
  }
}
