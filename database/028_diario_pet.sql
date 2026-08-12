-- Orbitek Pets - Sprint 3.15: diário de bem-estar do pet
CREATE TABLE IF NOT EXISTS pet_diario (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tag_codigo TEXT NOT NULL,
  data_hora TEXT NOT NULL,
  humor TEXT,
  energia TEXT,
  apetite TEXT,
  consumo_agua TEXT,
  fezes TEXT,
  sintomas TEXT,
  observacoes TEXT,
  nivel_atencao TEXT NOT NULL DEFAULT 'normal',
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pet_diario_tag_data ON pet_diario(tag_codigo, data_hora DESC);
