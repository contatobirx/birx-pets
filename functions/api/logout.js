function respostaJson(dados, status = 200, headersExtras = {}) {
  return new Response(
    JSON.stringify(dados),
    {
      status,
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        ...headersExtras,
      },
    }
  );
}

function obterCookie(request, nome) {
  const cabecalhoCookie =
    request.headers.get("Cookie") || "";

  const cookies = cabecalhoCookie
    .split(";")
    .map((cookie) => cookie.trim());

  for (const cookie of cookies) {
    const indiceIgual = cookie.indexOf("=");

    if (indiceIgual === -1) {
      continue;
    }

    const chave = cookie.slice(0, indiceIgual);
    const valor = cookie.slice(indiceIgual + 1);

    if (chave === nome) {
      return decodeURIComponent(valor);
    }
  }

  return null;
}

async function gerarHashSha256(valor) {
  const dados = new TextEncoder().encode(valor);

  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    dados
  );

  return Array.from(
    new Uint8Array(hashBuffer)
  )
    .map((byte) =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    const token = obterCookie(
      request,
      "orbitek_sessao"
    );

    if (token) {
      const tokenHash =
        await gerarHashSha256(token);

      await env.DB.prepare(
        `
          DELETE FROM sessoes_tutor
          WHERE token_hash = ?
        `
      )
        .bind(tokenHash)
        .run();
    }

    const usaHttps =
      new URL(request.url).protocol === "https:";

    const cookieExpirado = [
      "orbitek_sessao=",
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      "Max-Age=0",
      usaHttps ? "Secure" : "",
    ]
      .filter(Boolean)
      .join("; ");

    return respostaJson(
      {
        sucesso: true,
        mensagem: "Sessão encerrada com sucesso.",
      },
      200,
      {
        "Set-Cookie": cookieExpirado,
      }
    );
  } catch (erro) {
    console.error("Erro ao realizar logout:", erro);

    return respostaJson(
      {
        sucesso: false,
        mensagem:
          "Não foi possível encerrar a sessão.",
      },
      500
    );
  }
}

export function onRequestGet() {
  return respostaJson(
    {
      sucesso: false,
      mensagem: "Método não permitido.",
    },
    405,
    {
      Allow: "POST",
    }
  );
}