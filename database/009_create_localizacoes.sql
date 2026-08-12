-- Sprint 2.4 - Localização compartilhada voluntariamente.
CREATE TABLE IF NOT EXISTS localizacoes_pet (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tag_codigo TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  precisao_metros REAL,
  origem TEXT NOT NULL DEFAULT 'perfil_publico',
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_localizacoes_pet_tag_data
ON localizacoes_pet(tag_codigo, criado_em DESC);
