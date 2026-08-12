import { authorized, json, unauthorized } from "../admin-shared.js";
import { contentTypeFor, getR2, safePart } from "../r2-shared.js";

function missing(){return json({sucesso:false,mensagem:"R2 não está vinculado à Function. Use o binding MODELOS_3D."},503)}

export async function onRequestPost({request,env}){
  if(!(await authorized(request,env)))return unauthorized(env);
  const bucket=getR2(env);if(!bucket)return missing();
  const form=await request.formData();const modeloId=Number(form.get('modelo_id'));const file=form.get('preview');
  if(!modeloId||!(file instanceof File))return json({sucesso:false,mensagem:'Informe o modelo e a imagem.'},400);
  const modelo=await env.DB.prepare(`SELECT m.id,m.produto_id,m.nome,m.versao,m.preview_r2_key,p.codigo AS produto_codigo FROM modelos_3d m JOIN produtos p ON p.id=m.produto_id WHERE m.id=? AND m.ativo=1`).bind(modeloId).first();
  if(!modelo)return json({sucesso:false,mensagem:'Modelo não encontrado.'},404);
  const ext=(String(file.name).match(/\.[a-z0-9]+$/i)||[''])[0].toLowerCase();
  if(!['.png','.jpg','.jpeg','.webp'].includes(ext))return json({sucesso:false,mensagem:'Envie uma imagem PNG, JPG, JPEG ou WEBP.'},400);
  if(Number(file.size)>8*1024*1024)return json({sucesso:false,mensagem:'A imagem deve ter no máximo 8 MB.'},400);
  const key=`modelos-3d/${safePart(modelo.produto_codigo||modelo.produto_id)}/${safePart(modelo.nome)}/${safePart(modelo.versao||'v1')}/preview-${Date.now()}${ext}`;
  await bucket.put(key,file.stream(),{httpMetadata:{contentType:file.type||contentTypeFor(file.name)},customMetadata:{modelo_id:String(modeloId),tipo:'preview'}});
  if(modelo.preview_r2_key)await bucket.delete(modelo.preview_r2_key).catch(()=>{});
  await env.DB.prepare(`UPDATE modelos_3d SET preview_r2_key=?,atualizado_em=CURRENT_TIMESTAMP WHERE id=?`).bind(key,modeloId).run();
  return json({sucesso:true,key,mensagem:'Preview enviado ao R2.'},201);
}

export async function onRequestGet({request,env}){
  if(!(await authorized(request,env)))return unauthorized(env);
  const bucket=getR2(env);if(!bucket)return missing();
  const id=Number(new URL(request.url).searchParams.get('modelo_id'));if(!id)return json({sucesso:false,mensagem:'Modelo inválido.'},400);
  const m=await env.DB.prepare(`SELECT preview_r2_key FROM modelos_3d WHERE id=? AND ativo=1`).bind(id).first();
  if(!m?.preview_r2_key)return json({sucesso:false,mensagem:'Este modelo ainda não possui preview.'},404);
  const obj=await bucket.get(m.preview_r2_key);if(!obj)return json({sucesso:false,mensagem:'Preview não encontrado no R2.'},404);
  const headers=new Headers();obj.writeHttpMetadata(headers);headers.set('Cache-Control','private, max-age=300');
  return new Response(obj.body,{headers});
}

export async function onRequestDelete({request,env}){
  if(!(await authorized(request,env)))return unauthorized(env);
  const bucket=getR2(env);if(!bucket)return missing();
  const id=Number(new URL(request.url).searchParams.get('modelo_id'));if(!id)return json({sucesso:false,mensagem:'Modelo inválido.'},400);
  const m=await env.DB.prepare(`SELECT preview_r2_key FROM modelos_3d WHERE id=?`).bind(id).first();
  if(m?.preview_r2_key)await bucket.delete(m.preview_r2_key);
  await env.DB.prepare(`UPDATE modelos_3d SET preview_r2_key=NULL,atualizado_em=CURRENT_TIMESTAMP WHERE id=?`).bind(id).run();
  return json({sucesso:true,mensagem:'Preview removido.'});
}

export async function onRequest(c){if(c.request.method==='POST')return onRequestPost(c);if(c.request.method==='GET')return onRequestGet(c);if(c.request.method==='DELETE')return onRequestDelete(c);return json({sucesso:false,mensagem:'Método não permitido.'},405)}
