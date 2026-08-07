import { authorized, clean, json, unauthorized } from "../admin-shared.js";

export async function onRequestGet({ request, env }) {
  if (!(await authorized(request, env))) return unauthorized(env);
  const result = await env.DB.prepare(`SELECT id,nome,cnpj,contato,whatsapp,email,site,observacoes,criado_em,atualizado_em FROM fornecedores WHERE ativo=1 ORDER BY nome COLLATE NOCASE`).all();
  return json({ sucesso: true, fornecedores: result.results || [] });
}

export async function onRequestPost({ request, env }) {
  if (!(await authorized(request, env))) return unauthorized(env);
  const body = await request.json().catch(() => ({}));
  const nome = clean(body.nome, 140);
  if (!nome) return json({ sucesso: false, mensagem: "Informe o nome do fornecedor." }, 400);
  const result = await env.DB.prepare(`INSERT INTO fornecedores (nome,cnpj,contato,whatsapp,email,site,observacoes) VALUES (?,?,?,?,?,?,?)`)
    .bind(nome, clean(body.cnpj, 30), clean(body.contato, 120), clean(body.whatsapp, 40), clean(body.email, 160), clean(body.site, 220), clean(body.observacoes, 1000)).run();
  return json({ sucesso: true, id: result.meta?.last_row_id, mensagem: "Fornecedor cadastrado." }, 201);
}

export async function onRequestPut({ request, env }) {
  if (!(await authorized(request, env))) return unauthorized(env);
  const body = await request.json().catch(() => ({}));
  const id = Number(body.id);
  const nome = clean(body.nome, 140);
  if (!id || !nome) return json({ sucesso: false, mensagem: "Fornecedor inválido." }, 400);
  await env.DB.prepare(`UPDATE fornecedores SET nome=?,cnpj=?,contato=?,whatsapp=?,email=?,site=?,observacoes=?,atualizado_em=CURRENT_TIMESTAMP WHERE id=? AND ativo=1`)
    .bind(nome, clean(body.cnpj, 30), clean(body.contato, 120), clean(body.whatsapp, 40), clean(body.email, 160), clean(body.site, 220), clean(body.observacoes, 1000), id).run();
  return json({ sucesso: true, mensagem: "Fornecedor atualizado." });
}

export async function onRequestDelete({ request, env }) {
  if (!(await authorized(request, env))) return unauthorized(env);
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!id) return json({ sucesso: false, mensagem: "Fornecedor inválido." }, 400);
  await env.DB.prepare(`UPDATE fornecedores SET ativo=0, atualizado_em=CURRENT_TIMESTAMP WHERE id=?`).bind(id).run();
  return json({ sucesso: true, mensagem: "Fornecedor arquivado." });
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  if (context.request.method === "POST") return onRequestPost(context);
  if (context.request.method === "PUT") return onRequestPut(context);
  if (context.request.method === "DELETE") return onRequestDelete(context);
  return json({ sucesso: false, mensagem: "Método não permitido." }, 405);
}
