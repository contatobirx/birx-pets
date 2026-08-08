import { authorized, json, unauthorized } from "../admin-shared.js";
import { contentTypeFor, getR2, safePart } from "../r2-shared.js";

function missing(){return json({sucesso:false,mensagem:"R2 não está vinculado à Function. Use um binding MODELOS_3D, R2, BUCKET ou ASSETS_R2."},503)}

export async function onRequestPost({request,env}){
  if(!(await authorized(request,env))) return unauthorized(env);
  const bucket=getR2(env); if(!bucket) return missing();
  const form=await request.formData();
  const modeloId=Number(form.get('modelo_id'));
  const file=form.get('arquivo');
  if(!modeloId||!(file instanceof File)) return json({sucesso:false,mensagem:'Informe o modelo e o arquivo.'},400);
  const modelo=await env.DB.prepare(`SELECT m.id,m.produto_id,m.nome,m.versao,p.codigo AS produto_codigo FROM modelos_3d m JOIN produtos p ON p.id=m.produto_id WHERE m.id=? AND m.ativo=1`).bind(modeloId).first();
  if(!modelo) return json({sucesso:false,mensagem:'Modelo não encontrado.'},404);
  const ext=(String(file.name).match(/\.[a-z0-9]+$/i)||[''])[0].toLowerCase();
  if(!['.3mf','.stl','.obj'].includes(ext)) return json({sucesso:false,mensagem:'Envie um arquivo .3mf, .stl ou .obj.'},400);
  const key=`modelos-3d/${safePart(modelo.produto_codigo||modelo.produto_id)}/${safePart(modelo.nome)}/${safePart(modelo.versao||'v1')}/${Date.now()}-${safePart(file.name)}`;
  const obj=await bucket.put(key,file.stream(),{httpMetadata:{contentType:file.type||contentTypeFor(file.name)},customMetadata:{modelo_id:String(modeloId),produto_id:String(modelo.produto_id)}});
  await env.DB.prepare(`UPDATE modelos_3d SET arquivo_nome=?,arquivo_url=NULL,r2_key=?,r2_etag=?,arquivo_tamanho=?,atualizado_em=CURRENT_TIMESTAMP WHERE id=?`).bind(file.name,key,obj?.etag||null,Number(file.size||0),modeloId).run();
  return json({sucesso:true,key,nome:file.name,tamanho:file.size,mensagem:'Arquivo enviado ao R2.'},201);
}

export async function onRequestGet({request,env}){
  if(!(await authorized(request,env))) return unauthorized(env);
  const bucket=getR2(env); if(!bucket) return missing();
  const id=Number(new URL(request.url).searchParams.get('modelo_id')); if(!id)return json({sucesso:false,mensagem:'Modelo inválido.'},400);
  const m=await env.DB.prepare(`SELECT arquivo_nome,r2_key FROM modelos_3d WHERE id=? AND ativo=1`).bind(id).first();
  if(!m?.r2_key)return json({sucesso:false,mensagem:'Este modelo ainda não possui arquivo no R2.'},404);
  const obj=await bucket.get(m.r2_key); if(!obj)return json({sucesso:false,mensagem:'Arquivo não encontrado no R2.'},404);
  const headers=new Headers(); obj.writeHttpMetadata(headers); headers.set('Content-Disposition',`attachment; filename="${String(m.arquivo_nome||'modelo.3mf').replaceAll('"','')}"`); headers.set('Cache-Control','private, no-store');
  return new Response(obj.body,{headers});
}

export async function onRequestDelete({request,env}){
  if(!(await authorized(request,env))) return unauthorized(env);
  const bucket=getR2(env); if(!bucket) return missing();
  const id=Number(new URL(request.url).searchParams.get('modelo_id')); if(!id)return json({sucesso:false,mensagem:'Modelo inválido.'},400);
  const m=await env.DB.prepare(`SELECT r2_key FROM modelos_3d WHERE id=?`).bind(id).first();
  if(m?.r2_key) await bucket.delete(m.r2_key);
  await env.DB.prepare(`UPDATE modelos_3d SET r2_key=NULL,r2_etag=NULL,arquivo_nome=NULL,arquivo_tamanho=0,atualizado_em=CURRENT_TIMESTAMP WHERE id=?`).bind(id).run();
  return json({sucesso:true,mensagem:'Arquivo removido do R2.'});
}

export async function onRequest(context){if(context.request.method==='POST')return onRequestPost(context);if(context.request.method==='GET')return onRequestGet(context);if(context.request.method==='DELETE')return onRequestDelete(context);return json({sucesso:false,mensagem:'Método não permitido.'},405)}
