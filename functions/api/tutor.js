function json(dados, status = 200) {
  return new Response(JSON.stringify(dados), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
  });
}

function obterCookie(request, nome) {
  const cookies = request.headers.get("Cookie") || "";

  for (const cookie of cookies.split(";")) {
    const [chave, ...valor] = cookie.trim().split("=");

    if (chave === nome) {
      return decodeURIComponent(valor.join("="));
    }
  }

  return null;
}

async function sha256(texto) {
  const dados = new TextEncoder().encode(texto);

  const hash = await crypto.subtle.digest(
    "SHA-256",
    dados
  );

  return [...new Uint8Array(hash)]
    .map((b) =>
      b.toString(16).padStart(2, "0")
    )
    .join("");
}

export async function onRequestGet(context) {
  try {
    const { request, env } = context;

    const token = obterCookie(
      request,
      "orbitek_sessao"
    );

    if (!token) {
      return json(
        {
          autenticado: false,
          mensagem: "Sessão inválida.",
        },
        401
      );
    }

    const tokenHash =
      await sha256(token);

    const sessao =
      await env.DB.prepare(`
        SELECT *
        FROM sessoes_tutor
        WHERE token_hash = ?
      `)
        .bind(tokenHash)
        .first();

    if (!sessao) {
      return json(
        {
          autenticado: false,
        },
        401
      );
    }

    if (
      Date.now() >
      Number(sessao.expira_em)
    ) {
      await env.DB.prepare(`
        DELETE FROM sessoes_tutor
        WHERE token_hash = ?
      `)
        .bind(tokenHash)
        .run();

      return json(
        {
          autenticado: false,
        },
        401
      );
    }

    await env.DB.prepare(`
      UPDATE sessoes_tutor
      SET ultimo_acesso = ?
      WHERE token_hash = ?
    `)
      .bind(
        Date.now(),
        tokenHash
      )
      .run();

    const pets =
      await env.DB.prepare(`
        SELECT
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
          cidade,
          estado,
          perdido,
          status,
          foto_url
        FROM pets
        WHERE email = ?
        ORDER BY data_cadastro DESC
      `)
        .bind(sessao.email)
        .all();

    const lista = pets.results.map(
      (pet) => ({
        tagCodigo:
          pet.tag_codigo,
        nome: pet.nome,
        especie: pet.especie,
        raca: pet.raca,
        sexo: pet.sexo,
        idade: pet.idade,
        comportamento:
          pet.comportamento,
        perdido:
          pet.perdido == 1,
        fotoUrl:
          pet.foto_url,
        localizacao: {
          cidade:
            pet.cidade,
          estado:
            pet.estado,
        },
      })
    );

    return json({
      sucesso: true,
      autenticado: true,

      tutor: {
        nome:
          lista[0]
            ?.nome_tutor ??
          "",
        email:
          sessao.email,
        whatsapp:
          lista[0]
            ?.whatsapp ??
          "",
      },

      pets: lista,
    });
  } catch (erro) {
    console.error(erro);

    return json(
      {
        sucesso: false,
        mensagem:
          erro.message,
      },
      500
    );
  }
}