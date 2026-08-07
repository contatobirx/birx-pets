import { authorized, clean, json, unauthorized } from "../admin-shared.js";

function fields(body = {}) {
  return {
    nome: clean(body.nome, 140),
    cnpj: clean(body.cnpj, 30),
    contato: clean(body.contato, 120),
    telefone: clean(body.telefone, 40),
    whatsapp: clean(body.whatsapp, 40),
    email: clean(body.email, 160),
    site: clean(body.site, 220),
    observacoes: clean(body.observacoes, 1000),
  };
}

function duplicateMessage(error) {
  return String(error?.message || "").includes("UNIQUE constraint failed: fornecedores.cnpj")
    ? "Já existe um fornecedor ativo com este CNPJ."
    : null;
}

export async function onRequestGet({ request, env }) {
  if (!(await authorized(request, env))) return unauthorized(env);
  const result = await env.DB.prepare(`SELECT id,nome,cnpj,contato,telefone,whatsapp,email,site,observacoes,criado_em,atualizado_em FROM fornecedores WHERE ativo=1 ORDER BY nome COLLATE NOCASE`).all();
  return json({ sucesso: true, fornecedores: result.results || [] });
}

export async function onRequestPost({ request, env }) {
  if (!(await authorized(request, env))) return unauthorized(env);
  const data = fields(await request.json().catch(() => ({})));
  if (!data.nome) return json({ sucesso: false, mensagem: "Informe o nome do fornecedor." }, 400);
  try {
    const result = await env.DB.prepare(`INSERT INTO fornecedores (nome,cnpj,contato,telefone,whatsapp,email,site,observacoes) VALUES (?,?,?,?,?,?,?,?)`)
      .bind(data.nome, data.cnpj, data.contato, data.telefone, data.whatsapp, data.email, data.site, data.observacoes).run();
    return json({ sucesso: true, id: result.meta?.last_row_id, mensagem: "Fornecedor cadastrado." }, 201);
  } catch (error) {
    const mensagem = duplicateMessage(error);
    if (mensagem) return json({ sucesso: false, mensagem }, 409);
    console.error("fornecedores POST", error);
    return json({ sucesso: false, mensagem: "Não foi possível cadastrar o fornecedor." }, 500);
  }
}

export async function onRequestPut({ request, env }) {
  if (!(await authorized(request, env))) return unauthorized(env);
  const body = await request.json().catch(() => ({}));
  const id = Number(body.id);
  const data = fields(body);
  if (!id || !data.nome) return json({ sucesso: false, mensagem: "Fornecedor inválido." }, 400);
  try {
    const result = await env.DB.prepare(`UPDATE fornecedores SET nome=?,cnpj=?,contato=?,telefone=?,whatsapp=?,email=?,site=?,observacoes=?,atualizado_em=CURRENT_TIMESTAMP WHERE id=? AND ativo=1`)
      .bind(data.nome, data.cnpj, data.contato, data.telefone, data.whatsapp, data.email, data.site, data.observacoes, id).run();
    if (!result.meta?.changes) return json({ sucesso: false, mensagem: "Fornecedor não encontrado." }, 404);
    return json({ sucesso: true, mensagem: "Fornecedor atualizado." });
  } catch (error) {
    const mensagem = duplicateMessage(error);
    if (mensagem) return json({ sucesso: false, mensagem }, 409);
    console.error("fornecedores PUT", error);
    return json({ sucesso: false, mensagem: "Não foi possível atualizar o fornecedor." }, 500);
  }
}

export async function onRequestDelete({ request, env }) {
  if (!(await authorized(request, env))) return unauthorized(env);
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!id) return json({ sucesso: false, mensagem: "Fornecedor inválido." }, 400);
  const result = await env.DB.prepare(`UPDATE fornecedores SET ativo=0, atualizado_em=CURRENT_TIMESTAMP WHERE id=? AND ativo=1`).bind(id).run();
  if (!result.meta?.changes) return json({ sucesso: false, mensagem: "Fornecedor não encontrado." }, 404);
  return json({ sucesso: true, mensagem: "Fornecedor arquivado." });
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  if (context.request.method === "POST") return onRequestPost(context);
  if (context.request.method === "PUT") return onRequestPut(context);
  if (context.request.method === "DELETE") return onRequestDelete(context);
  return json({ sucesso: false, mensagem: "Método não permitido." }, 405);
}
