export type CalcParams = {
  tarifa_kwh: number;
  kwh_por_modulo: number;
  kwp_por_modulo: number;
  percentual_economia: number;
  custo_por_modulo: number;
};

export const DEFAULT_PARAMS: CalcParams = {
  tarifa_kwh: 0.95,
  kwh_por_modulo: 60,
  kwp_por_modulo: 0.55,
  percentual_economia: 0.70,
  custo_por_modulo: 2500,
};

export type SimInput = {
  valorConta: number;
};

export type SimResult = {
  consumoKwh: number;
  modulos: number;
  potenciaKwp: number;
  economiaMensal: number;
  economiaAnual: number;
  investimento: number;
  paybackMeses: number;
};

export function calcularSimulacao(
  { valorConta }: SimInput,
  params: CalcParams = DEFAULT_PARAMS
): SimResult {
  const consumoKwh = valorConta / params.tarifa_kwh;
  const modulos = Math.ceil(consumoKwh / params.kwh_por_modulo);
  const potenciaKwp = modulos * params.kwp_por_modulo;
  const economiaMensal = valorConta * params.percentual_economia;
  const economiaAnual = economiaMensal * 12;
  const investimento = modulos * params.custo_por_modulo;
  const paybackMeses = economiaMensal > 0 ? investimento / economiaMensal : 0;

  return {
    consumoKwh: round2(consumoKwh),
    modulos,
    potenciaKwp: round2(potenciaKwp),
    economiaMensal: round2(economiaMensal),
    economiaAnual: round2(economiaAnual),
    investimento: round2(investimento),
    paybackMeses: round2(paybackMeses),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
