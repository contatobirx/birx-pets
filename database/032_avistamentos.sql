-- BIRX Pets - Sprint 4.5: Mapa de Avistamentos
CREATE TABLE IF NOT EXISTS pet_avistamentos (
 id INTEGER PRIMARY KEY AUTOINCREMENT, tag_codigo TEXT NOT NULL, latitude REAL NOT NULL,
 longitude REAL NOT NULL, precisao_metros REAL, visto_em TEXT NOT NULL, foto_url TEXT,
 foto_public_id TEXT, observacoes TEXT, contato TEXT, origem_hash TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pendente', criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 moderado_em TEXT, moderado_por TEXT
);
CREATE INDEX IF NOT EXISTS idx_avistamentos_tag ON pet_avistamentos(tag_codigo,status,visto_em);
