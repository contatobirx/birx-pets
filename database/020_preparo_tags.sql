-- Orbitek Pets - Sprint 2.21: preparo de tags antes da venda
ALTER TABLE tags ADD COLUMN modelo TEXT DEFAULT 'nfc';
ALTER TABLE tags ADD COLUMN lote TEXT;
ALTER TABLE tags ADD COLUMN preparo_status TEXT DEFAULT 'estoque';
ALTER TABLE tags ADD COLUMN gravada_em TEXT;
ALTER TABLE tags ADD COLUMN testada_em TEXT;
ALTER TABLE tags ADD COLUMN vendida_em TEXT;
CREATE INDEX IF NOT EXISTS idx_tags_preparo ON tags(preparo_status, lote, data_criacao DESC);
