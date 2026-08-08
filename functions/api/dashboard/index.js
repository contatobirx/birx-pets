import { authorized, json, unauthorized } from "../admin-shared.js";

export async function onRequestGet({request,env}){
  if(!(await authorized(request,env))) return unauthorized(env);
  const [materiais,compras,produtos,tags]=await Promise.all([
    env.DB.prepare(`SELECT
      COUNT(*) total,
      COALESCE(SUM(m.estoque*m.custo_medio),0) valor_estoque,
      COALESCE(SUM((m.estoque-COALESCE(r.reservado,0))*m.custo_medio),0) valor_disponivel,
      COALESCE(SUM(CASE WHEN (m.estoque-COALESCE(r.reservado,0))<=m.estoque_minimo THEN 1 ELSE 0 END),0) abaixo_minimo
      FROM materiais m
      LEFT JOIN (SELECT material_id,SUM(quantidade) reservado FROM ordem_material_reservas GROUP BY material_id) r ON r.material_id=m.id
      WHERE m.ativo=1`).first(),
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
  const alertas=await env.DB.prepare(`SELECT m.id,m.nome,m.estoque,m.estoque_minimo,m.unidade,COALESCE(r.reservado,0) AS reservado,MAX(0,m.estoque-COALESCE(r.reservado,0)) AS disponivel
    FROM materiais m
    LEFT JOIN (SELECT material_id,SUM(quantidade) reservado FROM ordem_material_reservas GROUP BY material_id) r ON r.material_id=m.id
    WHERE m.ativo=1 AND (m.estoque-COALESCE(r.reservado,0))<=m.estoque_minimo
    ORDER BY disponivel ASC LIMIT 8`).all();
  return json({sucesso:true,materiais:materiais||{},compras:compras||{},produtos:produtos||{},tags:tags||{},alertas:alertas.results||[]});
}

export async function onRequest(context){return context.request.method==='GET'?onRequestGet(context):json({sucesso:false,mensagem:'Método não permitido.'},405)}
