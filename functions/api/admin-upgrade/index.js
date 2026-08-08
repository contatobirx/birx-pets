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

const modelosStatements = [
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
    ativo INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0,1)),
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS idx_modelos3d_produto ON modelos_3d(produto_id, ativo)`,
];

const filamentos = [
  ["FIL-PETG-BRANCO", "PETG", "Branco"], ["FIL-PETG-PRETO", "PETG", "Preto"],
  ["FIL-PETG-AZUL", "PETG", "Azul"], ["FIL-PETG-VERMELHO", "PETG", "Vermelho"],
  ["FIL-PETG-ROSA", "PETG", "Rosa"], ["FIL-TPU-PRETO", "TPU", "Preto"],
  ["FIL-PLA-BRANCO", "PLA", "Branco"], ["FIL-PLA-PRETO", "PLA", "Preto"],
  ["FIL-PLA-AMARELO", "PLA", "Amarelo"], ["FIL-PLA-MARROM", "PLA", "Marrom"],
  ["FIL-PLA-VERDE", "PLA", "Verde"], ["FIL-PLA-VERMELHO", "PLA", "Vermelho"],
  ["FIL-PLA-AZUL", "PLA", "Azul"], ["FIL-PLA-ROSA", "PLA", "Rosa"],
];

async function normalizeFilaments(env) {
  for (const [codigo, tipo, cor] of filamentos) {
    const atual = await env.DB.prepare(`SELECT id,unidade,estoque,estoque_minimo,custo_medio FROM materiais WHERE codigo=?`).bind(codigo).first();
    if (!atual) continue;
    if (String(atual.unidade).toLowerCase() === "kg") {
      await env.DB.prepare(`UPDATE materiais SET unidade='g',estoque=estoque*1000,estoque_minimo=estoque_minimo*1000,custo_medio=custo_medio/1000,categoria='Filamento',tipo=?,cor=?,peso_rolo_g=CASE WHEN peso_rolo_g>0 THEN peso_rolo_g ELSE 1000 END,atualizado_em=CURRENT_TIMESTAMP WHERE id=?`)
        .bind(tipo, cor, atual.id).run();
    } else {
      await env.DB.prepare(`UPDATE materiais SET unidade='g',categoria='Filamento',tipo=?,cor=?,peso_rolo_g=CASE WHEN peso_rolo_g>0 THEN peso_rolo_g ELSE 1000 END,atualizado_em=CURRENT_TIMESTAMP WHERE id=?`)
        .bind(tipo, cor, atual.id).run();
    }
  }
}

export async function onRequestPost({ request, env }) {
  if (!(await authorized(request, env))) return unauthorized(env);
  try {
    await ensureMaterialColumns(env);
    await env.DB.batch(modelosStatements.map((sql) => env.DB.prepare(sql)));
    await normalizeFilaments(env);
    return json({ sucesso: true, mensagem: "Estrutura de materiais e Modelos 3D atualizada." });
  } catch (error) {
    console.error("admin-upgrade", error);
    return json({ sucesso: false, mensagem: "Não foi possível atualizar a estrutura administrativa." }, 500);
  }
}

export async function onRequest(context) {
  if (context.request.method === "POST") return onRequestPost(context);
  return json({ sucesso: false, mensagem: "Método não permitido." }, 405);
}
