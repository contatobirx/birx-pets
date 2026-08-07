import { authorized, clean, json, number, unauthorized } from "./_shared.js";

const selectBase = `SELECT id, nome, categoria, codigo, unidade, estoque, estoque_minimo,
  custo_medio, fornecedor_principal, observacoes, ativo, criado_em, atualizado_em
  FROM materiais`;

async function list(env, request) {
  const url = new URL(request.url);
  const busca = clean(url.searchParams.get("busca"), 120);
  const categoria = clean(url.searchParams.get("categoria"), 80);
  const somenteAtivos = url.searchParams.get("todos") !== "1";
  const clauses = [];
  const binds = [];

  if (somenteAtivos) clauses.push("ativo = 1");
  if (busca) {
    clauses.push("(LOWER(nome) LIKE LOWER(?) OR LOWER(COALESCE(codigo,'')) LIKE LOWER(?))");
    binds.push(`%${busca}%`, `%${busca}%`);
  }
  if (categoria) {
    clauses.push("LOWER(categoria) = LOWER(?)");
    binds.push(categoria);
  }

  const where = clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
  const statement = env.DB.prepare(`${selectBase}${where} ORDER BY nome COLLATE NOCASE ASC LIMIT 500`);
  const result = binds.length ? await statement.bind(...binds).all() : await statement.all();

  const resumo = await env.DB.prepare(`SELECT
      COUNT(*) AS total,
      COALESCE(SUM(estoque * custo_medio), 0) AS valor_estoque,
      COALESCE(SUM(CASE WHEN estoque <= estoque_minimo THEN 1 ELSE 0 END), 0) AS abaixo_minimo
    FROM materiais WHERE ativo = 1`).first();

  return json({ sucesso: true, materiais: result.results || [], resumo });
}

async function create(env, request) {
  const body = await request.json();
  const nome = clean(body.nome, 140);
  const categoria = clean(body.categoria, 80) || "Outros";
  const codigo = clean(body.codigo, 60) || null;
  const unidade = clean(body.unidade, 20) || "un";
  const estoque = Math.max(0, number(body.estoque));
  const estoqueMinimo = Math.max(0, number(body.estoque_minimo));
  const custoMedio = Math.max(0, number(body.custo_medio));
  const fornecedor = clean(body.fornecedor_principal, 140) || null;
  const observacoes = clean(body.observacoes, 800) || null;

  if (!nome) return json({ sucesso: false, mensagem: "Informe o nome do material." }, 400);

  try {
    const result = await env.DB.prepare(`INSERT INTO materiais
      (nome, categoria, codigo, unidade, estoque, estoque_minimo, custo_medio, fornecedor_principal, observacoes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(nome, categoria, codigo, unidade, estoque, estoqueMinimo, custoMedio, fornecedor, observacoes)
      .run();

    const id = result.meta?.last_row_id;
    if (estoque > 0 && id) {
      await env.DB.prepare(`INSERT INTO estoque_movimentos
        (material_id, tipo, quantidade, saldo_anterior, saldo_novo, valor_unitario, origem, referencia, observacoes)
        VALUES (?, 'entrada', ?, 0, ?, ?, 'cadastro', 'saldo-inicial', 'Saldo inicial do material')`)
        .bind(id, estoque, estoque, custoMedio).run();
    }

    const material = await env.DB.prepare(`${selectBase} WHERE id = ?`).bind(id).first();
    return json({ sucesso: true, material }, 201);
  } catch (error) {
    if (String(error).includes("UNIQUE")) return json({ sucesso: false, mensagem: "Já existe um material com esse código." }, 409);
    console.error("materiais POST", error);
    return json({ sucesso: false, mensagem: "Não foi possível cadastrar o material." }, 500);
  }
}

async function update(env, request) {
  const body = await request.json();
  const id = Math.trunc(number(body.id));
  if (!id) return json({ sucesso: false, mensagem: "Material inválido." }, 400);

  const atual = await env.DB.prepare("SELECT * FROM materiais WHERE id = ?").bind(id).first();
  if (!atual) return json({ sucesso: false, mensagem: "Material não encontrado." }, 404);

  const nome = clean(body.nome, 140) || atual.nome;
  const categoria = clean(body.categoria, 80) || atual.categoria;
  const codigo = clean(body.codigo, 60) || null;
  const unidade = clean(body.unidade, 20) || atual.unidade;
  const estoque = Math.max(0, number(body.estoque, atual.estoque));
  const estoqueMinimo = Math.max(0, number(body.estoque_minimo, atual.estoque_minimo));
  const custoMedio = Math.max(0, number(body.custo_medio, atual.custo_medio));
  const fornecedor = clean(body.fornecedor_principal, 140) || null;
  const observacoes = clean(body.observacoes, 800) || null;

  try {
    await env.DB.prepare(`UPDATE materiais SET nome=?, categoria=?, codigo=?, unidade=?, estoque=?, estoque_minimo=?,
      custo_medio=?, fornecedor_principal=?, observacoes=?, atualizado_em=CURRENT_TIMESTAMP WHERE id=?`)
      .bind(nome, categoria, codigo, unidade, estoque, estoqueMinimo, custoMedio, fornecedor, observacoes, id).run();

    if (estoque !== Number(atual.estoque)) {
      await env.DB.prepare(`INSERT INTO estoque_movimentos
        (material_id, tipo, quantidade, saldo_anterior, saldo_novo, valor_unitario, origem, referencia, observacoes)
        VALUES (?, 'ajuste', ?, ?, ?, ?, 'manual', 'edicao-material', 'Ajuste realizado pela edição do material')`)
        .bind(id, estoque - Number(atual.estoque), Number(atual.estoque), estoque, custoMedio).run();
    }

    const material = await env.DB.prepare(`${selectBase} WHERE id = ?`).bind(id).first();
    return json({ sucesso: true, material });
  } catch (error) {
    if (String(error).includes("UNIQUE")) return json({ sucesso: false, mensagem: "Já existe um material com esse código." }, 409);
    console.error("materiais PUT", error);
    return json({ sucesso: false, mensagem: "Não foi possível atualizar o material." }, 500);
  }
}

async function remove(env, request) {
  const url = new URL(request.url);
  const id = Math.trunc(number(url.searchParams.get("id")));
  if (!id) return json({ sucesso: false, mensagem: "Material inválido." }, 400);
  const result = await env.DB.prepare("UPDATE materiais SET ativo=0, atualizado_em=CURRENT_TIMESTAMP WHERE id=?").bind(id).run();
  if (!result.meta?.changes) return json({ sucesso: false, mensagem: "Material não encontrado." }, 404);
  return json({ sucesso: true });
}

export async function onRequest({ request, env }) {
  if (!(await authorized(request, env))) return unauthorized(env);
  if (request.method === "GET") return list(env, request);
  if (request.method === "POST") return create(env, request);
  if (request.method === "PUT") return update(env, request);
  if (request.method === "DELETE") return remove(env, request);
  return json({ sucesso: false, mensagem: "Método não permitido." }, 405);
}
