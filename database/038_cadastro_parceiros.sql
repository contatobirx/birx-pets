-- BIRX Pets - cadastro público de interesse no Programa de Parceiros
CREATE TABLE IF NOT EXISTS parceiro_cadastro_envios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email_hash TEXT NOT NULL,
  origem_hash TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_parceiro_cadastro_origem
  ON parceiro_cadastro_envios(origem_hash, criado_em);
