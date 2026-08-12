-- Orbitek Pets - Sprint 3.12: lembretes recorrentes de cuidados
CREATE TABLE IF NOT EXISTS pet_rotinas (
  id INTEGER PRIMARY KEY AUTOINCREMENT, tag_codigo TEXT NOT NULL, tipo TEXT NOT NULL,
  titulo TEXT NOT NULL, descricao TEXT, frequencia TEXT NOT NULL DEFAULT 'diaria',
  dias_semana TEXT, horarios TEXT NOT NULL, data_inicio TEXT NOT NULL, data_fim TEXT,
  ativo INTEGER NOT NULL DEFAULT 1, criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pet_rotinas_tag ON pet_rotinas(tag_codigo, ativo);
CREATE TABLE IF NOT EXISTS pet_rotina_ocorrencias (
  id INTEGER PRIMARY KEY AUTOINCREMENT, rotina_id INTEGER NOT NULL, tag_codigo TEXT NOT NULL,
  prevista_em TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pendente', registrada_em TEXT,
  observacoes TEXT, UNIQUE(rotina_id, prevista_em)
);
CREATE INDEX IF NOT EXISTS idx_rotina_ocorrencias_tag ON pet_rotina_ocorrencias(tag_codigo, prevista_em, status);
