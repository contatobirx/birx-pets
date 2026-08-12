-- BIRX Pets - Sprint 4.4: Encontrei um Pet
CREATE TABLE IF NOT EXISTS pets_encontrados (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo_publico TEXT NOT NULL UNIQUE,
  token_hash TEXT NOT NULL,
  especie TEXT NOT NULL,
  porte TEXT,
  foto_url TEXT NOT NULL,
  foto_public_id TEXT,
  encontrado_em TEXT NOT NULL,
  cidade TEXT NOT NULL,
  bairro TEXT,
  estado TEXT,
  referencia_local TEXT,
  latitude REAL,
  longitude REAL,
  observacoes TEXT,
  em_seguranca INTEGER NOT NULL DEFAULT 0,
  contato_nome TEXT NOT NULL,
  contato_tipo TEXT NOT NULL,
  contato_valor TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativo',
  expira_em TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  encerrado_em TEXT
);
CREATE INDEX IF NOT EXISTS idx_pets_encontrados_ativos ON pets_encontrados(status, expira_em, cidade, especie);

CREATE TABLE IF NOT EXISTS pets_encontrados_limites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  origem_hash TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_encontrados_limite ON pets_encontrados_limites(origem_hash, criado_em);
