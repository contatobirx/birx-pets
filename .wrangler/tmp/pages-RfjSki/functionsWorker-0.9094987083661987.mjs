var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// api/ativar.js
async function onRequestPost(context) {
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
    if (!codigoTag || !nomePet || !especiePet || !nomeTutor || !whatsapp || !email || !cep || !cidade || !estado || !numero) {
      return Response.json(
        {
          sucesso: false,
          mensagem: "Preencha todos os campos obrigat\xF3rios."
        },
        {
          status: 400
        }
      );
    }
    const codigoNormalizado = String(codigoTag).trim().toUpperCase();
    const emailNormalizado = normalizarEmail(email);
    const whatsappNormalizado = somenteNumeros(whatsapp);
    const cepNormalizado = somenteNumeros(cep);
    if (!emailValido(emailNormalizado)) {
      return Response.json(
        {
          sucesso: false,
          mensagem: "Informe um e-mail v\xE1lido."
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
          mensagem: "Informe um WhatsApp v\xE1lido com DDD e 11 n\xFAmeros."
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
          mensagem: "Informe um CEP v\xE1lido com 8 n\xFAmeros."
        },
        {
          status: 400
        }
      );
    }
    const tag = await db.prepare(`
        SELECT *
        FROM tags
        WHERE codigo = ?
      `).bind(codigoNormalizado).first();
    if (!tag) {
      return Response.json(
        {
          sucesso: false,
          mensagem: "Tag n\xE3o encontrada."
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
          mensagem: "Esta tag j\xE1 foi ativada."
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
          mensagem: "Esta tag est\xE1 bloqueada."
        },
        {
          status: 403
        }
      );
    }
    await db.prepare(`
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
      `).bind(
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
      String(estado).trim().toUpperCase(),
      String(numero).trim(),
      textoOuNulo(complemento),
      validarFotoUrl(fotoUrl),
      "seguro"
    ).run();
    await db.prepare(`
        UPDATE tags

        SET
          ativada = 1,
          data_ativacao = CURRENT_TIMESTAMP

        WHERE codigo = ?
      `).bind(codigoNormalizado).run();
    return Response.json(
      {
        sucesso: true,
        mensagem: "Tag ativada com sucesso."
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
        mensagem: erro.message || "Erro interno ao ativar a tag."
      },
      {
        status: 500
      }
    );
  }
}
__name(onRequestPost, "onRequestPost");
async function onRequestGet() {
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
__name(onRequestGet, "onRequestGet");
function textoOuNulo(valor) {
  const texto = String(valor || "").trim();
  return texto || null;
}
__name(textoOuNulo, "textoOuNulo");
function somenteNumeros(valor) {
  return String(valor || "").replace(/\D/g, "");
}
__name(somenteNumeros, "somenteNumeros");
function normalizarEmail(valor) {
  return String(valor || "").trim().toLowerCase();
}
__name(normalizarEmail, "normalizarEmail");
function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    valor
  );
}
__name(emailValido, "emailValido");
function validarFotoUrl(valor) {
  const url = String(valor || "").trim();
  if (!url) {
    return null;
  }
  try {
    const endereco = new URL(url);
    if (endereco.protocol !== "https:") {
      return null;
    }
    if (!endereco.hostname.endsWith(
      "cloudinary.com"
    )) {
      return null;
    }
    return endereco.toString();
  } catch {
    return null;
  }
}
__name(validarFotoUrl, "validarFotoUrl");

// api/leituras.js
async function onRequestGet2(context) {
  try {
    const db = context.env.DB;
    const url = new URL(context.request.url);
    const codigo = url.searchParams.get("tag")?.trim().toUpperCase();
    if (!codigo) {
      return Response.json(
        {
          sucesso: false,
          mensagem: "Tag n\xE3o informada."
        },
        {
          status: 400
        }
      );
    }
    const leituras = await db.prepare(`
                SELECT
                    data_hora,
                    cidade,
                    estado
                FROM leituras
                WHERE tag_codigo = ?
                ORDER BY data_hora DESC
                LIMIT 50
            `).bind(codigo).all();
    return Response.json({
      sucesso: true,
      quantidade: leituras.results.length,
      leituras: leituras.results
    });
  } catch (erro) {
    console.error(erro);
    return Response.json(
      {
        sucesso: false,
        mensagem: erro.message
      },
      {
        status: 500
      }
    );
  }
}
__name(onRequestGet2, "onRequestGet");

// api/login-solicitar.js
function respostaJson(dados, status = 200) {
  return new Response(JSON.stringify(dados), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-store"
    }
  });
}
__name(respostaJson, "respostaJson");
function normalizarEmail2(email) {
  return String(email || "").trim().toLowerCase();
}
__name(normalizarEmail2, "normalizarEmail");
function emailValido2(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
__name(emailValido2, "emailValido");
function gerarCodigo() {
  const numeros = new Uint32Array(1);
  crypto.getRandomValues(numeros);
  return String(1e5 + numeros[0] % 9e5);
}
__name(gerarCodigo, "gerarCodigo");
async function gerarHash(texto) {
  const dados = new TextEncoder().encode(texto);
  const hash = await crypto.subtle.digest("SHA-256", dados);
  return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
__name(gerarHash, "gerarHash");
async function onRequestPost2(context) {
  try {
    const { request, env } = context;
    let corpo;
    try {
      corpo = await request.json();
    } catch {
      return respostaJson(
        {
          sucesso: false,
          mensagem: "Dados enviados em formato inv\xE1lido."
        },
        400
      );
    }
    const email = normalizarEmail2(corpo.email);
    if (!email) {
      return respostaJson(
        {
          sucesso: false,
          mensagem: "Informe o e-mail."
        },
        400
      );
    }
    if (!emailValido2(email)) {
      return respostaJson(
        {
          sucesso: false,
          mensagem: "Informe um e-mail v\xE1lido."
        },
        400
      );
    }
    const pet = await env.DB.prepare(
      `
      SELECT id, nome, nome_tutor, email
      FROM pets
      WHERE LOWER(email) = ?
      LIMIT 1
      `
    ).bind(email).first();
    if (!pet) {
      return respostaJson(
        {
          sucesso: false,
          mensagem: "Nenhuma conta foi encontrada com esse e-mail."
        },
        404
      );
    }
    const agora = /* @__PURE__ */ new Date();
    const expiraEm = new Date(agora.getTime() + 10 * 60 * 1e3);
    const codigo = gerarCodigo();
    const codigoHash = await gerarHash(codigo);
    const ip = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || null;
    await env.DB.prepare(
      `
      UPDATE codigos_login
      SET usado = 1
      WHERE email = ?
        AND usado = 0
      `
    ).bind(email).run();
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
    ).bind(
      email,
      codigoHash,
      agora.toISOString(),
      expiraEm.toISOString(),
      ip
    ).run();
    console.log("======================================");
    console.log("C\xD3DIGO DE LOGIN ORBITEK PETS");
    console.log(`E-mail: ${email}`);
    console.log(`C\xF3digo: ${codigo}`);
    console.log(`Expira em: ${expiraEm.toISOString()}`);
    console.log("======================================");
    return respostaJson({
      sucesso: true,
      mensagem: "C\xF3digo de acesso gerado com sucesso.",
      expiraEm: expiraEm.toISOString(),
      // Somente para desenvolvimento.
      codigoDesenvolvimento: codigo
    });
  } catch (erro) {
    console.error("Erro ao solicitar login:", erro);
    return respostaJson(
      {
        sucesso: false,
        mensagem: "N\xE3o foi poss\xEDvel gerar o c\xF3digo de acesso."
      },
      500
    );
  }
}
__name(onRequestPost2, "onRequestPost");
function onRequestGet3() {
  return respostaJson(
    {
      sucesso: false,
      mensagem: "M\xE9todo n\xE3o permitido."
    },
    405
  );
}
__name(onRequestGet3, "onRequestGet");

// api/login-verificar.js
function respostaJson2(dados, status = 200, cookie = null) {
  const headers = new Headers({
    "Content-Type": "application/json; charset=UTF-8",
    "Cache-Control": "no-store"
  });
  if (cookie) {
    headers.append("Set-Cookie", cookie);
  }
  return new Response(JSON.stringify(dados), {
    status,
    headers
  });
}
__name(respostaJson2, "respostaJson");
function normalizarEmail3(email) {
  return String(email || "").trim().toLowerCase();
}
__name(normalizarEmail3, "normalizarEmail");
function emailValido3(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
__name(emailValido3, "emailValido");
function codigoValido(codigo) {
  return /^\d{6}$/.test(String(codigo || "").trim());
}
__name(codigoValido, "codigoValido");
async function gerarHash2(texto) {
  const dados = new TextEncoder().encode(texto);
  const hash = await crypto.subtle.digest("SHA-256", dados);
  return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
__name(gerarHash2, "gerarHash");
function gerarTokenSeguro() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
__name(gerarTokenSeguro, "gerarTokenSeguro");
async function onRequestPost3(context) {
  try {
    const { request, env } = context;
    let corpo;
    try {
      corpo = await request.json();
    } catch {
      return respostaJson2(
        {
          sucesso: false,
          mensagem: "Dados enviados em formato inv\xE1lido."
        },
        400
      );
    }
    const email = normalizarEmail3(corpo.email);
    const codigo = String(corpo.codigo || "").trim();
    if (!email || !codigo) {
      return respostaJson2(
        {
          sucesso: false,
          mensagem: "Informe o e-mail e o c\xF3digo de acesso."
        },
        400
      );
    }
    if (!emailValido3(email)) {
      return respostaJson2(
        {
          sucesso: false,
          mensagem: "Informe um e-mail v\xE1lido."
        },
        400
      );
    }
    if (!codigoValido(codigo)) {
      return respostaJson2(
        {
          sucesso: false,
          mensagem: "O c\xF3digo deve ter 6 n\xFAmeros."
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
    ).bind(email).first();
    if (!registro) {
      return respostaJson2(
        {
          sucesso: false,
          mensagem: "C\xF3digo n\xE3o encontrado. Solicite um novo c\xF3digo."
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
      ).bind(registro.id).run();
      return respostaJson2(
        {
          sucesso: false,
          mensagem: "C\xF3digo bloqueado ap\xF3s muitas tentativas. Solicite outro."
        },
        429
      );
    }
    const agora = /* @__PURE__ */ new Date();
    const expiraEm = new Date(registro.expira_em);
    if (Number.isNaN(expiraEm.getTime()) || agora.getTime() > expiraEm.getTime()) {
      await env.DB.prepare(
        `
        UPDATE codigos_login
        SET usado = 1
        WHERE id = ?
        `
      ).bind(registro.id).run();
      return respostaJson2(
        {
          sucesso: false,
          mensagem: "O c\xF3digo expirou. Solicite um novo c\xF3digo."
        },
        410
      );
    }
    const codigoHash = await gerarHash2(codigo);
    if (codigoHash !== registro.codigo_hash) {
      await env.DB.prepare(
        `
        UPDATE codigos_login
        SET tentativas = tentativas + 1
        WHERE id = ?
        `
      ).bind(registro.id).run();
      const tentativasRestantes = Math.max(
        0,
        4 - Number(registro.tentativas || 0)
      );
      return respostaJson2(
        {
          sucesso: false,
          mensagem: tentativasRestantes > 0 ? `C\xF3digo incorreto. Restam ${tentativasRestantes} tentativa(s).` : "C\xF3digo bloqueado. Solicite um novo c\xF3digo."
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
    ).bind(email).first();
    if (!pet) {
      return respostaJson2(
        {
          sucesso: false,
          mensagem: "Conta n\xE3o encontrada."
        },
        404
      );
    }
    const token = gerarTokenSeguro();
    const tokenHash = await gerarHash2(token);
    const sessaoExpiraEm = new Date(
      agora.getTime() + 30 * 24 * 60 * 60 * 1e3
    );
    const ip = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || null;
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
          user_agent
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `
      ).bind(
        email,
        tokenHash,
        agora.toISOString(),
        sessaoExpiraEm.toISOString(),
        agora.toISOString(),
        ip,
        userAgent
      )
    ]);
    const cookie = [
      `orbitek_sessao=${token}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      `Max-Age=${30 * 24 * 60 * 60}`
    ];
    if (new URL(request.url).protocol === "https:") {
      cookie.push("Secure");
    }
    return respostaJson2(
      {
        sucesso: true,
        mensagem: "Login realizado com sucesso.",
        tutor: {
          nome: pet.nome_tutor,
          email: pet.email
        },
        redirecionarPara: "/tutor.html"
      },
      200,
      cookie.join("; ")
    );
  } catch (erro) {
    console.error("Erro ao verificar login:", erro);
    return respostaJson2(
      {
        sucesso: false,
        mensagem: "N\xE3o foi poss\xEDvel verificar o c\xF3digo de acesso."
      },
      500
    );
  }
}
__name(onRequestPost3, "onRequestPost");
function onRequestGet4() {
  return respostaJson2(
    {
      sucesso: false,
      mensagem: "M\xE9todo n\xE3o permitido."
    },
    405
  );
}
__name(onRequestGet4, "onRequestGet");

// api/logout.js
function respostaJson3(dados, status = 200, headersExtras = {}) {
  return new Response(
    JSON.stringify(dados),
    {
      status,
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        ...headersExtras
      }
    }
  );
}
__name(respostaJson3, "respostaJson");
function obterCookie(request, nome) {
  const cabecalhoCookie = request.headers.get("Cookie") || "";
  const cookies = cabecalhoCookie.split(";").map((cookie) => cookie.trim());
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
__name(obterCookie, "obterCookie");
async function gerarHashSha256(valor) {
  const dados = new TextEncoder().encode(valor);
  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    dados
  );
  return Array.from(
    new Uint8Array(hashBuffer)
  ).map(
    (byte) => byte.toString(16).padStart(2, "0")
  ).join("");
}
__name(gerarHashSha256, "gerarHashSha256");
async function onRequestPost4(context) {
  try {
    const { request, env } = context;
    const token = obterCookie(
      request,
      "orbitek_sessao"
    );
    if (token) {
      const tokenHash = await gerarHashSha256(token);
      await env.DB.prepare(
        `
          DELETE FROM sessoes_tutor
          WHERE token_hash = ?
        `
      ).bind(tokenHash).run();
    }
    const usaHttps = new URL(request.url).protocol === "https:";
    const cookieExpirado = [
      "orbitek_sessao=",
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      "Max-Age=0",
      usaHttps ? "Secure" : ""
    ].filter(Boolean).join("; ");
    return respostaJson3(
      {
        sucesso: true,
        mensagem: "Sess\xE3o encerrada com sucesso."
      },
      200,
      {
        "Set-Cookie": cookieExpirado
      }
    );
  } catch (erro) {
    console.error("Erro ao realizar logout:", erro);
    return respostaJson3(
      {
        sucesso: false,
        mensagem: "N\xE3o foi poss\xEDvel encerrar a sess\xE3o."
      },
      500
    );
  }
}
__name(onRequestPost4, "onRequestPost");
function onRequestGet5() {
  return respostaJson3(
    {
      sucesso: false,
      mensagem: "M\xE9todo n\xE3o permitido."
    },
    405,
    {
      Allow: "POST"
    }
  );
}
__name(onRequestGet5, "onRequestGet");

// api/pet.js
async function onRequestGet6(context) {
  try {
    const db = context.env.DB;
    const url = new URL(context.request.url);
    const codigoTag = url.searchParams.get("tag")?.trim().toUpperCase();
    if (!codigoTag) {
      return Response.json(
        {
          sucesso: false,
          statusTag: "codigo-ausente",
          mensagem: "C\xF3digo da tag n\xE3o informado."
        },
        {
          status: 400
        }
      );
    }
    const tag = await db.prepare(
      `
                SELECT
                    codigo,
                    ativada,
                    bloqueada
                FROM tags
                WHERE codigo = ?
                `
    ).bind(codigoTag).first();
    if (!tag) {
      return Response.json(
        {
          sucesso: false,
          statusTag: "nao-encontrada",
          mensagem: "Esta tag n\xE3o existe."
        },
        {
          status: 404
        }
      );
    }
    if (tag.bloqueada === 1) {
      return Response.json(
        {
          sucesso: false,
          statusTag: "bloqueada",
          mensagem: "Esta tag est\xE1 bloqueada."
        },
        {
          status: 403
        }
      );
    }
    if (tag.ativada !== 1) {
      return Response.json(
        {
          sucesso: false,
          statusTag: "nao-ativada",
          mensagem: "Esta tag ainda n\xE3o foi ativada.",
          codigoTag: tag.codigo
        },
        {
          status: 200
        }
      );
    }
    const pet = await db.prepare(
      `
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
                    cidade,
                    status
                FROM pets
                WHERE tag_codigo = ?
                `
    ).bind(codigoTag).first();
    if (!pet) {
      return Response.json(
        {
          sucesso: false,
          statusTag: "sem-perfil",
          mensagem: "A tag est\xE1 ativa, mas o perfil do pet n\xE3o foi encontrado."
        },
        {
          status: 404
        }
      );
    }
    return Response.json(
      {
        sucesso: true,
        statusTag: "ativa",
        pet: {
          codigoTag: pet.tag_codigo,
          nome: pet.nome,
          especie: pet.especie,
          raca: pet.raca,
          sexo: pet.sexo,
          idade: pet.idade,
          comportamento: pet.comportamento,
          nomeTutor: pet.nome_tutor,
          whatsapp: pet.whatsapp,
          cidade: pet.cidade,
          status: pet.status
        }
      },
      {
        status: 200
      }
    );
  } catch (erro) {
    console.error(
      "Erro ao consultar o perfil do pet:",
      erro
    );
    return Response.json(
      {
        sucesso: false,
        statusTag: "erro",
        mensagem: "N\xE3o foi poss\xEDvel consultar esta tag.",
        detalhe: erro instanceof Error ? erro.message : "Erro desconhecido."
      },
      {
        status: 500
      }
    );
  }
}
__name(onRequestGet6, "onRequestGet");
async function onRequestPost5() {
  return Response.json(
    {
      sucesso: false,
      mensagem: "Utilize GET nesta rota."
    },
    {
      status: 405,
      headers: {
        Allow: "GET"
      }
    }
  );
}
__name(onRequestPost5, "onRequestPost");

// api/tag.js
async function onRequestGet7(context) {
  try {
    const db = context.env.DB;
    const url = new URL(context.request.url);
    const codigo = url.searchParams.get("tag")?.trim().toUpperCase();
    if (!codigo) {
      return Response.json(
        {
          sucesso: false,
          status: "codigo-ausente",
          mensagem: "C\xF3digo da tag n\xE3o informado."
        },
        {
          status: 400
        }
      );
    }
    const tag = await db.prepare(`
                SELECT *
                FROM tags
                WHERE codigo = ?
            `).bind(codigo).first();
    if (!tag) {
      return Response.json({
        sucesso: false,
        status: "nao-existe",
        mensagem: "Esta tag n\xE3o existe."
      });
    }
    if (tag.bloqueada) {
      return Response.json({
        sucesso: false,
        status: "bloqueada",
        mensagem: "Esta tag est\xE1 bloqueada."
      });
    }
    if (!tag.ativada) {
      return Response.json({
        sucesso: true,
        status: "nao-ativada",
        codigo
      });
    }
    const pet = await db.prepare(`
                SELECT *
                FROM pets
                WHERE tag_codigo = ?
                ORDER BY id DESC
                LIMIT 1
            `).bind(codigo).first();
    if (!pet) {
      return Response.json({
        sucesso: false,
        status: "sem-pet",
        mensagem: "Pet n\xE3o encontrado."
      });
    }
    await registrarLeitura(
      db,
      context.request,
      codigo
    );
    const perdido = Number(pet.perdido) === 1;
    return Response.json({
      sucesso: true,
      status: perdido ? "perdido" : "ativa",
      perdido,
      pet: {
        ...pet,
        perdido: perdido ? 1 : 0
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
        mensagem: erro.message || "N\xE3o foi poss\xEDvel consultar a tag."
      },
      {
        status: 500
      }
    );
  }
}
__name(onRequestGet7, "onRequestGet");
async function registrarLeitura(db, request, codigo) {
  try {
    const ip = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "";
    const userAgent = request.headers.get("User-Agent") || "";
    const pais = request.cf?.country || "";
    const estado = request.cf?.region || "";
    const cidade = request.cf?.city || "";
    const agora = /* @__PURE__ */ new Date();
    const cincoMinutosAtras = new Date(
      agora.getTime() - 5 * 60 * 1e3
    ).toISOString();
    const ultimaLeitura = await db.prepare(`
                    SELECT id
                    FROM leituras
                    WHERE tag_codigo = ?
                      AND ip = ?
                      AND data_hora >= ?
                    ORDER BY id DESC
                    LIMIT 1
                `).bind(
      codigo,
      ip,
      cincoMinutosAtras
    ).first();
    if (ultimaLeitura) {
      return;
    }
    await db.prepare(`
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
            `).bind(
      codigo,
      agora.toISOString(),
      ip,
      userAgent,
      pais,
      estado,
      cidade
    ).run();
  } catch (erro) {
    console.error(
      "Erro ao registrar leitura:",
      erro
    );
  }
}
__name(registrarLeitura, "registrarLeitura");

// api/tutor.js
function json(dados, status = 200) {
  return new Response(JSON.stringify(dados), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    }
  });
}
__name(json, "json");
function obterCookie2(request, nome) {
  const cookies = request.headers.get("Cookie") || "";
  for (const cookie of cookies.split(";")) {
    const [chave, ...valor] = cookie.trim().split("=");
    if (chave === nome) {
      return decodeURIComponent(valor.join("="));
    }
  }
  return null;
}
__name(obterCookie2, "obterCookie");
async function sha256(texto) {
  const dados = new TextEncoder().encode(texto);
  const hash = await crypto.subtle.digest(
    "SHA-256",
    dados
  );
  return [...new Uint8Array(hash)].map(
    (b) => b.toString(16).padStart(2, "0")
  ).join("");
}
__name(sha256, "sha256");
async function onRequestGet8(context) {
  try {
    const { request, env } = context;
    const token = obterCookie2(
      request,
      "orbitek_sessao"
    );
    if (!token) {
      return json(
        {
          autenticado: false,
          mensagem: "Sess\xE3o inv\xE1lida."
        },
        401
      );
    }
    const tokenHash = await sha256(token);
    const sessao = await env.DB.prepare(`
        SELECT *
        FROM sessoes_tutor
        WHERE token_hash = ?
      `).bind(tokenHash).first();
    if (!sessao) {
      return json(
        {
          autenticado: false
        },
        401
      );
    }
    if (Date.now() > Number(sessao.expira_em)) {
      await env.DB.prepare(`
        DELETE FROM sessoes_tutor
        WHERE token_hash = ?
      `).bind(tokenHash).run();
      return json(
        {
          autenticado: false
        },
        401
      );
    }
    await env.DB.prepare(`
      UPDATE sessoes_tutor
      SET ultimo_acesso = ?
      WHERE token_hash = ?
    `).bind(
      Date.now(),
      tokenHash
    ).run();
    const pets = await env.DB.prepare(`
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
      `).bind(sessao.email).all();
    const lista = pets.results.map(
      (pet) => ({
        tagCodigo: pet.tag_codigo,
        nome: pet.nome,
        especie: pet.especie,
        raca: pet.raca,
        sexo: pet.sexo,
        idade: pet.idade,
        comportamento: pet.comportamento,
        perdido: pet.perdido == 1,
        fotoUrl: pet.foto_url,
        localizacao: {
          cidade: pet.cidade,
          estado: pet.estado
        }
      })
    );
    return json({
      sucesso: true,
      autenticado: true,
      tutor: {
        nome: lista[0]?.nome_tutor ?? "",
        email: sessao.email,
        whatsapp: lista[0]?.whatsapp ?? ""
      },
      pets: lista
    });
  } catch (erro) {
    console.error(erro);
    return json(
      {
        sucesso: false,
        mensagem: erro.message
      },
      500
    );
  }
}
__name(onRequestGet8, "onRequestGet");

// api/upload.js
async function onRequestPost6(context) {
  try {
    const {
      CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET
    } = context.env;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      return Response.json(
        {
          sucesso: false,
          mensagem: "Credenciais da Cloudinary n\xE3o configuradas."
        },
        {
          status: 500
        }
      );
    }
    const formulario = await context.request.formData();
    const arquivo = formulario.get("foto");
    const codigoTag = String(
      formulario.get("codigoTag") || ""
    ).trim().toUpperCase();
    if (!arquivo || typeof arquivo.arrayBuffer !== "function") {
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
          mensagem: "C\xF3digo da tag n\xE3o informado."
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
          mensagem: "Envie uma imagem JPG, PNG ou WEBP."
        },
        {
          status: 400
        }
      );
    }
    const tamanhoMaximo = 5 * 1024 * 1024;
    if (arquivo.size > tamanhoMaximo) {
      return Response.json(
        {
          sucesso: false,
          mensagem: "A foto deve ter no m\xE1ximo 5 MB."
        },
        {
          status: 400
        }
      );
    }
    const timestamp = Math.floor(Date.now() / 1e3);
    const publicId = limparCodigo(codigoTag);
    const pasta = "orbitek-pets";
    const stringAssinatura = `folder=${pasta}&overwrite=true&public_id=${publicId}&timestamp=${timestamp}` + CLOUDINARY_API_SECRET;
    const assinatura = await gerarSha1(
      stringAssinatura
    );
    const formularioCloudinary = new FormData();
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
    const respostaCloudinary = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formularioCloudinary
      }
    );
    const resultadoCloudinary = await respostaCloudinary.json();
    if (!respostaCloudinary.ok) {
      console.error(
        "Erro Cloudinary:",
        resultadoCloudinary
      );
      return Response.json(
        {
          sucesso: false,
          mensagem: resultadoCloudinary?.error?.message || "N\xE3o foi poss\xEDvel enviar a foto."
        },
        {
          status: respostaCloudinary.status
        }
      );
    }
    return Response.json(
      {
        sucesso: true,
        fotoUrl: resultadoCloudinary.secure_url,
        publicId: resultadoCloudinary.public_id
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
        mensagem: erro.message || "Erro interno ao enviar a foto."
      },
      {
        status: 500
      }
    );
  }
}
__name(onRequestPost6, "onRequestPost");
async function onRequestGet9() {
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
__name(onRequestGet9, "onRequestGet");
function limparCodigo(valor) {
  return valor.toLowerCase().replace(/[^a-z0-9-_]/g, "-");
}
__name(limparCodigo, "limparCodigo");
async function gerarSha1(valor) {
  const dados = new TextEncoder().encode(valor);
  const hash = await crypto.subtle.digest(
    "SHA-1",
    dados
  );
  return Array.from(
    new Uint8Array(hash)
  ).map(
    (byte) => byte.toString(16).padStart(2, "0")
  ).join("");
}
__name(gerarSha1, "gerarSha1");

// ../.wrangler/tmp/pages-RfjSki/functionsRoutes-0.5806473918738733.mjs
var routes = [
  {
    routePath: "/api/ativar",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/ativar",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/leituras",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/login-solicitar",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet3]
  },
  {
    routePath: "/api/login-solicitar",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/login-verificar",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet4]
  },
  {
    routePath: "/api/login-verificar",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/logout",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet5]
  },
  {
    routePath: "/api/logout",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost4]
  },
  {
    routePath: "/api/pet",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet6]
  },
  {
    routePath: "/api/pet",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost5]
  },
  {
    routePath: "/api/tag",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet7]
  },
  {
    routePath: "/api/tutor",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet8]
  },
  {
    routePath: "/api/upload",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet9]
  },
  {
    routePath: "/api/upload",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost6]
  }
];

// ../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");

// ../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// ../.wrangler/tmp/bundle-JmE67Q/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;

// ../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../.wrangler/tmp/bundle-JmE67Q/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=functionsWorker-0.9094987083661987.mjs.map
