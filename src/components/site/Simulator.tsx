import { useState } from "react";
// activeTab controla qual aba está visível sem apagar os dados do resultado
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Calculator, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { calcularSimulacao, type SimResult } from "@/lib/calc";
import { maskCurrency, parseCurrency, maskPhone, digitsOnly } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { useConfiguracoes } from "@/hooks/useConfiguracoes";
import { SimulatorResult } from "./SimulatorResult";

const RATE_LIMIT_KEY = "sim_last_submit";
const COOLDOWN_MS = 3 * 60 * 1000; // 3 minutos

function checkRateLimit(): { blocked: boolean; remainingSeconds: number } {
  const last = localStorage.getItem(RATE_LIMIT_KEY);
  if (!last) return { blocked: false, remainingSeconds: 0 };
  const elapsed = Date.now() - Number(last);
  if (elapsed < COOLDOWN_MS) {
    return { blocked: true, remainingSeconds: Math.ceil((COOLDOWN_MS - elapsed) / 1000) };
  }
  return { blocked: false, remainingSeconds: 0 };
}

function setRateLimit() {
  localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
}

const schema = z.object({
  valorContaMasked: z.string().min(1, "Informe o valor da conta"),
  tipoImovel: z.enum(["residencial", "comercial", "rural"], {
    required_error: "Selecione o tipo de imóvel",
  }),
  cidadeEstado: z
    .string()
    .trim()
    .min(2, "Informe sua cidade e estado")
    .max(120),
  possuiTelhado: z.boolean(),
  nome: z.string().trim().min(2, "Informe seu nome").max(120),
  whatsapp: z
    .string()
    .refine((v) => digitsOnly(v).length >= 10 && digitsOnly(v).length <= 11, {
      message: "WhatsApp inválido",
    }),
});

type FormValues = z.infer<typeof schema>;

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; result: SimResult; lead: FormValues; valorConta: number }
  | { kind: "error"; message: string };

type Props = {
  /** Quando embedded=true remove o wrapper <section> e o cabeçalho,
   *  exibindo apenas o card do formulário (uso dentro do Hero no desktop). */
  embedded?: boolean;
};

export const Simulator = ({ embedded = false }: Props) => {
  const [state, setState] = useState<State>({ kind: "idle" });
  const [activeTab, setActiveTab] = useState<"form" | "result">("form");
  const params = useConfiguracoes();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      valorContaMasked: "",
      tipoImovel: undefined,
      cidadeEstado: "",
      possuiTelhado: true,
      nome: "",
      whatsapp: "",
    },
  });

  const possuiTelhado = watch("possuiTelhado");
  const tipoImovel = watch("tipoImovel");

  const onSubmit = async (values: FormValues) => {
    const { blocked, remainingSeconds } = checkRateLimit();
    if (blocked) {
      const mins = Math.ceil(remainingSeconds / 60);
      setState({
        kind: "error",
        message: `Aguarde ${mins} minuto${mins > 1 ? "s" : ""} antes de simular novamente.`,
      });
      return;
    }

    const valorConta = parseCurrency(values.valorContaMasked);
    if (!valorConta || valorConta <= 0) {
      setState({ kind: "error", message: "Informe um valor de conta válido" });
      return;
    }

    setState({ kind: "loading" });

    try {
      await new Promise((r) => setTimeout(r, 700));

      const result = calcularSimulacao({ valorConta }, params);

      const { error } = await supabase.from("simulacoes").insert({
        nome: values.nome.trim(),
        whatsapp: digitsOnly(values.whatsapp),
        cidade_estado: values.cidadeEstado.trim(),
        tipo_imovel: values.tipoImovel,
        possui_telhado: values.possuiTelhado,
        valor_conta: valorConta,
        consumo_kwh: result.consumoKwh,
        modulos: result.modulos,
        potencia_kwp: result.potenciaKwp,
        economia_mensal: result.economiaMensal,
        economia_anual: result.economiaAnual,
        investimento: result.investimento,
        payback: result.paybackMeses,
      });

      if (error) throw error;

      setRateLimit();
      setState({ kind: "success", result, lead: values, valorConta });
      setActiveTab("result");
      toast.success("Simulação concluída!");
    } catch (e) {
      console.error(e);
      setState({
        kind: "error",
        message: "Não foi possível concluir a simulação. Tente novamente.",
      });
      toast.error("Erro ao salvar simulação. Tente novamente.");
    }
  };

  const onInvalid = (errs: typeof errors) => {
    const first = Object.values(errs).find((e) => e?.message)?.message;
    toast.error(first ?? "Preencha todos os campos corretamente");
  };

  const reset = () => { setState({ kind: "idle" }); setActiveTab("form"); };

  const form = (
    <div className={`glass-card w-full overflow-hidden rounded-2xl animated-border${embedded ? " bg-background/90" : ""}`}>
      {/* Abas */}
      <div className="flex border-b border-border/60">
        <button
          type="button"
          onClick={() => setActiveTab("form")}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            activeTab === "form"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Simulador
        </button>
        {state.kind === "success" && (
          <button
            type="button"
            onClick={() => setActiveTab("result")}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              activeTab === "result"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Resultado
          </button>
        )}
      </div>

      {/* Área de conteúdo com altura fixa para não alterar o tamanho do card */}
      <div className={embedded ? "h-[480px] overflow-hidden" : undefined}>
      {/* Conteúdo da aba Resultado */}
      {activeTab === "result" && state.kind === "success" && (
        <div className="p-6 md:p-8">
          <SimulatorResult
            result={state.result}
            valorConta={state.valorConta}
            leadName={state.lead.nome}
          />
          <button
            type="button"
            onClick={reset}
            className="mt-4 w-full py-2.5 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            Simular novamente
          </button>
        </div>
      )}

      {/* Conteúdo da aba Formulário */}
      {activeTab === "form" && (
      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="p-6 md:p-8"
        noValidate
      >
        <div className="grid grid-cols-1 gap-4">
          {/* Valor da conta */}
          <div>
            <Label>Valor da conta de luz (R$)</Label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Ex: R$ 600,00"
              {...register("valorContaMasked")}
              onChange={(e) => setValue("valorContaMasked", maskCurrency(e.target.value))}
              className="form-input"
            />
          </div>

          {/* Tipo de imóvel */}
          <div>
            <Label>Tipo de imóvel</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["residencial", "comercial", "rural"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue("tipoImovel", t, { shouldValidate: true })}
                  className={`px-3 py-2.5 rounded-xl border text-sm font-medium capitalize transition-all ${
                    tipoImovel === t
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-input/50 border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Cidade/Estado + Telhado lado a lado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Cidade / Estado</Label>
              <input
                type="text"
                placeholder="Ex: Tietê - SP"
                {...register("cidadeEstado")}
                className="form-input"
              />
            </div>
            <div>
              <Label>Telhado disponível?</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { v: true, l: "Sim" },
                  { v: false, l: "Não sei" },
                ].map((o) => (
                  <button
                    key={String(o.v)}
                    type="button"
                    onClick={() => setValue("possuiTelhado", o.v)}
                    className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      possuiTelhado === o.v
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-input/50 border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Nome + WhatsApp lado a lado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Nome</Label>
              <input
                type="text"
                placeholder="Seu nome completo"
                {...register("nome")}
                className="form-input"
              />
            </div>
            <div>
              <Label>WhatsApp</Label>
              <input
                type="tel"
                placeholder="(15) 99179-8612"
                {...register("whatsapp")}
                onChange={(e) => setValue("whatsapp", maskPhone(e.target.value))}
                className="form-input"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || state.kind === "loading"}
          className="mt-6 w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-base hover:shadow-glow transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {state.kind === "loading" ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Calculando...
            </>
          ) : (
            <>
              <Calculator className="w-5 h-5" />
              Calcular economia
            </>
          )}
        </button>

        {state.kind === "error" && (
          <div className="mt-4 flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            {state.message}
          </div>
        )}
      </form>
      )}
      </div>
    </div>
  );

  if (embedded) return <div className="w-full">{form}</div>;

  return (
    <section id="simulador" className="py-20 md:py-28 relative bg-background">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            Simulador inteligente
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Descubra quanto você vai economizar
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Preencha os campos abaixo e receba uma simulação completa em segundos.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">{form}</div>
      </div>
    </section>
  );
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-medium text-foreground mb-2">{children}</label>
);

