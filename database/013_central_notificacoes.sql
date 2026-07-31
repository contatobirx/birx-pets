CREATE TABLE IF NOT EXISTS notificacoes_tutor (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  tag_codigo TEXT NOT NULL,
  tipo TEXT NOT NULL,
  janela TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  url TEXT,
  lida INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(email, tag_codigo, tipo, janela)
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_tutor_email_data
  ON notificacoes_tutor(email, lida, criado_em DESC);
