-- Tighten the public INSERT policy with field validation
DROP POLICY IF EXISTS "Anyone can create a simulation" ON public.simulacoes;

CREATE POLICY "Anyone can create a simulation"
  ON public.simulacoes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(trim(nome)) BETWEEN 2 AND 120
    AND length(trim(whatsapp)) BETWEEN 8 AND 30
    AND length(trim(cidade_estado)) BETWEEN 2 AND 120
    AND tipo_imovel IN ('residencial', 'comercial', 'rural')
    AND valor_conta > 0 AND valor_conta <= 1000000
    AND consumo_kwh > 0
    AND modulos > 0
    AND potencia_kwp > 0
    AND economia_mensal >= 0
    AND economia_anual >= 0
    AND investimento >= 0
    AND payback >= 0
  );

-- Lock down has_role: revoke EXECUTE from public/anon/authenticated.
-- It will still work inside RLS policies because those run as the table owner.
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM authenticated;