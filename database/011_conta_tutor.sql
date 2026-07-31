ALTER TABLE sessoes_tutor ADD COLUMN provedor TEXT NOT NULL DEFAULT 'email';
CREATE TABLE IF NOT EXISTS solicitacoes_exclusao (id INTEGER PRIMARY KEY AUTOINCREMENT,email TEXT NOT NULL,solicitado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,status TEXT NOT NULL DEFAULT 'pendente',ip TEXT);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_exclusao_email ON solicitacoes_exclusao(email,status);
