-- Orbitek Pets - Sprint 10.1: Vacinas
-- Execute uma vez após a migração 004_create_saude.sql.

ALTER TABLE saude_pet ADD COLUMN fabricante TEXT;
ALTER TABLE saude_pet ADD COLUMN lote TEXT;
ALTER TABLE saude_pet ADD COLUMN veterinario TEXT;

CREATE INDEX IF NOT EXISTS idx_saude_pet_tipo_proxima_data
ON saude_pet(tipo, proxima_data);
