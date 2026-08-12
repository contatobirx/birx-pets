-- BIRX Pets - Sprint 4.10: Loja BIRX
CREATE TABLE IF NOT EXISTS loja_produtos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL,
  imagem_url TEXT,
  icone TEXT,
  preco_centavos INTEGER NOT NULL,
  estoque INTEGER NOT NULL DEFAULT 0,
  ativo INTEGER NOT NULL DEFAULT 1,
  destaque INTEGER NOT NULL DEFAULT 0,
  ordem INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loja_cupons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL DEFAULT 'percentual',
  valor INTEGER NOT NULL,
  minimo_centavos INTEGER NOT NULL DEFAULT 0,
  limite_usos INTEGER,
  usos INTEGER NOT NULL DEFAULT 0,
  parceiro_id INTEGER,
  ativo INTEGER NOT NULL DEFAULT 1,
  valido_ate TEXT,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(parceiro_id) REFERENCES parceiros(id)
);

CREATE TABLE IF NOT EXISTS loja_pedidos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  cep TEXT NOT NULL,
  logradouro TEXT NOT NULL,
  numero TEXT NOT NULL,
  complemento TEXT,
  bairro TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  subtotal_centavos INTEGER NOT NULL,
  desconto_centavos INTEGER NOT NULL DEFAULT 0,
  frete_centavos INTEGER NOT NULL DEFAULT 0,
  total_centavos INTEGER NOT NULL,
  forma_pagamento TEXT NOT NULL DEFAULT 'pix',
  status_pagamento TEXT NOT NULL DEFAULT 'aguardando',
  status_pedido TEXT NOT NULL DEFAULT 'novo',
  cupom_codigo TEXT,
  referencia_parceiro TEXT,
  pix_txid TEXT,
  pix_copia_cola TEXT,
  codigo_rastreio TEXT,
  observacoes TEXT,
  origem_hash TEXT,
  estoque_devolvido INTEGER NOT NULL DEFAULT 0,
  pago_em TEXT,
  enviado_em TEXT,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loja_pedido_itens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pedido_codigo TEXT NOT NULL,
  produto_id INTEGER NOT NULL,
  produto_slug TEXT NOT NULL,
  nome TEXT NOT NULL,
  preco_centavos INTEGER NOT NULL,
  quantidade INTEGER NOT NULL,
  total_centavos INTEGER NOT NULL,
  FOREIGN KEY(pedido_codigo) REFERENCES loja_pedidos(codigo),
  FOREIGN KEY(produto_id) REFERENCES loja_produtos(id)
);

CREATE TABLE IF NOT EXISTS loja_pedido_eventos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pedido_codigo TEXT NOT NULL,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(pedido_codigo) REFERENCES loja_pedidos(codigo)
);

CREATE INDEX IF NOT EXISTS idx_loja_produtos_catalogo ON loja_produtos(ativo, categoria, ordem);
CREATE INDEX IF NOT EXISTS idx_loja_pedidos_email ON loja_pedidos(LOWER(email), criado_em);
CREATE INDEX IF NOT EXISTS idx_loja_pedidos_status ON loja_pedidos(status_pagamento, status_pedido, criado_em);
CREATE INDEX IF NOT EXISTS idx_loja_eventos_pedido ON loja_pedido_eventos(pedido_codigo, criado_em);

INSERT OR IGNORE INTO loja_produtos(slug,nome,descricao,categoria,imagem_url,icone,preco_centavos,estoque,destaque,ordem) VALUES
('birx-id-essential','BIRX ID Essential','Nome e telefone gravados para uma identificação simples e direta.','birx-id','/assets/tag-essential.png','🏷️',1990,50,0,10),
('birx-id-nfc','BIRX ID NFC Connect','NFC e QR Code conectados ao perfil digital atualizável do pet.','birx-id','/assets/tag-nfc.png','📱',2990,50,1,20),
('birx-id-smart','BIRX ID Smart NFC','NFC, QR Code, nome e telefone reunidos na mesma tag.','birx-id','/assets/tag-nfc-identificacao.png','🛡️',3990,50,1,30),
('birx-cat','BIRX Cat','Identificação leve, compacta e silenciosa para gatos.','birx-id','/assets/tag-essential.png','🐈',2990,30,1,40),
('kit-protecao','Kit Proteção BIRX','Duas BIRX ID NFC Connect para proteger pets da mesma família.','kits','/assets/tag-nfc.png','🐾',5490,25,0,50),
('pa-dosadora','Pá dosadora 3D','Pá dosadora para organizar as porções diárias de alimento.','impressos-3d',NULL,'🥄',1990,20,0,60),
('porta-racao','Porta-ração 3D','Recipiente compacto para guardar uma porção de alimento.','impressos-3d',NULL,'🥣',3490,20,0,70),
('porta-remedios','Porta-remédios 3D','Organizador prático para os medicamentos do pet.','impressos-3d',NULL,'💊',2490,20,0,80),
('organizador-pet','Organizador pet 3D','Organizador para acessórios, sachês e itens de cuidado.','impressos-3d',NULL,'🧺',3990,20,0,90);
