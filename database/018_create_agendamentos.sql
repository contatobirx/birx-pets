-- Orbitek Pets - Sprint 2.18: agendamentos veterinarios

CREATE TABLE IF NOT EXISTS pet_agendamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tag_codigo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK(tipo IN ('consulta','retorno','exame','vacina','outro')),
  titulo TEXT NOT NULL,
  data_hora TEXT NOT NULL,
  clinica TEXT,
  veterinario TEXT,
  endereco TEXT,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'agendado' CHECK(status IN ('agendado','concluido','cancelado')),
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agendamentos_tag_data
ON pet_agendamentos(tag_codigo, data_hora);
