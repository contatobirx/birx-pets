CREATE TABLE IF NOT EXISTS preferencias_notificacao (
  email TEXT PRIMARY KEY,
  alerta_leitura INTEGER NOT NULL DEFAULT 1,
  alerta_localizacao INTEGER NOT NULL DEFAULT 1,
  apenas_modo_perdido INTEGER NOT NULL DEFAULT 0,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alertas_enviados (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tag_codigo TEXT NOT NULL,
  tipo TEXT NOT NULL,
  janela TEXT NOT NULL,
  destinatario TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'reservado',
  UNIQUE(tag_codigo, tipo, janela, destinatario)
);

CREATE INDEX IF NOT EXISTS idx_alertas_enviados_tag_data
  ON alertas_enviados(tag_codigo, criado_em DESC);
