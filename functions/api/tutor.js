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

    const pets = await env.DB.prepare(`
      SELECT
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
      WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))
      ORDER BY data_cadastro DESC
    `)
      .bind(sessao.email)
      .all();

    const resultados = pets.results || [];
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
        email: String(pet.email || sessao.email).trim(),
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
        email: sessao.email,
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
