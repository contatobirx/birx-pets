-- Orbitek Pets - Sprint 3.11: compartilhamento temporário com veterinário
CREATE TABLE IF NOT EXISTS compartilhamentos_veterinarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token_hash TEXT NOT NULL UNIQUE,
  tag_codigo TEXT NOT NULL,
  email_tutor TEXT NOT NULL,
  titulo TEXT NOT NULL DEFAULT 'Resumo veterinário',
  incluir_tutor INTEGER NOT NULL DEFAULT 1,
  incluir_cuidados INTEGER NOT NULL DEFAULT 1,
  incluir_medicamentos INTEGER NOT NULL DEFAULT 1,
  incluir_vacinas INTEGER NOT NULL DEFAULT 1,
  incluir_pesos INTEGER NOT NULL DEFAULT 1,
  incluir_agendamentos INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'ativo',
  acessos INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expira_em TEXT NOT NULL,
  ultimo_acesso_em TEXT,
  revogado_em TEXT
);
CREATE INDEX IF NOT EXISTS idx_compartilhamentos_vet_tutor ON compartilhamentos_veterinarios(email_tutor, status);
CREATE INDEX IF NOT EXISTS idx_compartilhamentos_vet_tag ON compartilhamentos_veterinarios(tag_codigo, status);
