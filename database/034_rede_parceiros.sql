-- BIRX Pets - Sprint 4.7: Rede de Parceiros
ALTER TABLE parceiros ADD COLUMN categoria TEXT;
ALTER TABLE parceiros ADD COLUMN endereco TEXT;
ALTER TABLE parceiros ADD COLUMN cep TEXT;
ALTER TABLE parceiros ADD COLUMN bairro TEXT;
ALTER TABLE parceiros ADD COLUMN latitude REAL;
ALTER TABLE parceiros ADD COLUMN longitude REAL;
ALTER TABLE parceiros ADD COLUMN horarios TEXT;
ALTER TABLE parceiros ADD COLUMN servicos TEXT;
ALTER TABLE parceiros ADD COLUMN especialidades TEXT;
ALTER TABLE parceiros ADD COLUMN atende_emergencia INTEGER NOT NULL DEFAULT 0;
ALTER TABLE parceiros ADD COLUMN promocao TEXT;
ALTER TABLE parceiros ADD COLUMN produtos TEXT;
ALTER TABLE parceiros ADD COLUMN descricao TEXT;
ALTER TABLE parceiros ADD COLUMN publico INTEGER NOT NULL DEFAULT 0;
ALTER TABLE parceiros ADD COLUMN verificado INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS parceiro_denuncias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parceiro_id INTEGER NOT NULL,
  motivo TEXT NOT NULL,
  detalhes TEXT,
  contato TEXT,
  origem_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(parceiro_id) REFERENCES parceiros(id)
);
CREATE INDEX IF NOT EXISTS idx_parceiros_publicos ON parceiros(status, publico, verificado, cidade, categoria);
CREATE INDEX IF NOT EXISTS idx_parceiro_denuncias_status ON parceiro_denuncias(status, criado_em);
