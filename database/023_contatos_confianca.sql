-- Orbitek Pets - Sprint 3.9: contatos de confiança
CREATE TABLE IF NOT EXISTS pet_contatos_confianca (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tag_codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  vinculo TEXT,
  whatsapp TEXT NOT NULL,
  email TEXT,
  prioridade INTEGER NOT NULL DEFAULT 2,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_contatos_confianca_tag ON pet_contatos_confianca(tag_codigo, prioridade, id);
