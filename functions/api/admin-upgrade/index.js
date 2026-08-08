import { authorized, json, unauthorized } from "../admin-shared.js";

async function ensureMaterialColumns(env) {
  const info = await env.DB.prepare(`PRAGMA table_info(materiais)`).all();
  const cols = new Set((info.results || []).map((r) => r.name));
  const alters = [];
  if (!cols.has("tipo")) alters.push(`ALTER TABLE materiais ADD COLUMN tipo TEXT`);
  if (!cols.has("cor")) alters.push(`ALTER TABLE materiais ADD COLUMN cor TEXT`);
  if (!cols.has("marca")) alters.push(`ALTER TABLE materiais ADD COLUMN marca TEXT`);
  if (!cols.has("peso_rolo_g")) alters.push(`ALTER TABLE materiais ADD COLUMN peso_rolo_g REAL NOT NULL DEFAULT 0`);
  if (!cols.has("perda_percentual")) alters.push(`ALTER TABLE materiais ADD COLUMN perda_percentual REAL NOT NULL DEFAULT 0`);
  for (const sql of alters) await env.DB.prepare(sql).run();
}

async function ensureModelColumns(env) {
  const info = await env.DB.prepare(`PRAGMA table_info(modelos_3d)`).all();
  const cols = new Set((info.results || []).map((r) => r.name));
  const alters = [];
  if (!cols.has("r2_key")) alters.push(`ALTER TABLE modelos_3d ADD COLUMN r2_key TEXT`);
  if (!cols.has("r2_etag")) alters.push(`ALTER TABLE modelos_3d ADD COLUMN r2_etag TEXT`);
  if (!cols.has("arquivo_tamanho")) alters.push(`ALTER TABLE modelos_3d ADD COLUMN arquivo_tamanho INTEGER NOT NULL DEFAULT 0`);
  if (!cols.has("preview_r2_key")) alters.push(`ALTER TABLE modelos_3d ADD COLUMN preview_r2_key TEXT`);
  for (const sql of alters) await env.DB.prepare(sql).run();
}

const statements = [
  `CREATE TABLE IF NOT EXISTS modelos_3d (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produto_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    versao TEXT,
    arquivo_nome TEXT,
    arquivo_url TEXT,
    peso_g REAL NOT NULL DEFAULT 0 CHECK (peso_g >= 0),
    tempo_minutos INTEGER NOT NULL DEFAULT 0 CHECK (tempo_minutos >= 0),
    impressora TEXT,
    bico_mm REAL,
    material_tipo TEXT,
    observacoes TEXT,
    r2_key TEXT,
    r2_etag TEXT,
    arquivo_tamanho INTEGER NOT NULL DEFAULT 0,
    preview_r2_key TEXT,
    ativo INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0,1)),
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS idx_modelos3d_produto ON modelos_3d(produto_id, ativo)`,
  `CREATE TABLE IF NOT EXISTS impressoras_3d (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    modelo TEXT,
    bico_mm REAL NOT NULL DEFAULT 0.4,
    material_padrao TEXT,
    status TEXT NOT NULL DEFAULT 'livre' CHECK (status IN ('livre','imprimindo','pausada','manutencao','offline')),
    localizacao TEXT,
    observacoes TEXT,
    ativo INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0,1)),
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_impressoras_status ON impressoras_3d(status, ativo)`,
  `CREATE TABLE IF NOT EXISTS ordens_impressao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produto_id INTEGER NOT NULL,
    modelo_3d_id INTEGER,
    impressora_id INTEGER,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    status TEXT NOT NULL DEFAULT 'fila' CHECK (status IN ('fila','imprimindo','pausada','concluida','cancelada','falhou')),
    peso_previsto_g REAL NOT NULL DEFAULT 0,
    tempo_previsto_min INTEGER NOT NULL DEFAULT 0,
    iniciado_em TEXT,
    concluido_em TEXT,
    observacoes TEXT,
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE RESTRICT,
    FOREIGN KEY (modelo_3d_id) REFERENCES modelos_3d(id) ON DELETE SET NULL,
    FOREIGN KEY (impressora_id) REFERENCES impressoras_3d(id) ON DELETE SET NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_ordens_status ON ordens_impressao(status, criado_em DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_ordens_impressora ON ordens_impressao(impressora_id, status)`
];

const filamentos = [
  ["FIL-PETG-BRANCO", "PETG", "Branco"], ["FIL-PETG-PRETO", "PETG", "Preto"],
  ["FIL-PETG-AZUL", "PETG", "Azul"], ["FIL-PETG-VERMELHO", "PETG", "Vermelho"],
  ["FIL-PETG-ROSA", "PETG", "Rosa"], ["FIL-TPU-PRETO", "TPU", "Preto"],
  ["FIL-PLA-BRANCO", "PLA", "Branco"], ["FIL-PLA-PRETO", "PLA", "Preto"],
  ["FIL-PLA-AMARELO", "PLA", "Amarelo"], ["FIL-PLA-MARROM", "PLA", "Marrom"],
  ["FIL-PLA-VERDE", "PLA", "Verde"], ["FIL-PLA-VERMELHO", "PLA", "Vermelho"],
  ["FIL-PLA-AZUL", "PLA", "Azul"], ["FIL-PLA-ROSA", "PLA", "Rosa"]
];

async function normalizeFilaments(env) {
  for (const [codigo, tipo, cor] of filamentos) {
    const atual = await env.DB.prepare(`SELECT id,unidade FROM materiais WHERE codigo=?`).bind(codigo).first();
    if (!atual) continue;
    if (String(atual.unidade).toLowerCase() === "kg") {
      await env.DB.prepare(`UPDATE materiais SET unidade='g',estoque=estoque*1000,estoque_minimo=estoque_minimo*1000,custo_medio=custo_medio/1000,categoria='Filamento',tipo=?,cor=?,peso_rolo_g=CASE WHEN peso_rolo_g>0 THEN peso_rolo_g ELSE 1000 END,atualizado_em=CURRENT_TIMESTAMP WHERE id=?`).bind(tipo, cor, atual.id).run();
    } else {
      await env.DB.prepare(`UPDATE materiais SET unidade='g',categoria='Filamento',tipo=?,cor=?,peso_rolo_g=CASE WHEN peso_rolo_g>0 THEN peso_rolo_g ELSE 1000 END,atualizado_em=CURRENT_TIMESTAMP WHERE id=?`).bind(tipo, cor, atual.id).run();
    }
  }
}

export async function onRequestPost({ request, env }) {
  if (!(await authorized(request, env))) return unauthorized(env);
  try {
    await ensureMaterialColumns(env);
    await env.DB.batch(statements.map((sql) => env.DB.prepare(sql)));
    await ensureModelColumns(env);
    await normalizeFilaments(env);
    return json({ sucesso: true, mensagem: "Estrutura de materiais, R2 e central de produção atualizada." });
  } catch (error) {
    console.error("admin-upgrade", error);
    return json({ sucesso: false, mensagem: "Não foi possível atualizar a estrutura administrativa." }, 500);
  }
}

export async function onRequest(context) {
  if (context.request.method === "POST") return onRequestPost(context);
  return json({ sucesso: false, mensagem: "Método não permitido." }, 405);
}
