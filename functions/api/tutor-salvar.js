const CABECALHOS_JSON = {
  "Content-Type": "application/json; charset=UTF-8",
  "Cache-Control": "no-store",
};

function responder(dados, status = 200, cabecalhosExtras = {}) {
  return new Response(JSON.stringify(dados), {
    status,
    headers: {
      ...CABECALHOS_JSON,
      ...cabecalhosExtras,
    },
  });
}

function texto(valor, limite = 255) {
  return String(valor ?? "").trim().slice(0, limite);
}

function somenteNumeros(valor) {
  return String(valor ?? "").replace(/\D/g, "");
}

function normalizarEmail(valor) {
  return texto(valor, 254).toLowerCase();
}

function obterCookies(request) {
  const cabecalho = request.headers.get("Cookie") || "";
  const cookies = {};

  for (const parte of cabecalho.split(";")) {
    const indice = parte.indexOf("=");

    if (indice === -1) continue;

    const nome = parte.slice(0, indice).trim();
    const valor = parte.slice(indice + 1).trim();

    if (!nome) continue;

    try {
      cookies[nome] = decodeURIComponent(valor);
    } catch {
      cookies[nome] = valor;
    }
  }

  return cookies;
}

function obterTokenSessao(request) {
  const cookies = obterCookies(request);

  const nomesAceitos = [
    "sessao_tutor",
    "tutor_session",
    "orbitek_session",
    "orbitek_sessao",
    "session",
  ];

  for (const nome of nomesAceitos) {
    if (cookies[nome]) return cookies[nome];
  }

  return "";
}

async function sha256Hex(valor) {
  const bytes = new TextEncoder().encode(valor);
  const hash = await crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function dataSqlAtual() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

async function obterSessao(request, env) {
  const token = obterTokenSessao(request);

  if (!token) return null;

  const tokenHash = await sha256Hex(token);
  const agora = dataSqlAtual();

  const sessao = await env.DB.prepare(`
    SELECT id, email, expira_em
    FROM sessoes_tutor
    WHERE token_hash = ?
      AND expira_em > ?
    LIMIT 1
  `)
    .bind(tokenHash, agora)
    .first();

  if (!sessao) return null;

  env.DB.prepare(`
    UPDATE sessoes_tutor
    SET ultimo_acesso = ?
    WHERE id = ?
  `)
    .bind(agora, sessao.id)
    .run()
    .catch((erro) => {
      console.error("Não foi possível atualizar ultimo_acesso:", erro);
    });

  return {
    id: sessao.id,
    email: normalizarEmail(sessao.email),
  };
}

function validarDados(body) {
  const dados = {
    tagCodigo: texto(body.tagCodigo ?? body.tag_codigo, 120),
    nome: texto(body.nome, 120),
    especie: texto(body.especie, 80),
    raca: texto(body.raca, 120),
    sexo: texto(body.sexo, 30),
    idade: texto(body.idade, 50),
    comportamento: texto(body.comportamento, 1000),
    nomeTutor: texto(body.nomeTutor ?? body.nome_tutor, 150),
    whatsapp: texto(body.whatsapp, 30),
    cep: somenteNumeros(body.cep).slice(0, 8),
    logradouro: texto(body.logradouro ?? body.endereco, 180),
    bairro: texto(body.bairro, 120),
    cidade: texto(body.cidade, 120),
    estado: texto(body.estado, 2).toUpperCase(),
    numero: texto(body.numero, 30),
    complemento: texto(body.complemento, 120),
  };

  if (!dados.tagCodigo) {
    return { erro: "A tag do pet não foi informada." };
  }

  if (!dados.nome) {
    return { erro: "Informe o nome do pet." };
  }

  if (!dados.nomeTutor) {
    return { erro: "Informe o nome do tutor." };
  }

  const whatsappNumeros = somenteNumeros(dados.whatsapp);

  if (whatsappNumeros.length < 10 || whatsappNumeros.length > 13) {
    return { erro: "Informe um WhatsApp válido, com DDD." };
  }

  if (dados.cep && dados.cep.length !== 8) {
    return { erro: "Informe um CEP válido com 8 números." };
  }

  if (dados.estado && dados.estado.length !== 2) {
    return { erro: "Informe o estado usando uma sigla com 2 letras." };
  }

  return { dados };
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    if (!env.DB) {
      return responder(
        {
          sucesso: false,
          mensagem: "O banco de dados não está configurado.",
        },
        500
      );
    }

    const sessao = await obterSessao(request, env);

    if (!sessao) {
      return responder(
        {
          sucesso: false,
          autenticado: false,
          mensagem: "Sua sessão expirou. Entre novamente.",
        },
        401
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return responder(
        {
          sucesso: false,
          mensagem: "Os dados enviados são inválidos.",
        },
        400
      );
    }

    const validacao = validarDados(body);

    if (validacao.erro) {
      return responder(
        {
          sucesso: false,
          mensagem: validacao.erro,
        },
        400
      );
    }

    const dados = validacao.dados;

    const petAtual = await env.DB.prepare(`
      SELECT id, tag_codigo, email
      FROM pets
      WHERE tag_codigo = ?
        AND LOWER(email) = LOWER(?)
      LIMIT 1
    `)
      .bind(dados.tagCodigo, sessao.email)
      .first();

    if (!petAtual) {
      return responder(
        {
          sucesso: false,
          mensagem:
            "Pet não encontrado ou você não possui permissão para editá-lo.",
        },
        403
      );
    }

    /*
     * CORREÇÃO:
     * O e-mail enviado pelo formulário é ignorado.
     * O e-mail de acesso continua sendo o da sessão autenticada.
     * Assim, o salvamento não falha caso o campo esteja vazio,
     * formatado de maneira diferente ou preenchido pelo navegador.
     */
    const resultado = await env.DB.prepare(`
      UPDATE pets
      SET
        nome = ?,
        especie = ?,
        raca = ?,
        sexo = ?,
        idade = ?,
        comportamento = ?,
        nome_tutor = ?,
        whatsapp = ?,
        cep = ?,
        logradouro = ?,
        bairro = ?,
        cidade = ?,
        estado = ?,
        numero = ?,
        complemento = ?
      WHERE id = ?
        AND LOWER(email) = LOWER(?)
    `)
      .bind(
        dados.nome,
        dados.especie,
        dados.raca,
        dados.sexo,
        dados.idade,
        dados.comportamento,
        dados.nomeTutor,
        dados.whatsapp,
        dados.cep,
        dados.logradouro,
        dados.bairro,
        dados.cidade,
        dados.estado,
        dados.numero,
        dados.complemento,
        petAtual.id,
        sessao.email
      )
      .run();

    if (!resultado.success) {
      throw new Error("O banco de dados não confirmou a atualização.");
    }

    return responder({
      sucesso: true,
      mensagem: "Informações atualizadas com sucesso.",
      pet: {
        tagCodigo: dados.tagCodigo,
      },
    });
  } catch (erro) {
    console.error("Erro em /api/tutor-salvar:", erro);

    return responder(
      {
        sucesso: false,
        mensagem: "Não foi possível salvar as informações neste momento.",
      },
      500
    );
  }
}

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return responder(
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

  return onRequestPost(context);
}
