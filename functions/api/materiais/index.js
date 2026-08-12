import { authorized, clean, json, number, unauthorized } from "./_shared.js";

const selectBase = `SELECT id,nome,categoria,codigo,unidade,estoque,estoque_minimo,custo_medio,fornecedor_principal,observacoes,
  tipo,cor,marca,peso_rolo_g,perda_percentual,ativo,criado_em,atualizado_em FROM materiais`;

async function list(env, request) {
  const url = new URL(request.url);
  const busca = clean(url.searchParams.get("busca"), 120);
  const categoria = clean(url.searchParams.get("categoria"), 80);
  const somenteAtivos = url.searchParams.get("todos") !== "1";
  const clauses = [];
  const binds = [];
  if (somenteAtivos) clauses.push("ativo=1");
  if (busca) {
    clauses.push("(LOWER(nome) LIKE LOWER(?) OR LOWER(COALESCE(codigo,'')) LIKE LOWER(?) OR LOWER(COALESCE(tipo,'')) LIKE LOWER(?) OR LOWER(COALESCE(cor,'')) LIKE LOWER(?))");
    binds.push(`%${busca}%`,`%${busca}%`,`%${busca}%`,`%${busca}%`);
  }
  if (categoria) { clauses.push("LOWER(categoria)=LOWER(?)"); binds.push(categoria); }
  const where = clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
  const stmt = env.DB.prepare(`${selectBase}${where} ORDER BY nome COLLATE NOCASE LIMIT 500`);
  const result = binds.length ? await stmt.bind(...binds).all() : await stmt.all();
  const resumo = await env.DB.prepare(`SELECT COUNT(*) total,COALESCE(SUM(estoque*custo_medio),0) valor_estoque,COALESCE(SUM(CASE WHEN estoque<=estoque_minimo THEN 1 ELSE 0 END),0) abaixo_minimo FROM materiais WHERE ativo=1`).first();
  return json({sucesso:true,materiais:result.results||[],resumo});
}

function fields(body, atual={}) {
  return {
    nome: clean(body.nome,140) || atual.nome,
    categoria: clean(body.categoria,80) || atual.categoria || "Outros",
    codigo: clean(body.codigo,60) || null,
    unidade: clean(body.unidade,20) || atual.unidade || "un",
    estoque: Math.max(0,number(body.estoque,atual.estoque||0)),
    estoque_minimo: Math.max(0,number(body.estoque_minimo,atual.estoque_minimo||0)),
    custo_medio: Math.max(0,number(body.custo_medio,atual.custo_medio||0)),
    fornecedor: clean(body.fornecedor_principal,140) || null,
    observacoes: clean(body.observacoes,800) || null,
    tipo: clean(body.tipo,60) || null,
    cor: clean(body.cor,60) || null,
    marca: clean(body.marca,100) || null,
    peso_rolo_g: Math.max(0,number(body.peso_rolo_g,atual.peso_rolo_g||0)),
    perda_percentual: Math.max(0,number(body.perda_percentual,atual.perda_percentual||0)),
  };
}

async function create(env, request) {
  const body = await request.json();
  const f = fields(body);
  if (!f.nome) return json({sucesso:false,mensagem:"Informe o nome do material."},400);
  try {
    const result = await env.DB.prepare(`INSERT INTO materiais (nome,categoria,codigo,unidade,estoque,estoque_minimo,custo_medio,fornecedor_principal,observacoes,tipo,cor,marca,peso_rolo_g,perda_percentual) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .bind(f.nome,f.categoria,f.codigo,f.unidade,f.estoque,f.estoque_minimo,f.custo_medio,f.fornecedor,f.observacoes,f.tipo,f.cor,f.marca,f.peso_rolo_g,f.perda_percentual).run();
    const id=result.meta?.last_row_id;
    if(f.estoque>0&&id) await env.DB.prepare(`INSERT INTO estoque_movimentos (material_id,tipo,quantidade,saldo_anterior,saldo_novo,valor_unitario,origem,referencia,observacoes) VALUES (?,'entrada',?,0,?,?,'cadastro','saldo-inicial','Saldo inicial do material')`).bind(id,f.estoque,f.estoque,f.custo_medio).run();
    return json({sucesso:true,material:await env.DB.prepare(`${selectBase} WHERE id=?`).bind(id).first()},201);
  } catch(error){ if(String(error).includes("UNIQUE")) return json({sucesso:false,mensagem:"Já existe um material com esse código."},409); console.error(error); return json({sucesso:false,mensagem:"Não foi possível cadastrar o material."},500); }
}

async function update(env, request) {
  const body=await request.json(); const id=Math.trunc(number(body.id));
  if(!id) return json({sucesso:false,mensagem:"Material inválido."},400);
  const atual=await env.DB.prepare(`SELECT * FROM materiais WHERE id=?`).bind(id).first();
  if(!atual) return json({sucesso:false,mensagem:"Material não encontrado."},404);
  const f=fields(body,atual);
  try{
    await env.DB.prepare(`UPDATE materiais SET nome=?,categoria=?,codigo=?,unidade=?,estoque=?,estoque_minimo=?,custo_medio=?,fornecedor_principal=?,observacoes=?,tipo=?,cor=?,marca=?,peso_rolo_g=?,perda_percentual=?,atualizado_em=CURRENT_TIMESTAMP WHERE id=?`)
      .bind(f.nome,f.categoria,f.codigo,f.unidade,f.estoque,f.estoque_minimo,f.custo_medio,f.fornecedor,f.observacoes,f.tipo,f.cor,f.marca,f.peso_rolo_g,f.perda_percentual,id).run();
    if(f.estoque!==Number(atual.estoque)) await env.DB.prepare(`INSERT INTO estoque_movimentos (material_id,tipo,quantidade,saldo_anterior,saldo_novo,valor_unitario,origem,referencia,observacoes) VALUES (?,'ajuste',?,?,?,?, 'manual','edicao-material','Ajuste realizado pela edição do material')`).bind(id,f.estoque-Number(atual.estoque),Number(atual.estoque),f.estoque,f.custo_medio).run();
    return json({sucesso:true,material:await env.DB.prepare(`${selectBase} WHERE id=?`).bind(id).first()});
  }catch(error){ if(String(error).includes("UNIQUE")) return json({sucesso:false,mensagem:"Já existe um material com esse código."},409); console.error(error); return json({sucesso:false,mensagem:"Não foi possível atualizar o material."},500); }
}

async function remove(env,request){ const id=Math.trunc(number(new URL(request.url).searchParams.get("id"))); if(!id)return json({sucesso:false,mensagem:"Material inválido."},400); const r=await env.DB.prepare(`UPDATE materiais SET ativo=0,atualizado_em=CURRENT_TIMESTAMP WHERE id=?`).bind(id).run(); if(!r.meta?.changes)return json({sucesso:false,mensagem:"Material não encontrado."},404); return json({sucesso:true}); }

export async function onRequest({request,env}){
  if(!(await authorized(request,env))) return unauthorized(env);
  if(request.method==="GET") return list(env,request);
  if(request.method==="POST") return create(env,request);
  if(request.method==="PUT") return update(env,request);
  if(request.method==="DELETE") return remove(env,request);
  return json({sucesso:false,mensagem:"Método não permitido."},405);
}
