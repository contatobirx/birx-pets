-- Orbitek Pets - Módulo Saúde
-- Pode ser executado mais de uma vez sem apagar os registros existentes.

CREATE TABLE IF NOT EXISTS saude_pet (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tag_codigo TEXT NOT NULL,
  tipo TEXT NOT NULL,
  nome TEXT NOT NULL,
  data_aplicacao TEXT,
  proxima_data TEXT,
  observacoes TEXT,
  criado_em TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_saude_pet_tag_codigo
ON saude_pet(tag_codigo);

CREATE INDEX IF NOT EXISTS idx_saude_pet_proxima_data
ON saude_pet(proxima_data);
