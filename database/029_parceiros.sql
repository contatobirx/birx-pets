-- BIRX Pets - Sprint 4.2: parceiros, sessões, estoque e vendas
CREATE TABLE IF NOT EXISTS parceiros (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  documento TEXT,
  email TEXT NOT NULL UNIQUE,
  whatsapp TEXT,
  cidade TEXT,
  estado TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK(status IN ('pendente','ativo','suspenso')),
  codigo_acesso_hash TEXT,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parceiro_sessoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parceiro_id INTEGER NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expira_em TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(parceiro_id) REFERENCES parceiros(id)
);
CREATE INDEX IF NOT EXISTS idx_parceiro_sessoes_token ON parceiro_sessoes(token_hash, expira_em);

CREATE TABLE IF NOT EXISTS parceiro_estoque (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parceiro_id INTEGER NOT NULL,
  tag_codigo TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'estoque' CHECK(status IN ('estoque','vendida','ativada','devolvida')),
  recebido_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  vendido_em TEXT,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(parceiro_id) REFERENCES parceiros(id)
);
CREATE INDEX IF NOT EXISTS idx_parceiro_estoque_parceiro ON parceiro_estoque(parceiro_id, status);

CREATE TABLE IF NOT EXISTS parceiro_vendas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parceiro_id INTEGER NOT NULL,
  tag_codigo TEXT NOT NULL UNIQUE,
  observacoes TEXT,
  vendido_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(parceiro_id) REFERENCES parceiros(id)
);

