-- BIRX Pets - cupons e validade das promoções de parceiros
ALTER TABLE parceiros ADD COLUMN promocao_codigo TEXT;
ALTER TABLE parceiros ADD COLUMN promocao_validade TEXT;

CREATE INDEX IF NOT EXISTS idx_parceiros_promocao_validade
  ON parceiros(status, publico, verificado, promocao_validade);
