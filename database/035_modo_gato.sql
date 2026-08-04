CREATE TABLE IF NOT EXISTS pet_modo_gato (
  tag_codigo TEXT PRIMARY KEY,
  acesso_rua TEXT NOT NULL DEFAULT 'nao' CHECK (acesso_rua IN ('nao','supervisionado','livre')),
  moradia TEXT NOT NULL DEFAULT 'apartamento' CHECK (moradia IN ('apartamento','casa','casa_quintal','outro')),
  convivencia TEXT NOT NULL DEFAULT 'sozinho' CHECK (convivencia IN ('sozinho','gatos','caes','mista')),
  quantidade_gatos INTEGER NOT NULL DEFAULT 1 CHECK (quantidade_gatos BETWEEN 1 AND 30),
  castrado INTEGER NOT NULL DEFAULT 0 CHECK (castrado IN (0,1)),
  telas_protecao INTEGER NOT NULL DEFAULT 0 CHECK (telas_protecao IN (0,1)),
  microchip INTEGER NOT NULL DEFAULT 0 CHECK (microchip IN (0,1)),
  caixas_areia INTEGER NOT NULL DEFAULT 1 CHECK (caixas_areia BETWEEN 0 AND 40),
  pontos_agua INTEGER NOT NULL DEFAULT 1 CHECK (pontos_agua BETWEEN 0 AND 40),
  observacoes TEXT,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tag_codigo) REFERENCES pets(tag_codigo) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pet_modo_gato_atualizado
  ON pet_modo_gato(atualizado_em DESC);
