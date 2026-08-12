PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS produtos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  codigo TEXT,
  categoria TEXT NOT NULL DEFAULT 'Birx ID',
  estoque REAL NOT NULL DEFAULT 0 CHECK (estoque >= 0),
  estoque_minimo REAL NOT NULL DEFAULT 0 CHECK (estoque_minimo >= 0),
  custo REAL NOT NULL DEFAULT 0 CHECK (custo >= 0),
  preco_venda REAL NOT NULL DEFAULT 0 CHECK (preco_venda >= 0),
  observacoes TEXT,
  ativo INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0,1)),
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_produtos_codigo
  ON produtos(codigo)
  WHERE codigo IS NOT NULL AND TRIM(codigo) <> '';
CREATE INDEX IF NOT EXISTS idx_produtos_nome ON produtos(nome);
CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON produtos(ativo);
