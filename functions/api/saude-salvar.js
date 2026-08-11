import { obterSessaoTutor, petPertenceAoTutor } from "../_lib/auth.js";

const CABECALHOS_JSON = {"Content-Type":"application/json; charset=UTF-8","Cache-Control":"no-store"};
function responder(dados,status=200,extras={}){return new Response(JSON.stringify(dados),{status,headers:{...CABECALHOS_JSON,...extras}})}
function texto(valor,limite=1000){return String(valor??"").trim().slice(0,limite)}
function dataValidaOuVazia(valor){const data=texto(valor,10);if(!data)return "";if(!/^\d{4}-\d{2}-\d{2}$/.test(data))return null;const[ano,mes,dia]=data.split("-").map(Number);const validacao=new Date(Date.UTC(ano,mes-1,dia));return validacao.getUTCFullYear()===ano&&validacao.getUTCMonth()===mes-1&&validacao.getUTCDate()===dia?data:null}
function dataEvento(dataAplicacao){return dataAplicacao?`${dataAplicacao}T12:00:00.000Z`:new Date().toISOString()}

export async function onRequestPost({request,env}){
  try{
    const sessao=await obterSessaoTutor(request,env);
    if(!sessao)return responder({sucesso:false,autenticado:false,mensagem:"Sua sessão expirou. Entre novamente."},401);
    const corpo=await request.json().catch(()=>({}));
    const idInformado=corpo.id!==null&&corpo.id!==undefined&&String(corpo.id).trim()!=="";
    const id=idInformado?Number.parseInt(corpo.id,10):null;
    const tagCodigo=texto(corpo.tagCodigo,100);
    const nome=texto(corpo.nome,120);
    const fabricante=texto(corpo.fabricante,120);
    const lote=texto(corpo.lote,80);
    const veterinario=texto(corpo.veterinario,120);
    const dataAplicacao=dataValidaOuVazia(corpo.dataAplicacao);
    const proximaData=dataValidaOuVazia(corpo.proximaData);
    const observacoes=texto(corpo.observacoes,1000);
    if(idInformado&&(!Number.isInteger(id)||id<=0))return responder({sucesso:false,mensagem:"Identificador da vacina inválido."},400);
    if(!tagCodigo||!nome||!dataAplicacao)return responder({sucesso:false,mensagem:"Informe a tag, o nome da vacina e a data de aplicação."},400);
    if(dataAplicacao===null||proximaData===null)return responder({sucesso:false,mensagem:"Uma das datas é inválida."},400);
    if(proximaData&&proximaData<dataAplicacao)return responder({sucesso:false,mensagem:"A próxima dose não pode ser anterior à aplicação."},400);
    const pet=await petPertenceAoTutor(env,tagCodigo,sessao.email);
    if(!pet)return responder({sucesso:false,mensagem:"Pet não encontrado ou sem permissão de acesso."},403);

    if(id){
      const existente=await env.DB.prepare(`SELECT s.id FROM saude_pet s INNER JOIN pets p ON UPPER(p.tag_codigo)=UPPER(s.tag_codigo) WHERE s.id=? AND s.tipo='Vacina' AND UPPER(s.tag_codigo)=UPPER(?) AND LOWER(p.email)=LOWER(?) LIMIT 1`).bind(id,tagCodigo,sessao.email).first();
      if(!existente)return responder({sucesso:false,mensagem:"Vacina não encontrada."},404);
      await env.DB.batch([
        env.DB.prepare(`UPDATE saude_pet SET nome=?,data_aplicacao=?,proxima_data=NULLIF(?,''),fabricante=?,lote=?,veterinario=?,observacoes=? WHERE id=? AND UPPER(tag_codigo)=UPPER(?) AND EXISTS(SELECT 1 FROM pets p WHERE UPPER(p.tag_codigo)=UPPER(saude_pet.tag_codigo) AND LOWER(p.email)=LOWER(?))`).bind(nome,dataAplicacao,proximaData,fabricante,lote,veterinario,observacoes,id,tagCodigo,sessao.email),
        env.DB.prepare(`INSERT INTO pet_timeline(tag_codigo,tipo,titulo,descricao,data_evento,automatico,criado_por) VALUES(?,?,?,?,?,1,?)`).bind(tagCodigo,"vacina",`Vacina ${nome} atualizada`,proximaData?`Próxima dose: ${proximaData}`:null,new Date().toISOString(),sessao.email)
      ]);
      return responder({sucesso:true,mensagem:"Vacina atualizada com sucesso.",id});
    }

    const comandos=await env.DB.batch([
      env.DB.prepare(`INSERT INTO saude_pet(tag_codigo,tipo,nome,data_aplicacao,proxima_data,fabricante,lote,veterinario,observacoes) SELECT ?,'Vacina',?,?,NULLIF(?,''),?,?,?,? WHERE EXISTS(SELECT 1 FROM pets p WHERE UPPER(p.tag_codigo)=UPPER(?) AND LOWER(p.email)=LOWER(?))`).bind(tagCodigo,nome,dataAplicacao,proximaData,fabricante,lote,veterinario,observacoes,tagCodigo,sessao.email),
      env.DB.prepare(`INSERT INTO pet_timeline(tag_codigo,tipo,titulo,descricao,data_evento,automatico,criado_por) VALUES(?,?,?,?,?,1,?)`).bind(tagCodigo,"vacina",`Vacina ${nome} aplicada`,[fabricante&&`Fabricante: ${fabricante}`,lote&&`Lote: ${lote}`,veterinario&&`Veterinário: ${veterinario}`,proximaData&&`Próxima dose: ${proximaData}`].filter(Boolean).join(" • ")||null,dataEvento(dataAplicacao),sessao.email)
    ]);
    return responder({sucesso:true,mensagem:"Vacina cadastrada e adicionada à timeline.",id:comandos[0]?.meta?.last_row_id||null},201);
  }catch(erro){console.error("Erro em /api/saude-salvar:",erro);return responder({sucesso:false,mensagem:"Não foi possível salvar a vacina."},500)}
}
export async function onRequest(context){if(context.request.method!=="POST")return responder({sucesso:false,mensagem:"Método não permitido."},405,{Allow:"POST"});return onRequestPost(context)}
