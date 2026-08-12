-- Orbitek Pets - Sprint 2.20: organizacao do prontuario digital
ALTER TABLE documentos_pet ADD COLUMN data_documento TEXT;
ALTER TABLE documentos_pet ADD COLUMN profissional TEXT;
ALTER TABLE documentos_pet ADD COLUMN observacoes TEXT;
CREATE INDEX IF NOT EXISTS idx_documentos_pet_data ON documentos_pet(data_documento DESC);
