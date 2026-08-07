PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS fornecedores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  cnpj TEXT,
  contato TEXT,
  whatsapp TEXT,
  email TEXT,
  site TEXT,
  observacoes TEXT,
  ativo INTEGER NOT NULL DEFAULT 1,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_fornecedores_nome ON fornecedores(nome);
CREATE INDEX IF NOT EXISTS idx_fornecedores_ativo ON fornecedores(ativo);

CREATE TABLE IF NOT EXISTS compras (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fornecedor_id INTEGER,
  numero_nf TEXT,
  data_compra TEXT NOT NULL,
  frete REAL NOT NULL DEFAULT 0,
  desconto REAL NOT NULL DEFAULT 0,
  impostos REAL NOT NULL DEFAULT 0,
  total_itens REAL NOT NULL DEFAULT 0,
  total_final REAL NOT NULL DEFAULT 0,
  observacoes TEXT,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id)
);
CREATE INDEX IF NOT EXISTS idx_compras_data ON compras(data_compra);
CREATE INDEX IF NOT EXISTS idx_compras_fornecedor ON compras(fornecedor_id);

CREATE TABLE IF NOT EXISTS compra_itens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  compra_id INTEGER NOT NULL,
  material_id INTEGER NOT NULL,
  quantidade REAL NOT NULL,
  valor_unitario REAL NOT NULL,
  total REAL NOT NULL,
  FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE,
  FOREIGN KEY (material_id) REFERENCES materiais(id)
);
CREATE INDEX IF NOT EXISTS idx_compra_itens_compra ON compra_itens(compra_id);
CREATE INDEX IF NOT EXISTS idx_compra_itens_material ON compra_itens(material_id);
