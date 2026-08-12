-- Orbitek Pets - Sprint 3.7: acompanhamento de peso
CREATE TABLE IF NOT EXISTS pet_pesos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tag_codigo TEXT NOT NULL,
  peso_kg REAL NOT NULL,
  data_medicao TEXT NOT NULL,
  observacoes TEXT,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pet_pesos_tag_data ON pet_pesos(tag_codigo, data_medicao DESC, id DESC);
