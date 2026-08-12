-- Orbitek Pets - Módulo Documentos
-- Execute pelo arquivo. Não é necessário colar o SQL no terminal.

CREATE TABLE IF NOT EXISTS documentos_pet (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tag_codigo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  titulo TEXT NOT NULL,
  arquivo_url TEXT NOT NULL,
  arquivo_tipo TEXT NOT NULL,
  arquivo_public_id TEXT,
  recurso_tipo TEXT NOT NULL DEFAULT 'image',
  nome_arquivo TEXT,
  tamanho_bytes INTEGER,
  criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documentos_pet_tag
ON documentos_pet(tag_codigo);

CREATE INDEX IF NOT EXISTS idx_documentos_pet_categoria
ON documentos_pet(categoria);

CREATE INDEX IF NOT EXISTS idx_documentos_pet_criado
ON documentos_pet(criado_em);
