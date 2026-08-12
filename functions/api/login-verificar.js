function respostaJson(dados, status = 200, cookie = null) {
  const headers = new Headers({
    "Content-Type": "application/json; charset=UTF-8",
    "Cache-Control": "no-store",
  });

  if (cookie) {
    headers.append("Set-Cookie", cookie);
  }

  return new Response(JSON.stringify(dados), {
    status,
    headers,
  });
}

function normalizarEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function codigoValido(codigo) {
  return /^\d{6}$/.test(String(codigo || "").trim());
}

async function gerarHash(texto) {
  const dados = new TextEncoder().encode(texto);
  const hash = await crypto.subtle.digest("SHA-256", dados);

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function gerarTokenSeguro() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);

  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    let corpo;

    try {
      corpo = await request.json();
    } catch {
      return respostaJson(
        {
          sucesso: false,
          mensagem: "Dados enviados em formato inválido.",
        },
        400
      );
    }

    const email = normalizarEmail(corpo.email);
    const codigo = String(corpo.codigo || "").trim();

    if (!email || !codigo) {
      return respostaJson(
        {
          sucesso: false,
          mensagem: "Informe o e-mail e o código de acesso.",
        },
        400
      );
    }

    if (!emailValido(email)) {
      return respostaJson(
        {
          sucesso: false,
          mensagem: "Informe um e-mail válido.",
        },
        400
      );
    }

    if (!codigoValido(codigo)) {
      return respostaJson(
        {
          sucesso: false,
          mensagem: "O código deve ter 6 números.",
        },
        400
      );
    }

    const registro = await env.DB.prepare(
      `
      SELECT
        id,
        email,
        codigo_hash,
        criado_em,
        expira_em,
        usado,
        tentativas
      FROM codigos_login
      WHERE email = ?
        AND usado = 0
      ORDER BY id DESC
      LIMIT 1
      `
    )
      .bind(email)
      .first();

    if (!registro) {
      return respostaJson(
        {
          sucesso: false,
          mensagem: "Código não encontrado. Solicite um novo código.",
        },
        404
      );
    }

    if (Number(registro.tentativas || 0) >= 5) {
      await env.DB.prepare(
        `
        UPDATE codigos_login
        SET usado = 1
        WHERE id = ?
        `
      )
        .bind(registro.id)
        .run();

      return respostaJson(
        {
          sucesso: false,
          mensagem: "Código bloqueado após muitas tentativas. Solicite outro.",
        },
        429
      );
    }

    const agora = new Date();
    const expiraEm = new Date(registro.expira_em);

    if (
      Number.isNaN(expiraEm.getTime()) ||
      agora.getTime() > expiraEm.getTime()
    ) {
      await env.DB.prepare(
        `
        UPDATE codigos_login
        SET usado = 1
        WHERE id = ?
        `
      )
        .bind(registro.id)
        .run();

      return respostaJson(
        {
          sucesso: false,
          mensagem: "O código expirou. Solicite um novo código.",
        },
        410
      );
    }

    const codigoHash = await gerarHash(codigo);

    if (codigoHash !== registro.codigo_hash) {
      await env.DB.prepare(
        `
        UPDATE codigos_login
        SET tentativas = tentativas + 1
        WHERE id = ?
        `
      )
        .bind(registro.id)
        .run();

      const tentativasRestantes = Math.max(
        0,
        4 - Number(registro.tentativas || 0)
      );

      return respostaJson(
        {
          sucesso: false,
          mensagem:
            tentativasRestantes > 0
              ? `Código incorreto. Restam ${tentativasRestantes} tentativa(s).`
              : "Código bloqueado. Solicite um novo código.",
        },
        401
      );
    }

    const pet = await env.DB.prepare(
      `
      SELECT id, nome, nome_tutor, email
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
          mensagem: "Conta não encontrada.",
        },
        404
      );
    }

    const token = gerarTokenSeguro();
    const tokenHash = await gerarHash(token);

    const sessaoExpiraEm = new Date(
      agora.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    const ip =
      request.headers.get("CF-Connecting-IP") ||
      request.headers.get("X-Forwarded-For") ||
      null;

    const userAgent = request.headers.get("User-Agent") || null;

    await env.DB.batch([
      env.DB.prepare(
        `
        UPDATE codigos_login
        SET usado = 1
        WHERE id = ?
        `
      ).bind(registro.id),

      env.DB.prepare(
        `
        DELETE FROM sessoes_tutor
        WHERE email = ?
          AND expira_em <= ?
        `
      ).bind(email, agora.toISOString()),

      env.DB.prepare(
        `
        INSERT INTO sessoes_tutor (
          email,
          token_hash,
          criado_em,
          expira_em,
          ultimo_acesso,
          ip,
          user_agent,
          provedor
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 'email')
        `
      ).bind(
        email,
        tokenHash,
        agora.toISOString(),
        sessaoExpiraEm.toISOString(),
        agora.toISOString(),
        ip,
        userAgent
      ),
    ]);

    const cookie = [
      `orbitek_sessao=${token}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      `Max-Age=${30 * 24 * 60 * 60}`,
    ];

    if (new URL(request.url).protocol === "https:") {
      cookie.push("Secure");
    }

    return respostaJson(
      {
        sucesso: true,
        mensagem: "Login realizado com sucesso.",
        tutor: {
          nome: pet.nome_tutor,
          email: pet.email,
        },
        redirecionarPara: "/tutor.html",
      },
      200,
      cookie.join("; ")
    );
  } catch (erro) {
    console.error("Erro ao verificar login:", erro);

    return respostaJson(
      {
        sucesso: false,
        mensagem: "Não foi possível verificar o código de acesso.",
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
    405
  );
}
