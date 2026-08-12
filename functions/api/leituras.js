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
                    mensagem: "Tag não informada."
                },
                {
                    status: 400
                }
            );
        }

        const leituras = await db
            .prepare(`
                SELECT
                    data_hora,
                    cidade,
                    estado
                FROM leituras
                WHERE tag_codigo = ?
                ORDER BY data_hora DESC
                LIMIT 50
            `)
            .bind(codigo)
            .all();

        return Response.json({
            sucesso: true,
            quantidade: leituras.results.length,
            leituras: leituras.results
        });

    } catch (erro) {

        console.error(erro);

        return Response.json(
            {
                sucesso: false,
                mensagem: erro.message
            },
            {
                status: 500
            }
        );
    }
}