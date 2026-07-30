function respostaJson(dados, status = 200) {
  return new Response(JSON.stringify(dados), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-store",
    },
  });
}

function normalizarEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(email);
}

function gerarCodigo() {
  const numeros = new Uint32Array(1);

  crypto.getRandomValues(numeros);

  return String(
    100000 + (numeros[0] % 900000)
  );
}

async function gerarHash(texto) {
  const dados =
    new TextEncoder().encode(texto);

  const hash =
    await crypto.subtle.digest(
      "SHA-256",
      dados
    );

  return Array.from(
    new Uint8Array(hash)
  )
    .map((byte) =>
      byte
        .toString(16)
        .padStart(2, "0")
    )
    .join("");
}

function escaparHtml(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function enviarEmailResend({
  apiKey,
  remetente,
  destinatario,
  codigo,
  nomeTutor,
}) {
  const nomeSeguro =
    escaparHtml(
      nomeTutor || "Tutor"
    );

  const resposta = await fetch(
    "https://api.resend.com/emails",
    {
      method: "POST",
      headers: {
        Authorization:
          `Bearer ${apiKey}`,
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        from: remetente,
        to: [destinatario],
        subject:
          "Seu código de acesso | Orbitek Pets",
        html: `
          <!DOCTYPE html>
          <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
          </head>

          <body
            style="
              margin:0;
              padding:24px;
              background:#f4f5fb;
              font-family:Arial,sans-serif;
              color:#252337;
            "
          >
            <div
              style="
                max-width:520px;
                margin:0 auto;
                background:#ffffff;
                border-radius:20px;
                padding:32px;
                text-align:center;
              "
            >
              <p
                style="
                  margin:0 0 18px;
                  color:#6c4cf1;
                  font-size:14px;
                  font-weight:bold;
                  letter-spacing:1px;
                  text-transform:uppercase;
                "
              >
                Orbitek Pets
              </p>

              <h1
                style="
                  margin:0;
                  font-size:26px;
                  line-height:1.25;
                "
              >
                Seu código de acesso
              </h1>

              <p
                style="
                  margin:18px 0 0;
                  color:#747187;
                  line-height:1.6;
                "
              >
                Olá, ${nomeSeguro}.
                Use o código abaixo para acessar
                o painel do seu pet.
              </p>

              <div
                style="
                  margin:28px 0;
                  padding:20px;
                  border-radius:16px;
                  background:#edeafd;
                  color:#5135c9;
                  font-size:34px;
                  font-weight:bold;
                  letter-spacing:8px;
                "
              >
                ${codigo}
              </div>

              <p
                style="
                  margin:0;
                  color:#747187;
                  font-size:14px;
                  line-height:1.6;
                "
              >
                Este código expira em 10 minutos.
                Não compartilhe com ninguém.
              </p>

              <p
                style="
                  margin:26px 0 0;
                  color:#9a97a8;
                  font-size:12px;
                "
              >
                Caso você não tenha solicitado este código,
                ignore este e-mail.
              </p>
            </div>
          </body>
          </html>
        `,
        text:
          `Olá, ${nomeTutor || "Tutor"}.\n\n` +
          `Seu código de acesso à Orbitek Pets é: ${codigo}\n\n` +
          `Este código expira em 10 minutos.\n` +
          `Não compartilhe este código com ninguém.`,
      }),
    }
  );

  const dados = await resposta.json();

  if (!resposta.ok) {
    const mensagem =
      dados?.message ||
      dados?.error?.message ||
      "O Resend recusou o envio do e-mail.";

    throw new Error(mensagem);
  }

  return dados;
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    console.log(
  "RESEND:",
  !!env.RESEND_API_KEY
);

console.log(
  "REMETENTE:",
  env.EMAIL_REMETENTE
);

    let corpo;

    try {
      corpo = await request.json();
    } catch {
      return respostaJson(
        {
          sucesso: false,
          mensagem:
            "Dados enviados em formato inválido.",
        },
        400
      );
    }

    const email =
      normalizarEmail(corpo.email);

    if (!email) {
      return respostaJson(
        {
          sucesso: false,
          mensagem:
            "Informe o e-mail.",
        },
        400
      );
    }

    if (!emailValido(email)) {
      return respostaJson(
        {
          sucesso: false,
          mensagem:
            "Informe um e-mail válido.",
        },
        400
      );
    }

    const pet = await env.DB.prepare(
      `
        SELECT
          id,
          nome,
          nome_tutor,
          email
        FROM pets
        WHERE LOWER(email) = ?
        LIMIT 1
      `
    )
      .bind(email)
      .first();

    if (!pet) {
      return respostaJson(
        {
          sucesso: false,
          mensagem:
            "Nenhuma conta foi encontrada com esse e-mail.",
        },
        404
      );
    }

    const agora = new Date();

    const expiraEm =
      new Date(
        agora.getTime() +
        10 * 60 * 1000
      );

    const codigo =
      gerarCodigo();

    const codigoHash =
      await gerarHash(codigo);

    const ip =
      request.headers.get(
        "CF-Connecting-IP"
      ) ||
      request.headers.get(
        "X-Forwarded-For"
      ) ||
      null;

    await env.DB.prepare(
      `
        UPDATE codigos_login
        SET usado = 1
        WHERE email = ?
          AND usado = 0
      `
    )
      .bind(email)
      .run();

    const resultadoInsercao =
      await env.DB.prepare(
        `
          INSERT INTO codigos_login (
            email,
            codigo_hash,
            criado_em,
            expira_em,
            usado,
            tentativas,
            ip
          )
          VALUES (?, ?, ?, ?, 0, 0, ?)
        `
      )
        .bind(
          email,
          codigoHash,
          agora.toISOString(),
          expiraEm.toISOString(),
          ip
        )
        .run();

    const idCodigo =
      resultadoInsercao.meta
        ?.last_row_id;

    if (!env.RESEND_API_KEY) {
      console.log(
        "RESEND_API_KEY não configurada."
      );

      console.log(
        `Código de desenvolvimento: ${codigo}`
      );

      return respostaJson({
        sucesso: true,
        mensagem:
          "Código gerado em modo de desenvolvimento.",
        expiraEm:
          expiraEm.toISOString(),
        codigoDesenvolvimento:
          codigo,
      });
    }

    const remetente =
      env.EMAIL_REMETENTE ||
      "Orbitek Pets <onboarding@resend.dev>";

    try {
      const envio =
        await enviarEmailResend({
          apiKey:
            env.RESEND_API_KEY,
          remetente,
          destinatario:
            email,
          codigo,
          nomeTutor:
            pet.nome_tutor,
        });

      console.log(
        "E-mail enviado pelo Resend:",
        envio.id
      );
    } catch (erroEnvio) {
      console.error(
        "Erro no envio pelo Resend:",
        erroEnvio
      );

      if (idCodigo) {
        await env.DB.prepare(
          `
            UPDATE codigos_login
            SET usado = 1
            WHERE id = ?
          `
        )
          .bind(idCodigo)
          .run();
      }

      return respostaJson(
        {
          sucesso: false,
          mensagem:
            erroEnvio.message ||
            "Não foi possível enviar o código por e-mail.",
        },
        502
      );
    }

    return respostaJson({
      sucesso: true,
      mensagem:
        "Código enviado para o seu e-mail.",
      expiraEm:
        expiraEm.toISOString(),
    });
  } catch (erro) {
    console.error(
      "Erro ao solicitar login:",
      erro
    );

    return respostaJson(
      {
        sucesso: false,
        mensagem:
          "Não foi possível gerar o código de acesso.",
      },
      500
    );
  }
}

export function onRequestGet() {
  return respostaJson(
    {
      sucesso: false,
      mensagem:
        "Método não permitido.",
    },
    405,
    {
      Allow: "POST",
    }
  );
}