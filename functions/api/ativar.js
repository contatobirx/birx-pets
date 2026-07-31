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
    const db = context.env.DB;
    const dados = await context.request.json();

    const {
      codigoTag,

      nomePet,
      especiePet,
      racaPet,
      sexoPet,
      idadePet,
      comportamentoPet,

      nomeTutor,
      whatsapp,
      email,

      cep,
      logradouro,
      bairro,
      cidade,
      estado,
      numero,
      complemento,

      fotoUrl
    } = dados;

    if (
      !codigoTag ||
      !nomePet ||
      !especiePet ||
      !nomeTutor ||
      !whatsapp ||
      !email ||
      !cep ||
      !cidade ||
      !estado ||
      !numero
    ) {
      return Response.json(
        {
          sucesso: false,
          mensagem:
            "Preencha todos os campos obrigatórios."
        },
        {
          status: 400
        }
      );
    }

    const codigoNormalizado =
      String(codigoTag)
        .trim()
        .toUpperCase();

    const emailNormalizado =
      normalizarEmail(email);

    const whatsappNormalizado =
      somenteNumeros(whatsapp);

    const cepNormalizado =
      somenteNumeros(cep);

    if (!emailValido(emailNormalizado)) {
      return Response.json(
        {
          sucesso: false,
          mensagem:
            "Informe um e-mail válido."
        },
        {
          status: 400
        }
      );
    }

    if (whatsappNormalizado.length !== 11) {
      return Response.json(
        {
          sucesso: false,
          mensagem:
            "Informe um WhatsApp válido com DDD e 11 números."
        },
        {
          status: 400
        }
      );
    }

    if (cepNormalizado.length !== 8) {
      return Response.json(
        {
          sucesso: false,
          mensagem:
            "Informe um CEP válido com 8 números."
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
      .bind(codigoNormalizado)
      .first();

    if (!tag) {
      return Response.json(
        {
          sucesso: false,
          mensagem:
            "Tag não encontrada."
        },
        {
          status: 404
        }
      );
    }

    if (tag.ativada) {
      return Response.json(
        {
          sucesso: false,
          mensagem:
            "Esta tag já foi ativada."
        },
        {
          status: 409
        }
      );
    }

    if (tag.bloqueada) {
      return Response.json(
        {
          sucesso: false,
          mensagem:
            "Esta tag está bloqueada."
        },
        {
          status: 403
        }
      );
    }

    await db
      .prepare(`
        INSERT INTO pets (
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
          bairro,
          cidade,
          estado,
          numero,
          complemento,

          foto_url,
          status
        )

        VALUES (
          ?,
          ?,?,?,?,?,?,

          ?,?,?,

          ?,?,?,?,?,?,?,

          ?,?
        )
      `)
      .bind(
        codigoNormalizado,

        String(nomePet).trim(),
        String(especiePet).trim(),
        textoOuNulo(racaPet),
        textoOuNulo(sexoPet),
        textoOuNulo(idadePet),
        textoOuNulo(comportamentoPet),

        String(nomeTutor).trim(),
        whatsappNormalizado,
        emailNormalizado,

        cepNormalizado,
        textoOuNulo(logradouro),
        textoOuNulo(bairro),
        String(cidade).trim(),
        String(estado)
          .trim()
          .toUpperCase(),
        String(numero).trim(),
        textoOuNulo(complemento),

        validarFotoUrl(fotoUrl),
        "seguro"
      )
      .run();

    await db
      .prepare(`
        UPDATE tags

        SET
          ativada = 1,
          data_ativacao = CURRENT_TIMESTAMP

        WHERE codigo = ?
      `)
      .bind(codigoNormalizado)
      .run();

    await registrarEventoTimelineSeguro(
      db,
      codigoNormalizado,
      "cadastro",
      "Pet cadastrado",
      `O perfil de ${String(nomePet).trim()} foi criado e a tag foi ativada.`,
      emailNormalizado
    );

    const agora = new Date();
    const token = gerarTokenSeguro();
    const tokenHash = await gerarHash(token);
    const sessaoExpiraEm = new Date(
      agora.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    const ip =
      context.request.headers.get("CF-Connecting-IP") ||
      context.request.headers.get("X-Forwarded-For") ||
      null;

    const userAgent =
      context.request.headers.get("User-Agent") || null;

    await db.batch([
      db.prepare(`
        DELETE FROM sessoes_tutor
        WHERE email = ?
          AND expira_em <= ?
      `).bind(emailNormalizado, agora.toISOString()),

      db.prepare(`
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
      `).bind(
        emailNormalizado,
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

    if (new URL(context.request.url).protocol === "https:") {
      cookie.push("Secure");
    }

    return respostaJson(
      {
        sucesso: true,
        mensagem: "Tag ativada com sucesso.",
        redirecionarPara: "/tutor.html",
      },
      201,
      cookie.join("; ")
    );
  } catch (erro) {
    console.error(
      "Erro ao ativar tag:",
      erro
    );

    return Response.json(
      {
        sucesso: false,
        mensagem:
          erro.message ||
          "Erro interno ao ativar a tag."
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
      mensagem:
        "Utilize POST nesta rota."
    },
    {
      status: 405
    }
  );
}

function textoOuNulo(valor) {
  const texto = String(valor || "")
    .trim();

  return texto || null;
}

function somenteNumeros(valor) {
  return String(valor || "")
    .replace(/\D/g, "");
}

function normalizarEmail(valor) {
  return String(valor || "")
    .trim()
    .toLowerCase();
}

function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    valor
  );
}

function validarFotoUrl(valor) {
  const url = String(valor || "")
    .trim();

  if (!url) {
    return null;
  }

  try {
    const endereco = new URL(url);

    if (endereco.protocol !== "https:") {
      return null;
    }

    if (
      !endereco.hostname.endsWith(
        "cloudinary.com"
      )
    ) {
      return null;
    }

    return endereco.toString();
  } catch {
    return null;
  }
}

async function registrarEventoTimelineSeguro(db, tagCodigo, tipo, titulo, descricao, criadoPor) {
  try {
    await db.prepare(`
      INSERT INTO pet_timeline (
        tag_codigo, tipo, titulo, descricao, data_evento, automatico, criado_por
      ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, 1, ?)
    `).bind(tagCodigo, tipo, titulo, descricao, criadoPor).run();
  } catch (erro) {
    console.error("Não foi possível registrar evento automático na timeline:", erro);
  }
}
