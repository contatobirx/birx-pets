export async function onRequestGet(context) {
    try {
        const db = context.env.DB;
        const url = new URL(context.request.url);

        const codigo = url.searchParams
            .get("tag")
            ?.trim()
            .toUpperCase();

        if (!codigo) {
            return Response.json(
                {
                    sucesso: false,
                    status: "codigo-ausente",
                    mensagem: "Código da tag não informado."
                },
                {
                    status: 400
                }
            );
        }

        const tag = await db
            .prepare(`
                SELECT *
                FROM tags
                WHERE codigo = ?
            `)
            .bind(codigo)
            .first();

        if (!tag) {
            return Response.json({
                sucesso: false,
                status: "nao-existe",
                mensagem: "Esta tag não existe."
            });
        }

        if (tag.bloqueada) {
            return Response.json({
                sucesso: false,
                status: "bloqueada",
                mensagem: "Esta tag está bloqueada."
            });
        }

        if (!tag.ativada) {
            return Response.json({
                sucesso: true,
                status: "nao-ativada",
                codigo
            });
        }

        const pet = await db
            .prepare(`
                SELECT *
                FROM pets
                WHERE tag_codigo = ?
                ORDER BY id DESC
                LIMIT 1
            `)
            .bind(codigo)
            .first();

        if (!pet) {
            return Response.json({
                sucesso: false,
                status: "sem-pet",
                mensagem: "Pet não encontrado."
            });
        }

        await registrarLeitura(
            db,
            context.request,
            codigo
        );

        const perdido =
            Number(pet.perdido) === 1;

        return Response.json({
            sucesso: true,
            status: perdido
                ? "perdido"
                : "ativa",
            perdido,
            pet: {
                ...pet,
                perdido: perdido
                    ? 1
                    : 0
            }
        });
    } catch (erro) {
        console.error(
            "Erro ao consultar tag:",
            erro
        );

        return Response.json(
            {
                sucesso: false,
                status: "erro",
                mensagem:
                    erro.message ||
                    "Não foi possível consultar a tag."
            },
            {
                status: 500
            }
        );
    }
}

async function registrarLeitura(
    db,
    request,
    codigo
) {
    try {
        const ip =
            request.headers.get("CF-Connecting-IP") ||
            request.headers.get("X-Forwarded-For") ||
            "";

        const userAgent =
            request.headers.get("User-Agent") ||
            "";

        const pais =
            request.cf?.country ||
            "";

        const estado =
            request.cf?.region ||
            "";

        const cidade =
            request.cf?.city ||
            "";

        const agora = new Date();

        const cincoMinutosAtras =
            new Date(
                agora.getTime() - 5 * 60 * 1000
            ).toISOString();

        const ultimaLeitura =
            await db
                .prepare(`
                    SELECT id
                    FROM leituras
                    WHERE tag_codigo = ?
                      AND ip = ?
                      AND data_hora >= ?
                    ORDER BY id DESC
                    LIMIT 1
                `)
                .bind(
                    codigo,
                    ip,
                    cincoMinutosAtras
                )
                .first();

        if (ultimaLeitura) {
            return;
        }

        await db
            .prepare(`
                INSERT INTO leituras (
                    tag_codigo,
                    data_hora,
                    ip,
                    user_agent,
                    pais,
                    estado,
                    cidade
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `)
            .bind(
                codigo,
                agora.toISOString(),
                ip,
                userAgent,
                pais,
                estado,
                cidade
            )
            .run();

    } catch (erro) {

        console.error(
            "Erro ao registrar leitura:",
            erro
        );

    }
}