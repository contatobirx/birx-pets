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

    return Response.json(
      {
        sucesso: true,
        mensagem:
          "Tag ativada com sucesso."
      },
      {
        status: 201
      }
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