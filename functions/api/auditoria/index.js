import { authorized, json, unauthorized } from "../admin-shared.js";

export async function onRequestGet({request,env}){
  if(!(await authorized(request,env))) return unauthorized(env);
  const checks=[];
  const push=(codigo,nivel,titulo,quantidade,detalhes=[])=>checks.push({codigo,nivel,titulo,quantidade:Number(quantidade||0),detalhes});

  const [negMateriais,reservaExcede,negProdutos,statusTags,ordensSemReserva,modelosPrincipais]=await Promise.all([
    env.DB.prepare(`SELECT id,nome,estoque,unidade FROM materiais WHERE ativo=1 AND estoque<0`).all(),
    env.DB.prepare(`SELECT m.id,m.nome,m.estoque,m.unidade,COALESCE(SUM(r.quantidade),0) reservado FROM materiais m JOIN ordem_material_reservas r ON r.material_id=m.id WHERE m.ativo=1 GROUP BY m.id HAVING reservado>m.estoque+0.000001`).all(),
    env.DB.prepare(`SELECT id,nome,estoque FROM produtos WHERE ativo=1 AND estoque<0`).all(),
    env.DB.prepare(`SELECT codigo,COALESCE(preparo_status,'estoque') status,COALESCE(ativada,0) ativada FROM tags WHERE COALESCE(preparo_status,'estoque') NOT IN ('estoque','gravada','testada','vendida') LIMIT 100`).all(),
    env.DB.prepare(`SELECT o.id,p.nome produto,o.status FROM ordens_impressao o JOIN produtos p ON p.id=o.produto_id WHERE o.status IN ('fila','imprimindo','pausada') AND NOT EXISTS(SELECT 1 FROM ordem_material_reservas r WHERE r.ordem_id=o.id) LIMIT 100`).all(),
    env.DB.prepare(`SELECT p.id,p.nome,COUNT(m.id) quantidade FROM produtos p JOIN modelos_3d m ON m.produto_id=p.id AND m.ativo=1 AND m.principal=1 WHERE p.ativo=1 GROUP BY p.id HAVING COUNT(m.id)>1`).all()
  ]);

  push('MATERIAL_NEGATIVO','erro','Materiais com estoque negativo',negMateriais.results?.length,negMateriais.results||[]);
  push('RESERVA_EXCEDE_ESTOQUE','erro','Reservas maiores que o estoque físico',reservaExcede.results?.length,reservaExcede.results||[]);
  push('PRODUTO_NEGATIVO','erro','Produtos acabados com estoque negativo',negProdutos.results?.length,negProdutos.results||[]);
  push('TAG_STATUS_INVALIDO','erro','Tags com status de preparo inválido',statusTags.results?.length,statusTags.results||[]);
  push('ORDEM_SEM_RESERVA','alerta','Ordens ativas sem materiais reservados',ordensSemReserva.results?.length,ordensSemReserva.results||[]);
  push('MULTIPLOS_MODELOS_PRINCIPAIS','alerta','Produtos com mais de um modelo 3D principal',modelosPrincipais.results?.length,modelosPrincipais.results||[]);

  const resumoTags=await env.DB.prepare(`SELECT COUNT(*) total,
    SUM(CASE WHEN COALESCE(ativada,0)=0 AND COALESCE(preparo_status,'estoque')='estoque' THEN 1 ELSE 0 END) estoque,
    SUM(CASE WHEN COALESCE(ativada,0)=0 AND COALESCE(preparo_status,'estoque')='gravada' THEN 1 ELSE 0 END) gravadas,
    SUM(CASE WHEN COALESCE(ativada,0)=0 AND COALESCE(preparo_status,'estoque')='testada' THEN 1 ELSE 0 END) testadas,
    SUM(CASE WHEN COALESCE(ativada,0)=0 AND COALESCE(preparo_status,'estoque')='vendida' THEN 1 ELSE 0 END) vendidas,
    SUM(CASE WHEN COALESCE(ativada,0)=1 THEN 1 ELSE 0 END) ativadas FROM tags`).first();

  const problemas=checks.reduce((s,c)=>s+c.quantidade,0);
  return json({sucesso:true,saudavel:problemas===0,problemas,checks,resumo_tags:resumoTags||{}});
}

export async function onRequest(c){return c.request.method==='GET'?onRequestGet(c):json({sucesso:false,mensagem:'Método não permitido.'},405)}
