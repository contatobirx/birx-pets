-- Orbitek Pets - Sprint 3.14: antipulgas, carrapatos e vermífugos
CREATE TABLE IF NOT EXISTS pet_preventivos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tag_codigo TEXT NOT NULL,
  tipo TEXT NOT NULL,
  produto TEXT NOT NULL,
  dose TEXT,
  peso_kg REAL,
  data_aplicacao TEXT NOT NULL,
  proxima_aplicacao TEXT,
  lote TEXT,
  veterinario TEXT,
  observacoes TEXT,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pet_preventivos_tag_data ON pet_preventivos(tag_codigo, proxima_aplicacao, data_aplicacao DESC);
