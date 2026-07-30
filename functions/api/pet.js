export async function onRequestGet(context) {
    try {
        const db = context.env.DB;

        const url = new URL(context.request.url);

        const codigoTag = url.searchParams
            .get("tag")
            ?.trim()
            .toUpperCase();

        if (!codigoTag) {
            return Response.json(
                {
                    sucesso: false,
                    statusTag: "codigo-ausente",
                    mensagem: "Código da tag não informado."
                },
                {
                    status: 400
                }
            );
        }

        const tag = await db
            .prepare(
                `
                SELECT
                    codigo,
                    ativada,
                    bloqueada
                FROM tags
                WHERE codigo = ?
                `
            )
            .bind(codigoTag)
            .first();

        if (!tag) {
            return Response.json(
                {
                    sucesso: false,
                    statusTag: "nao-encontrada",
                    mensagem: "Esta tag não existe."
                },
                {
                    status: 404
                }
            );
        }

        if (tag.bloqueada === 1) {
            return Response.json(
                {
                    sucesso: false,
                    statusTag: "bloqueada",
                    mensagem: "Esta tag está bloqueada."
                },
                {
                    status: 403
                }
            );
        }

        if (tag.ativada !== 1) {
            return Response.json(
                {
                    sucesso: false,
                    statusTag: "nao-ativada",
                    mensagem: "Esta tag ainda não foi ativada.",
                    codigoTag: tag.codigo
                },
                {
                    status: 200
                }
            );
        }

        const pet = await db
            .prepare(
                `
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
                    cidade,
                    status
                FROM pets
                WHERE tag_codigo = ?
                `
            )
            .bind(codigoTag)
            .first();

        if (!pet) {
            return Response.json(
                {
                    sucesso: false,
                    statusTag: "sem-perfil",
                    mensagem:
                        "A tag está ativa, mas o perfil do pet não foi encontrado."
                },
                {
                    status: 404
                }
            );
        }

        return Response.json(
            {
                sucesso: true,
                statusTag: "ativa",
                pet: {
                    codigoTag: pet.tag_codigo,
                    nome: pet.nome,
                    especie: pet.especie,
                    raca: pet.raca,
                    sexo: pet.sexo,
                    idade: pet.idade,
                    comportamento: pet.comportamento,
                    nomeTutor: pet.nome_tutor,
                    whatsapp: pet.whatsapp,
                    cidade: pet.cidade,
                    status: pet.status
                }
            },
            {
                status: 200
            }
        );
    } catch (erro) {
        console.error(
            "Erro ao consultar o perfil do pet:",
            erro
        );

        return Response.json(
            {
                sucesso: false,
                statusTag: "erro",
                mensagem:
                    "Não foi possível consultar esta tag.",
                detalhe:
                    erro instanceof Error
                        ? erro.message
                        : "Erro desconhecido."
            },
            {
                status: 500
            }
        );
    }
}

export async function onRequestPost() {
    return Response.json(
        {
            sucesso: false,
            mensagem: "Utilize GET nesta rota."
        },
        {
            status: 405,
            headers: {
                Allow: "GET"
            }
        }
    );
}