-- ============================================================
-- MIGRAÇÃO: Adiciona colunas q7 e q7_outro à tabela responses
-- Execute no SQL Editor do Supabase
-- ============================================================

ALTER TABLE responses
  ADD COLUMN IF NOT EXISTS q7       text,   -- Como chegou: Instagram, Facebook, Google, Outro, Não lembro
  ADD COLUMN IF NOT EXISTS q7_outro text;   -- Se "Outro": nome de quem indicou (opcional)

-- ============================================================
-- Verificar se funcionou (deve mostrar as novas colunas):
-- ============================================================
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'responses'
-- ORDER BY ordinal_position;
