-- Orbitek Pets - Sprint 2.14.1: assinaturas Web Push
CREATE TABLE IF NOT EXISTS push_assinaturas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  ativo INTEGER NOT NULL DEFAULT 1,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_push_assinaturas_email ON push_assinaturas(email, ativo);

CREATE TABLE IF NOT EXISTS push_medicamentos_enviados (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assinatura_id INTEGER NOT NULL,
  medicamento_id INTEGER NOT NULL,
  janela TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(assinatura_id, medicamento_id, janela)
);
