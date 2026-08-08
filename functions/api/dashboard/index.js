import { authorized, json, unauthorized } from "../admin-shared.js";

export async function onRequestGet({request,env}){
  if(!(await authorized(request,env))) return unauthorized(env);
  const [materiais,compras,produtos,tags]=await Promise.all([
    env.DB.prepare(`SELECT COUNT(*) total,COALESCE(SUM(estoque*custo_medio),0) valor_estoque,COALESCE(SUM(CASE WHEN estoque<=estoque_minimo THEN 1 ELSE 0 END),0) abaixo_minimo FROM materiais WHERE ativo=1`).first(),
    env.DB.prepare(`SELECT COUNT(*) total,COALESCE(SUM(total_final),0) valor_mes FROM compras WHERE substr(data_compra,1,7)=strftime('%Y-%m','now')`).first(),
    env.DB.prepare(`SELECT COUNT(*) total,COALESCE(SUM(estoque),0) estoque FROM produtos WHERE ativo=1`).first().catch(()=>({total:0,estoque:0})),
    env.DB.prepare(`SELECT
      COUNT(*) AS total,
      COALESCE(SUM(CASE WHEN COALESCE(ativada,0)=0 AND COALESCE(preparo_status,'estoque')='estoque' THEN 1 ELSE 0 END),0) AS disponiveis,
      COALESCE(SUM(CASE WHEN COALESCE(ativada,0)=0 AND COALESCE(preparo_status,'estoque')='gravada' THEN 1 ELSE 0 END),0) AS gravadas,
      COALESCE(SUM(CASE WHEN COALESCE(ativada,0)=0 AND COALESCE(preparo_status,'estoque')='testada' THEN 1 ELSE 0 END),0) AS testadas,
      COALESCE(SUM(CASE WHEN COALESCE(ativada,0)=1 THEN 1 ELSE 0 END),0) AS ativadas
      FROM tags`).first().catch(()=>({total:0,disponiveis:0,gravadas:0,testadas:0,ativadas:0}))
  ]);
  const alertas=await env.DB.prepare(`SELECT id,nome,estoque,estoque_minimo,unidade FROM materiais WHERE ativo=1 AND estoque<=estoque_minimo ORDER BY estoque ASC LIMIT 8`).all();
  return json({sucesso:true,materiais:materiais||{},compras:compras||{},produtos:produtos||{},tags:tags||{},alertas:alertas.results||[]});
}

export async function onRequest(context){return context.request.method==='GET'?onRequestGet(context):json({sucesso:false,mensagem:'Método não permitido.'},405)}
