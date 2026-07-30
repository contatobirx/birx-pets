function respostaJson(dados, status = 200) {
  return new Response(
    JSON.stringify(dados),
    {
      status,
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        "Cache-Control": "no-store",
      },
    }
  );
}

function obterCookie(request, nome) {
  const cabecalho =
    request.headers.get("Cookie") || "";

  const cookies = cabecalho
    .split(";")
    .map((cookie) => cookie.trim());

  for (const cookie of cookies) {
    const indiceIgual =
      cookie.indexOf("=");

    if (indiceIgual === -1) {
      continue;
    }

    const chave =
      cookie.slice(0, indiceIgual);

    const valor =
      cookie.slice(indiceIgual + 1);

    if (chave === nome) {
      return decodeURIComponent(valor);
    }
  }

  return null;
}

async function gerarHashSha256(valor) {
  const dados =
    new TextEncoder().encode(valor);

  const hashBuffer =
    await crypto.subtle.digest(
      "SHA-256",
      dados
    );

  return Array.from(
    new Uint8Array(hashBuffer)
  )
    .map((byte) =>
      byte
        .toString(16)
        .padStart(2, "0")
    )
    .join("");
}

function sessaoExpirada(expiraEm) {
  if (!expiraEm) {
    return true;
  }

  const comoNumero =
    Number(expiraEm);

  if (
    Number.isFinite(comoNumero) &&
    comoNumero > 0
  ) {
    return Date.now() > comoNumero;
  }

  const comoData =
    Date.parse(expiraEm);

  if (Number.isNaN(comoData)) {
    return true;
  }

  return Date.now() > comoData;
}

async function validarSessao(
  request,
  env
) {
  const token = obterCookie(
    request,
    "orbitek_sessao"
  );

  if (!token) {
    return null;
  }

  const tokenHash =
    await gerarHashSha256(token);

  const sessao =
    await env.DB.prepare(
      `
        SELECT
          id,
          email,
          token_hash,
          expira_em
        FROM sessoes_tutor
        WHERE token_hash = ?
        LIMIT 1
      `
    )
      .bind(tokenHash)
      .first();

  if (!sessao) {
    return null;
  }

  if (
    sessaoExpirada(
      sessao.expira_em
    )
  ) {
    await env.DB.prepare(
      `
        DELETE FROM sessoes_tutor
        WHERE token_hash = ?
      `
    )
      .bind(tokenHash)
      .run();

    return null;
  }

  await env.DB.prepare(
    `
      UPDATE sessoes_tutor
      SET ultimo_acesso = CURRENT_TIMESTAMP
      WHERE token_hash = ?
    `
  )
    .bind(tokenHash)
    .run();

  return {
    email: sessao.email,
    tokenHash,
  };
}

export async function onRequestPost(
  context
) {
  try {
    const {
      request,
      env,
    } = context;

    const sessao =
      await validarSessao(
        request,
        env
      );

    if (!sessao) {
      return respostaJson(
        {
          sucesso: false,
          autenticado: false,
          mensagem:
            "Sua sessão expirou. Entre novamente.",
        },
        401
      );
    }

    let corpo;

    try {
      corpo = await request.json();
    } catch {
      return respostaJson(
        {
          sucesso: false,
          mensagem:
            "O corpo da requisição é inválido.",
        },
        400
      );
    }

    const tagCodigo =
      String(
        corpo.tagCodigo ??
        corpo.tag ??
        ""
      ).trim();

    const perdido =
      corpo.perdido;

    if (!tagCodigo) {
      return respostaJson(
        {
          sucesso: false,
          mensagem:
            "O código da tag é obrigatório.",
        },
        400
      );
    }

    if (
      typeof perdido !== "boolean"
    ) {
      return respostaJson(
        {
          sucesso: false,
          mensagem:
            "O estado do modo perdido é inválido.",
        },
        400
      );
    }

    const pet =
      await env.DB.prepare(
        `
          SELECT
            tag_codigo,
            nome,
            email,
            perdido
          FROM pets
          WHERE tag_codigo = ?
            AND LOWER(email) = LOWER(?)
          LIMIT 1
        `
      )
        .bind(
          tagCodigo,
          sessao.email
        )
        .first();

    if (!pet) {
      return respostaJson(
        {
          sucesso: false,
          mensagem:
            "Pet não encontrado ou não vinculado à sua conta.",
        },
        404
      );
    }

    await env.DB.prepare(
      `
        UPDATE pets
        SET perdido = ?
        WHERE tag_codigo = ?
          AND LOWER(email) = LOWER(?)
      `
    )
      .bind(
        perdido ? 1 : 0,
        tagCodigo,
        sessao.email
      )
      .run();

    return respostaJson({
      sucesso: true,
      autenticado: true,
      mensagem: perdido
        ? "Modo perdido ativado com sucesso."
        : "Pet marcado como encontrado.",
      pet: {
        tagCodigo,
        nome: pet.nome,
        perdido,
      },
    });
  } catch (erro) {
    console.error(
      "Erro ao alterar modo perdido:",
      erro
    );

    return respostaJson(
      {
        sucesso: false,
        mensagem:
          "Não foi possível atualizar o modo perdido.",
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
    405
  );
}