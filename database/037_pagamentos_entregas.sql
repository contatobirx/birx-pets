-- BIRX Pets - Sprint 4.11: Pagamentos e Entregas
ALTER TABLE loja_pedidos ADD COLUMN modalidade_entrega TEXT NOT NULL DEFAULT 'envio';
ALTER TABLE loja_pedidos ADD COLUMN frete_descricao TEXT;
ALTER TABLE loja_pedidos ADD COLUMN prazo_entrega_min_dias INTEGER;
ALTER TABLE loja_pedidos ADD COLUMN prazo_entrega_max_dias INTEGER;
ALTER TABLE loja_pedidos ADD COLUMN comprovante_url TEXT;
ALTER TABLE loja_pedidos ADD COLUMN comprovante_public_id TEXT;
ALTER TABLE loja_pedidos ADD COLUMN comprovante_enviado_em TEXT;
CREATE INDEX IF NOT EXISTS idx_loja_pedidos_comprovante ON loja_pedidos(status_pagamento, comprovante_enviado_em);
