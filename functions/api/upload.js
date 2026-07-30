export async function onRequestPost(context) {
    try {
        const {
            CLOUDINARY_CLOUD_NAME,
            CLOUDINARY_API_KEY,
            CLOUDINARY_API_SECRET
        } = context.env;

        if (
            !CLOUDINARY_CLOUD_NAME ||
            !CLOUDINARY_API_KEY ||
            !CLOUDINARY_API_SECRET
        ) {
            return Response.json(
                {
                    sucesso: false,
                    mensagem: "Credenciais da Cloudinary não configuradas."
                },
                {
                    status: 500
                }
            );
        }

        const formulario =
            await context.request.formData();

        const arquivo =
            formulario.get("foto");

        const codigoTag =
            String(
                formulario.get("codigoTag") || ""
            )
                .trim()
                .toUpperCase();

        if (
            !arquivo ||
            typeof arquivo.arrayBuffer !== "function"
        ) {
            return Response.json(
                {
                    sucesso: false,
                    mensagem: "Nenhuma foto foi enviada."
                },
                {
                    status: 400
                }
            );
        }

        if (!codigoTag) {
            return Response.json(
                {
                    sucesso: false,
                    mensagem: "Código da tag não informado."
                },
                {
                    status: 400
                }
            );
        }

        const tiposPermitidos = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!tiposPermitidos.includes(arquivo.type)) {
            return Response.json(
                {
                    sucesso: false,
                    mensagem:
                        "Envie uma imagem JPG, PNG ou WEBP."
                },
                {
                    status: 400
                }
            );
        }

        const tamanhoMaximo =
            5 * 1024 * 1024;

        if (arquivo.size > tamanhoMaximo) {
            return Response.json(
                {
                    sucesso: false,
                    mensagem:
                        "A foto deve ter no máximo 5 MB."
                },
                {
                    status: 400
                }
            );
        }

        const timestamp =
            Math.floor(Date.now() / 1000);

        const publicId =
            limparCodigo(codigoTag);

        const pasta =
            "orbitek-pets";

        const stringAssinatura =
            `folder=${pasta}` +
            `&overwrite=true` +
            `&public_id=${publicId}` +
            `&timestamp=${timestamp}` +
            CLOUDINARY_API_SECRET;

        const assinatura =
            await gerarSha1(
                stringAssinatura
            );

        const formularioCloudinary =
            new FormData();

        formularioCloudinary.append(
            "file",
            arquivo
        );

        formularioCloudinary.append(
            "api_key",
            CLOUDINARY_API_KEY
        );

        formularioCloudinary.append(
            "timestamp",
            String(timestamp)
        );

        formularioCloudinary.append(
            "signature",
            assinatura
        );

        formularioCloudinary.append(
            "folder",
            pasta
        );

        formularioCloudinary.append(
            "public_id",
            publicId
        );

        formularioCloudinary.append(
            "overwrite",
            "true"
        );

        const respostaCloudinary =
            await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: "POST",
                    body: formularioCloudinary
                }
            );

        const resultadoCloudinary =
            await respostaCloudinary.json();

        if (!respostaCloudinary.ok) {
            console.error(
                "Erro Cloudinary:",
                resultadoCloudinary
            );

            return Response.json(
                {
                    sucesso: false,
                    mensagem:
                        resultadoCloudinary
                            ?.error
                            ?.message ||
                        "Não foi possível enviar a foto."
                },
                {
                    status: respostaCloudinary.status
                }
            );
        }

        return Response.json(
            {
                sucesso: true,
                fotoUrl:
                    resultadoCloudinary.secure_url,
                publicId:
                    resultadoCloudinary.public_id
            },
            {
                status: 201
            }
        );
    } catch (erro) {
        console.error(
            "Erro no upload:",
            erro
        );

        return Response.json(
            {
                sucesso: false,
                mensagem:
                    erro.message ||
                    "Erro interno ao enviar a foto."
            },
            {
                status: 500
            }
        );
    }
}

export async function onRequestGet() {
    return Response.json(
        {
            sucesso: false,
            mensagem: "Utilize POST nesta rota."
        },
        {
            status: 405
        }
    );
}

function limparCodigo(valor) {
    return valor
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, "-");
}

async function gerarSha1(valor) {
    const dados =
        new TextEncoder().encode(valor);

    const hash =
        await crypto.subtle.digest(
            "SHA-1",
            dados
        );

    return Array.from(
        new Uint8Array(hash)
    )
        .map(
            byte =>
                byte
                    .toString(16)
                    .padStart(2, "0")
        )
        .join("");
}