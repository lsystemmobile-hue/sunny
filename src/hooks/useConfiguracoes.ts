import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type CalcParams, DEFAULT_PARAMS } from "@/lib/calc";

export function useConfiguracoes(): CalcParams {
  const [params, setParams] = useState<CalcParams>(DEFAULT_PARAMS);

  useEffect(() => {
    supabase
      .from("configuracoes")
      .select("*")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        if (data) {
          setParams({
            tarifa_kwh: Number(data.tarifa_kwh),
            kwh_por_modulo: Number(data.kwh_por_modulo),
            kwp_por_modulo: Number(data.kwp_por_modulo),
            percentual_economia: Number(data.percentual_economia),
            custo_por_modulo: Number(data.custo_por_modulo),
          });
        }
      });
  }, []);

  return params;
}
