-- Orbitek Pets - Sprint 3.4: transferência segura com aceite
CREATE TABLE IF NOT EXISTS transferencias_pet (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token_hash TEXT NOT NULL UNIQUE,
  tag_codigo TEXT NOT NULL,
  email_origem TEXT NOT NULL,
  email_destino TEXT NOT NULL,
  nome_destino TEXT NOT NULL,
  whatsapp_destino TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expira_em TEXT NOT NULL,
  aceito_em TEXT,
  cancelado_em TEXT
);

CREATE INDEX IF NOT EXISTS idx_transferencias_pet_tag ON transferencias_pet(tag_codigo, status);
CREATE INDEX IF NOT EXISTS idx_transferencias_pet_destino ON transferencias_pet(email_destino, status);
