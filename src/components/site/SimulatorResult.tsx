import { useEffect, useRef } from "react";
import type { SimResult } from "@/lib/calc";
import { formatBRL, formatKwh, formatNumber } from "@/lib/format";
import { buildWhatsappUrl, COMPANY_WHATSAPP, simulationWhatsappMessage } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/lib/icons";

type Props = {
  result: SimResult;
  valorConta: number;
  leadName: string;
};

export const SimulatorResult = ({ result, valorConta }: Props) => {
  const whatsappUrl = buildWhatsappUrl(
    COMPANY_WHATSAPP,
    simulationWhatsappMessage({
      valorConta,
      consumoKwh: result.consumoKwh,
      modulos: result.modulos,
      economiaMensal: result.economiaMensal,
    })
  );

  const items = [
    { label: "Consumo estimado", value: formatKwh(result.consumoKwh),           highlight: false },
    { label: "Módulos solares",  value: `${result.modulos} painéis`,             highlight: false },
    { label: "Potência",         value: `${formatNumber(result.potenciaKwp, 2)} kWp`, highlight: false },
    { label: "Economia mensal",  value: formatBRL(result.economiaMensal),        highlight: true  },
    { label: "Economia anual",   value: formatBRL(result.economiaAnual),         highlight: true  },
    { label: "Investimento",     value: formatBRL(result.investimento),          highlight: false },
  ];

  // Stagger reveal ao montar o componente (resultado acabou de aparecer)
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    // Pequeno delay para garantir que o DOM pintou antes de revelar
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => el.classList.add("revealed"));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="space-y-3">
      <div ref={gridRef} className="result-stagger grid grid-cols-2 gap-3">
        {items.map((it) => (
          <div
            key={it.label}
            className={`p-3 rounded-xl border transition-all duration-300 ${
              it.highlight
                ? "bg-primary/10 border-primary/30 animate-pulse-glow"
                : "bg-input/40 border-border/60"
            }`}
          >
            <p className="text-xs text-muted-foreground mb-1">{it.label}</p>
            <p className={`text-lg font-bold leading-tight ${it.highlight ? "text-primary" : "text-foreground"}`}>
              {it.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-input/40 border border-border/60 text-sm">
        <span className="text-muted-foreground">Payback estimado</span>
        <span className="font-bold">
          {formatNumber(result.paybackMeses, 1)} meses
          <span className="text-muted-foreground font-normal"> (~{formatNumber(result.paybackMeses / 12, 1)} anos)</span>
        </span>
      </div>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 hover:shadow-glow transition-all duration-300"
      >
        <WhatsAppIcon className="w-5 h-5" />
        Enviar resultado pelo WhatsApp
      </a>
    </div>
  );
};
