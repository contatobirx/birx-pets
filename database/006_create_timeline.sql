-- Orbitek Pets - Timeline do Pet
-- Execute uma vez no banco D1 de produção e, se desejar, no banco local.

CREATE TABLE IF NOT EXISTS pet_timeline (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tag_codigo TEXT NOT NULL,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_evento TEXT NOT NULL,
  automatico INTEGER NOT NULL DEFAULT 0,
  criado_por TEXT,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pet_timeline_tag_data
ON pet_timeline(tag_codigo, data_evento DESC);

CREATE INDEX IF NOT EXISTS idx_pet_timeline_tipo
ON pet_timeline(tipo);
