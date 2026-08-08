import { authorized, json, unauthorized } from "../admin-shared.js";

const statements = [
  `CREATE TABLE IF NOT EXISTS materiais (
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
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_materiais_codigo ON materiais(codigo) WHERE codigo IS NOT NULL AND TRIM(codigo) <> ''`,
  `CREATE INDEX IF NOT EXISTS idx_materiais_nome ON materiais(nome)`,
  `CREATE INDEX IF NOT EXISTS idx_materiais_categoria ON materiais(categoria)`,
  `CREATE INDEX IF NOT EXISTS idx_materiais_ativo ON materiais(ativo)`,
  `CREATE TABLE IF NOT EXISTS estoque_movimentos (
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
  )`,
  `CREATE INDEX IF NOT EXISTS idx_movimentos_material ON estoque_movimentos(material_id, criado_em DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_movimentos_origem ON estoque_movimentos(origem)`,
  `CREATE TABLE IF NOT EXISTS fornecedores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cnpj TEXT,
    contato TEXT,
    telefone TEXT,
    whatsapp TEXT,
    email TEXT,
    site TEXT,
    observacoes TEXT,
    ativo INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0,1)),
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_fornecedores_cnpj ON fornecedores(cnpj) WHERE cnpj IS NOT NULL AND TRIM(cnpj) <> '' AND ativo=1`,
  `CREATE INDEX IF NOT EXISTS idx_fornecedores_nome ON fornecedores(nome)`,
  `CREATE INDEX IF NOT EXISTS idx_fornecedores_ativo ON fornecedores(ativo)`,
  `CREATE TABLE IF NOT EXISTS compras (
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
  )`,
  `CREATE INDEX IF NOT EXISTS idx_compras_data ON compras(data_compra)`,
  `CREATE INDEX IF NOT EXISTS idx_compras_fornecedor ON compras(fornecedor_id)`,
  `CREATE TABLE IF NOT EXISTS compra_itens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    compra_id INTEGER NOT NULL,
    material_id INTEGER NOT NULL,
    quantidade REAL NOT NULL,
    valor_unitario REAL NOT NULL,
    total REAL NOT NULL,
    FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materiais(id)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_compra_itens_compra ON compra_itens(compra_id)`,
  `CREATE INDEX IF NOT EXISTS idx_compra_itens_material ON compra_itens(material_id)`,
  `CREATE TABLE IF NOT EXISTS produtos (
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
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_produtos_codigo ON produtos(codigo) WHERE codigo IS NOT NULL AND TRIM(codigo) <> ''`,
  `CREATE INDEX IF NOT EXISTS idx_produtos_nome ON produtos(nome)`,
  `CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON produtos(ativo)`,
  `CREATE TABLE IF NOT EXISTS produto_materiais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produto_id INTEGER NOT NULL,
    material_id INTEGER NOT NULL,
    quantidade REAL NOT NULL CHECK (quantidade > 0),
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materiais(id) ON DELETE RESTRICT,
    UNIQUE(produto_id, material_id)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_produto_materiais_produto ON produto_materiais(produto_id)`,
  `CREATE TABLE IF NOT EXISTS produto_precificacao (
    produto_id INTEGER PRIMARY KEY,
    custo_extra REAL NOT NULL DEFAULT 0 CHECK (custo_extra >= 0),
    taxa_percentual REAL NOT NULL DEFAULT 0 CHECK (taxa_percentual >= 0),
    margem_percentual REAL NOT NULL DEFAULT 0 CHECK (margem_percentual >= 0),
    preco_manual REAL,
    atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS producoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produto_id INTEGER NOT NULL,
    quantidade REAL NOT NULL CHECK (quantidade > 0),
    custo_unitario REAL NOT NULL DEFAULT 0,
    custo_total REAL NOT NULL DEFAULT 0,
    observacoes TEXT,
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE RESTRICT
  )`,
  `CREATE INDEX IF NOT EXISTS idx_producoes_produto ON producoes(produto_id, criado_em DESC)`,
  `CREATE TABLE IF NOT EXISTS producao_itens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producao_id INTEGER NOT NULL,
    material_id INTEGER NOT NULL,
    quantidade_unitaria REAL NOT NULL,
    quantidade_consumida REAL NOT NULL,
    custo_unitario REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (producao_id) REFERENCES producoes(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materiais(id) ON DELETE RESTRICT
  )`,
  `CREATE INDEX IF NOT EXISTS idx_producao_itens_producao ON producao_itens(producao_id)`
];

const materiaisIniciais = [
  ["PETG Branco", "Filamento PETG", "FIL-PETG-BRANCO", "kg"],
  ["PETG Preto", "Filamento PETG", "FIL-PETG-PRETO", "kg"],
  ["PETG Azul", "Filamento PETG", "FIL-PETG-AZUL", "kg"],
  ["PETG Vermelho", "Filamento PETG", "FIL-PETG-VERMELHO", "kg"],
  ["PETG Rosa", "Filamento PETG", "FIL-PETG-ROSA", "kg"],
  ["TPU Preto", "Filamento TPU", "FIL-TPU-PRETO", "kg"],
  ["PLA Branco", "Filamento PLA", "FIL-PLA-BRANCO", "kg"],
  ["PLA Preto", "Filamento PLA", "FIL-PLA-PRETO", "kg"],
  ["PLA Amarelo", "Filamento PLA", "FIL-PLA-AMARELO", "kg"],
  ["PLA Marrom", "Filamento PLA", "FIL-PLA-MARROM", "kg"],
  ["PLA Verde", "Filamento PLA", "FIL-PLA-VERDE", "kg"],
  ["PLA Vermelho", "Filamento PLA", "FIL-PLA-VERMELHO", "kg"],
  ["PLA Azul", "Filamento PLA", "FIL-PLA-AZUL", "kg"],
  ["PLA Rosa", "Filamento PLA", "FIL-PLA-ROSA", "kg"],
  ["TAG NFC", "Eletrônicos", "TAG-NFC", "un"],
  ["Argola", "Ferragens", "ARGOLA", "un"],
  ["Panfleto", "Impressos", "PANFLETO", "un"],
  ["Adesivo QR Code", "Impressos", "ADESIVO-QRCODE", "un"],
  ["Cartela expositora da TAG", "Apresentação", "CARTELA-TAG", "un"]
];

export async function onRequestPost({ request, env }) {
  if (!(await authorized(request, env))) return unauthorized(env);
  try {
    await env.DB.batch(statements.map((sql) => env.DB.prepare(sql)));
    const seeds = materiaisIniciais.map(([nome, categoria, codigo, unidade]) =>
      env.DB.prepare(`INSERT OR IGNORE INTO materiais (nome,categoria,codigo,unidade,estoque,estoque_minimo,custo_medio,observacoes) VALUES (?,?,?,?,0,0,0,?)`)
        .bind(nome, categoria, codigo, unidade, "Material inicial BIRX; edite estoque, custo, tamanho e demais detalhes conforme necessário."),
    );
    await env.DB.batch(seeds);
    return json({ sucesso: true, mensagem: "Banco do BIRX Admin preparado com sucesso.", materiais_iniciais: materiaisIniciais.length });
  } catch (error) {
    console.error("admin-migrate", error);
    return json({ sucesso: false, mensagem: "Não foi possível preparar o banco administrativo." }, 500);
  }
}

export async function onRequest(context) {
  if (context.request.method === "POST") return onRequestPost(context);
  return json({ sucesso: false, mensagem: "Método não permitido." }, 405);
}
