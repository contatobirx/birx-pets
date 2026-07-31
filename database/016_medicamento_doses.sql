-- Orbitek Pets - Sprint 2.14: lembretes e histórico de doses

CREATE TABLE IF NOT EXISTS medicamento_doses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  medicamento_id INTEGER NOT NULL,
  tag_codigo TEXT NOT NULL,
  prevista_em TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK(status IN ('pendente', 'administrada', 'ignorada')),
  registrada_em TEXT,
  observacoes TEXT,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(medicamento_id, prevista_em),
  FOREIGN KEY(medicamento_id) REFERENCES pet_medicamentos(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_medicamento_doses_tag_data
ON medicamento_doses(tag_codigo, prevista_em DESC);
