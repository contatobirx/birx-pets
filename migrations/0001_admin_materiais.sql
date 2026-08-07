PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS materiais (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'Outros',
  codigo TEXT,
  unidade TEXT NOT NULL DEFAULT 'un',
  estoque REAL NOT NULL DEFAULT 0 CHECK (estoque >= 0),
  estoque_minimo REAL NOT NULL DEFAULT 0 CHECK (estoque_minimo >= 0),
  custo_medio REAL NOT NULL DEFAULT 0 CHECK (custo_medio >= 0),
  fornecedor_principal TEXT,
  observacoes TEXT,
  ativo INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0,1)),
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_materiais_codigo
  ON materiais(codigo)
  WHERE codigo IS NOT NULL AND TRIM(codigo) <> '';
CREATE INDEX IF NOT EXISTS idx_materiais_nome ON materiais(nome);
CREATE INDEX IF NOT EXISTS idx_materiais_categoria ON materiais(categoria);
CREATE INDEX IF NOT EXISTS idx_materiais_ativo ON materiais(ativo);

CREATE TABLE IF NOT EXISTS estoque_movimentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  material_id INTEGER NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada','saida','ajuste')),
  quantidade REAL NOT NULL,
  saldo_anterior REAL NOT NULL,
  saldo_novo REAL NOT NULL,
  valor_unitario REAL,
  origem TEXT NOT NULL DEFAULT 'manual',
  referencia TEXT,
  observacoes TEXT,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (material_id) REFERENCES materiais(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_movimentos_material ON estoque_movimentos(material_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_movimentos_origem ON estoque_movimentos(origem);
