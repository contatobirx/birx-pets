import { authorized, json, unauthorized } from "../admin-shared.js";

async function ensureColumns(env, table, defs) {
  const info = await env.DB.prepare(`PRAGMA table_info(${table})`).all();
  const cols = new Set((info.results || []).map((r) => r.name));
  for (const [name, sql] of defs) if (!cols.has(name)) await env.DB.prepare(`ALTER TABLE ${table} ADD COLUMN ${sql}`).run();
}

async function ensureMaterialColumns(env) {
  await ensureColumns(env, "materiais", [
    ["tipo","tipo TEXT"],["cor","cor TEXT"],["marca","marca TEXT"],
    ["peso_rolo_g","peso_rolo_g REAL NOT NULL DEFAULT 0"],["perda_percentual","perda_percentual REAL NOT NULL DEFAULT 0"]
  ]);
}

async function ensureModelColumns(env) {
  await ensureColumns(env, "modelos_3d", [
    ["r2_key","r2_key TEXT"],["r2_etag","r2_etag TEXT"],["arquivo_tamanho","arquivo_tamanho INTEGER NOT NULL DEFAULT 0"],
    ["preview_r2_key","preview_r2_key TEXT"],["cor_recomendada","cor_recomendada TEXT"],["changelog","changelog TEXT"],
    ["principal","principal INTEGER NOT NULL DEFAULT 0"]
  ]);
}

async function ensurePrinterColumns(env) {
  await ensureColumns(env, "impressoras_3d", [
    ["integracao_tipo","integracao_tipo TEXT NOT NULL DEFAULT 'manual'"],
    ["telemetria_token_hash","telemetria_token_hash TEXT"],
    ["telemetria_ultimo_contato","telemetria_ultimo_contato TEXT"],
    ["progresso_percentual","progresso_percentual REAL NOT NULL DEFAULT 0"],
    ["temperatura_bico","temperatura_bico REAL"],
    ["temperatura_mesa","temperatura_mesa REAL"],
    ["trabalho_atual","trabalho_atual TEXT"],
    ["tempo_restante_min","tempo_restante_min INTEGER"],
    ["telemetria_status","telemetria_status TEXT"]
  ]);
}

const statements = [
  `CREATE TABLE IF NOT EXISTS modelos_3d (id INTEGER PRIMARY KEY AUTOINCREMENT,produto_id INTEGER NOT NULL,nome TEXT NOT NULL,versao TEXT,arquivo_nome TEXT,arquivo_url TEXT,peso_g REAL NOT NULL DEFAULT 0 CHECK (peso_g >= 0),tempo_minutos INTEGER NOT NULL DEFAULT 0 CHECK (tempo_minutos >= 0),impressora TEXT,bico_mm REAL,material_tipo TEXT,cor_recomendada TEXT,changelog TEXT,principal INTEGER NOT NULL DEFAULT 0 CHECK (principal IN (0,1)),observacoes TEXT,r2_key TEXT,r2_etag TEXT,arquivo_tamanho INTEGER NOT NULL DEFAULT 0,preview_r2_key TEXT,ativo INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0,1)),criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE)`,
  `CREATE INDEX IF NOT EXISTS idx_modelos3d_produto ON modelos_3d(produto_id, ativo)`,
  `CREATE INDEX IF NOT EXISTS idx_modelos3d_principal ON modelos_3d(produto_id, principal, ativo)`,
  `CREATE TABLE IF NOT EXISTS impressoras_3d (id INTEGER PRIMARY KEY AUTOINCREMENT,nome TEXT NOT NULL,modelo TEXT,bico_mm REAL NOT NULL DEFAULT 0.4,material_padrao TEXT,status TEXT NOT NULL DEFAULT 'livre' CHECK (status IN ('livre','imprimindo','pausada','manutencao','offline')),localizacao TEXT,observacoes TEXT,ativo INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0,1)),criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE INDEX IF NOT EXISTS idx_impressoras_status ON impressoras_3d(status, ativo)`,
  `CREATE TABLE IF NOT EXISTS ordens_impressao (id INTEGER PRIMARY KEY AUTOINCREMENT,produto_id INTEGER NOT NULL,modelo_3d_id INTEGER,impressora_id INTEGER,quantidade INTEGER NOT NULL CHECK (quantidade > 0),status TEXT NOT NULL DEFAULT 'fila' CHECK (status IN ('fila','imprimindo','pausada','concluida','cancelada','falhou')),peso_previsto_g REAL NOT NULL DEFAULT 0,tempo_previsto_min INTEGER NOT NULL DEFAULT 0,iniciado_em TEXT,concluido_em TEXT,observacoes TEXT,criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE RESTRICT,FOREIGN KEY (modelo_3d_id) REFERENCES modelos_3d(id) ON DELETE SET NULL,FOREIGN KEY (impressora_id) REFERENCES impressoras_3d(id) ON DELETE SET NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_ordens_status ON ordens_impressao(status, criado_em DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_ordens_impressora ON ordens_impressao(impressora_id, status)`,
  `CREATE TABLE IF NOT EXISTS ordem_material_reservas (id INTEGER PRIMARY KEY AUTOINCREMENT,ordem_id INTEGER NOT NULL,material_id INTEGER NOT NULL,quantidade REAL NOT NULL CHECK (quantidade > 0),criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY (ordem_id) REFERENCES ordens_impressao(id) ON DELETE CASCADE,FOREIGN KEY (material_id) REFERENCES materiais(id) ON DELETE RESTRICT,UNIQUE(ordem_id, material_id))`,
  `CREATE INDEX IF NOT EXISTS idx_reservas_material ON ordem_material_reservas(material_id)`,
  `CREATE INDEX IF NOT EXISTS idx_reservas_ordem ON ordem_material_reservas(ordem_id)`,
  `CREATE TABLE IF NOT EXISTS impressora_telemetria (id INTEGER PRIMARY KEY AUTOINCREMENT,impressora_id INTEGER NOT NULL,status TEXT,progresso_percentual REAL,temperatura_bico REAL,temperatura_mesa REAL,trabalho_atual TEXT,tempo_restante_min INTEGER,recebido_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY (impressora_id) REFERENCES impressoras_3d(id) ON DELETE CASCADE)`,
  `CREATE INDEX IF NOT EXISTS idx_telemetria_impressora ON impressora_telemetria(impressora_id, recebido_em DESC)`
];

const filamentos = [["FIL-PETG-BRANCO","PETG","Branco"],["FIL-PETG-PRETO","PETG","Preto"],["FIL-PETG-AZUL","PETG","Azul"],["FIL-PETG-VERMELHO","PETG","Vermelho"],["FIL-PETG-ROSA","PETG","Rosa"],["FIL-TPU-PRETO","TPU","Preto"],["FIL-PLA-BRANCO","PLA","Branco"],["FIL-PLA-PRETO","PLA","Preto"],["FIL-PLA-AMARELO","PLA","Amarelo"],["FIL-PLA-MARROM","PLA","Marrom"],["FIL-PLA-VERDE","PLA","Verde"],["FIL-PLA-VERMELHO","PLA","Vermelho"],["FIL-PLA-AZUL","PLA","Azul"],["FIL-PLA-ROSA","PLA","Rosa"]];

async function normalizeFilaments(env) {
  for (const [codigo,tipo,cor] of filamentos) {
    const atual=await env.DB.prepare(`SELECT id,unidade FROM materiais WHERE codigo=?`).bind(codigo).first(); if(!atual) continue;
    if(String(atual.unidade).toLowerCase()==="kg") await env.DB.prepare(`UPDATE materiais SET unidade='g',estoque=estoque*1000,estoque_minimo=estoque_minimo*1000,custo_medio=custo_medio/1000,categoria='Filamento',tipo=?,cor=?,peso_rolo_g=CASE WHEN peso_rolo_g>0 THEN peso_rolo_g ELSE 1000 END,atualizado_em=CURRENT_TIMESTAMP WHERE id=?`).bind(tipo,cor,atual.id).run();
    else await env.DB.prepare(`UPDATE materiais SET unidade='g',categoria='Filamento',tipo=?,cor=?,peso_rolo_g=CASE WHEN peso_rolo_g>0 THEN peso_rolo_g ELSE 1000 END,atualizado_em=CURRENT_TIMESTAMP WHERE id=?`).bind(tipo,cor,atual.id).run();
  }
}

export async function onRequestPost({request,env}){
  if(!(await authorized(request,env))) return unauthorized(env);
  try{
    await ensureMaterialColumns(env);
    await env.DB.batch(statements.map(sql=>env.DB.prepare(sql)));
    await ensureModelColumns(env);
    await ensurePrinterColumns(env);
    await normalizeFilaments(env);
    return json({sucesso:true,mensagem:"Estrutura administrativa e telemetria de impressoras atualizadas."});
  }catch(error){console.error("admin-upgrade",error);return json({sucesso:false,mensagem:"Não foi possível atualizar a estrutura administrativa."},500)}
}

export async function onRequest(context){if(context.request.method==="POST")return onRequestPost(context);return json({sucesso:false,mensagem:"Método não permitido."},405)}
