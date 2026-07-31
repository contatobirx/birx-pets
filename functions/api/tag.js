import { enviarAlerta } from "../_shared/notificacoes.js";

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

        if (codigo === "DEMO") {
            return Response.json({
                sucesso: true,
                status: "ativa",
                demonstracao: true,
                perdido: false,
                pet: {
                    nome: "Bento",
                    especie: "Cachorro",
                    raca: "Shih-tzu",
                    sexo: "Macho",
                    idade: "3 anos",
                    comportamento: "Sou dócil e amigável. Aproxime-se com calma e fale comigo pelo nome.",
                    nome_tutor: "Perfil demonstrativo",
                    bairro: "Centro",
                    cidade: "São Paulo",
                    estado: "SP",
                    foto_url: "/assets/menor.png",
                    perdido: 0
                }
            });
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

        const novaLeitura = await registrarLeitura(
            db,
            context.request,
            codigo
        );

        if (novaLeitura && !(await acessoDoProprioTutor(db, context.request, pet.email))) {
            const alerta = enviarAlerta({ env: context.env, pet, tipo: "leitura", cidade: context.request.cf?.city || "", estado: context.request.cf?.region || "" });
            if (context.waitUntil) context.waitUntil(alerta); else await alerta;
        }

        const perdido =
            Number(pet.perdido) === 1;

        let fotos = [];
        if (perdido) {
            const galeria = await db.prepare(`SELECT url FROM pet_fotos WHERE tag_codigo = ? ORDER BY ordem, id LIMIT 4`).bind(codigo).all();
            fotos = [pet.foto_url, ...(galeria.results || []).map((foto) => foto.url)].filter((url, indice, lista) => url && lista.indexOf(url) === indice).slice(0, 5);
        }

        return Response.json({
            sucesso: true,
            status: perdido
                ? "perdido"
                : "ativa",
            perdido,
            pet: {
                ...pet,
                fotos,
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
            return false;
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

        return true;

    } catch (erro) {

        console.error(
            "Erro ao registrar leitura:",
            erro
        );
        return false;
    }
}

async function acessoDoProprioTutor(db, request, emailTutor) {
    try {
        const cookies = request.headers.get("Cookie") || "";
        const token = cookies.split(";").map((item) => item.trim()).find((item) => item.startsWith("orbitek_sessao="))?.slice("orbitek_sessao=".length);
        if (!token || !emailTutor) return false;
        const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(decodeURIComponent(token)));
        const tokenHash = [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
        const sessao = await db.prepare(`SELECT email FROM sessoes_tutor WHERE token_hash = ? LIMIT 1`).bind(tokenHash).first();
        return String(sessao?.email || "").trim().toLowerCase() === String(emailTutor).trim().toLowerCase();
    } catch {
        return false;
    }
}
