import { clean, json, number } from "../admin-shared.js";

const hex=(buffer)=>[...new Uint8Array(buffer)].map(b=>b.toString(16).padStart(2,'0')).join('');
async function sha256(value){return hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))}
function bearer(request){const h=request.headers.get('Authorization')||'';return h.startsWith('Bearer ')?h.slice(7).trim():''}

export async function onRequestPost({request,env}){
  const raw=bearer(request);if(!raw)return json({sucesso:false,mensagem:'Token de telemetria ausente.'},401);
  const hash=await sha256(raw);
  const imp=await env.DB.prepare(`SELECT id,status FROM impressoras_3d WHERE telemetria_token_hash=? AND ativo=1`).bind(hash).first();
  if(!imp)return json({sucesso:false,mensagem:'Token de telemetria inválido.'},401);
  const b=await request.json().catch(()=>({}));
  const status=clean(b.status,30)||null;
  const progresso=Math.min(100,Math.max(0,number(b.progresso_percentual)));
  const tempBico=b.temperatura_bico==null?null:number(b.temperatura_bico);
  const tempMesa=b.temperatura_mesa==null?null:number(b.temperatura_mesa);
  const trabalho=clean(b.trabalho_atual,180)||null;
  const restante=b.tempo_restante_min==null?null:Math.max(0,Math.trunc(number(b.tempo_restante_min)));
  await env.DB.batch([
    env.DB.prepare(`UPDATE impressoras_3d SET telemetria_ultimo_contato=CURRENT_TIMESTAMP,progresso_percentual=?,temperatura_bico=?,temperatura_mesa=?,trabalho_atual=?,tempo_restante_min=?,telemetria_status=?,atualizado_em=CURRENT_TIMESTAMP WHERE id=?`).bind(progresso,tempBico,tempMesa,trabalho,restante,status,imp.id),
    env.DB.prepare(`INSERT INTO impressora_telemetria (impressora_id,status,progresso_percentual,temperatura_bico,temperatura_mesa,trabalho_atual,tempo_restante_min) VALUES (?,?,?,?,?,?,?)`).bind(imp.id,status,progresso,tempBico,tempMesa,trabalho,restante)
  ]);
  return json({sucesso:true,impressora_id:imp.id});
}

export async function onRequest(c){if(c.request.method==='POST')return onRequestPost(c);return json({sucesso:false,mensagem:'Método não permitido.'},405)}
