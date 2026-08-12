-- BIRX Pets - Sprint 4.3: Alimentacao Inteligente
CREATE TABLE IF NOT EXISTS pet_alimentacao (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tag_codigo TEXT NOT NULL,
  marca TEXT NOT NULL,
  linha TEXT,
  tipo TEXT NOT NULL DEFAULT 'seca',
  quantidade_diaria_g REAL NOT NULL,
  horarios TEXT NOT NULL,
  pacote_g REAL NOT NULL,
  iniciado_em TEXT NOT NULL,
  alerta_dias INTEGER NOT NULL DEFAULT 5,
  observacoes TEXT,
  ativo INTEGER NOT NULL DEFAULT 1,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pet_alimentacao_tag ON pet_alimentacao(tag_codigo, ativo);

CREATE TABLE IF NOT EXISTS pet_alimentacao_historico (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  alimentacao_id INTEGER,
  tag_codigo TEXT NOT NULL,
  acao TEXT NOT NULL,
  resumo TEXT NOT NULL,
  registrado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_alimentacao_historico_tag ON pet_alimentacao_historico(tag_codigo, registrado_em);
