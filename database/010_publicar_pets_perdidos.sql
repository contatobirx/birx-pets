-- Sprint 2.5 - autorização explícita para o diretório público.
ALTER TABLE pets ADD COLUMN publico_perdidos INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_pets_diretorio_perdidos
ON pets(perdido, publico_perdidos, cidade, estado);
