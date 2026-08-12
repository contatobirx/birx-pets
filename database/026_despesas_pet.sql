-- Orbitek Pets - Sprint 3.13: controle de despesas por pet
CREATE TABLE IF NOT EXISTS pet_despesas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tag_codigo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor_centavos INTEGER NOT NULL,
  data_despesa TEXT NOT NULL,
  estabelecimento TEXT,
  forma_pagamento TEXT,
  observacoes TEXT,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pet_despesas_tag_data ON pet_despesas(tag_codigo, data_despesa DESC);
