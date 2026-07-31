-- Orbitek Pets - Sprint 2.13: Medicamentos por pet

CREATE TABLE IF NOT EXISTS pet_medicamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tag_codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  dosagem TEXT,
  frequencia TEXT NOT NULL,
  horarios TEXT,
  data_inicio TEXT NOT NULL,
  data_fim TEXT,
  veterinario TEXT,
  observacoes TEXT,
  ativo INTEGER NOT NULL DEFAULT 1,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pet_medicamentos_tag
ON pet_medicamentos(tag_codigo);

CREATE INDEX IF NOT EXISTS idx_pet_medicamentos_ativos
ON pet_medicamentos(tag_codigo, ativo, data_fim);
