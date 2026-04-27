import { Zap } from "lucide-react";
import { WhatsAppIcon } from "@/lib/icons";
import { defaultWhatsappUrl } from "@/lib/whatsapp";
import { Simulator } from "./Simulator";
import { useCountUp } from "@/hooks/useCountUp";
import { useScrollReveal } from "@/hooks/useScrollReveal";

/** Stats com prefixo/sufixo e animação de contagem */
const stats = [
  { prefix: "+", end: 100, suffix: "",      label: "Clientes" },
  { prefix: "",  end: 70,  suffix: "%",     label: "Economia média" },
  { prefix: "",  end: 25,  suffix: " anos", label: "Vida útil" },
];

function StatItem({ prefix, end, suffix, label }: (typeof stats)[number]) {
  const { ref, value } = useCountUp(end, 2000);
  return (
    <div>
      <div ref={ref} className="text-2xl md:text-3xl font-bold text-primary">
        {prefix}{value}{suffix}
      </div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

export const Hero = () => {
  const revealLeft  = useScrollReveal<HTMLDivElement>();
  const revealRight = useScrollReveal<HTMLDivElement>();

  return (
    <section
      id="top"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Vídeo de fundo — z-0 para ficar dentro do stacking context da section */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="/video.mp4"
      />

      {/* Gradiente horizontal esquerda→direita */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      {/* Gradiente horizontal direita→esquerda */}
      <div className="absolute inset-0 z-10 bg-gradient-to-l from-black/70 via-black/30 to-transparent" />
      {/* Gradiente vertical topo e base */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

      <div className="container relative z-20 py-32 lg:py-20">
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_560px] lg:gap-16 lg:items-start">

          {/* ── Coluna esquerda ── */}
          <div
            ref={revealLeft}
            className="reveal max-w-xl mx-auto lg:mx-0 text-center lg:text-left"
          >

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest mb-6">
              Energia solar · Grupo Sunny
            </div>

            {/* H1 */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-5xl xl:text-[3.5rem] font-bold tracking-tight leading-[1.08]">
              Economize até
              <br />
              <span className="text-gradient">70% na sua</span>
              <br />
              conta de energia
            </h1>

            {/* Subtítulo */}
            <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed max-w-md mx-auto lg:mx-0">
              Para residências, comércios e área rural. Simule agora, gratuitamente.
            </p>

            {/* CTAs — sempre visíveis */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <a
                href={defaultWhatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-56 whitespace-nowrap inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold text-base hover:brightness-110 hover:shadow-glow transition-all duration-300 hover:-translate-y-0.5"
              >
                <WhatsAppIcon className="w-5 h-5" />
                Falar no WhatsApp
              </a>
              <a
                href="#simulador"
                className="w-full sm:w-52 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-primary/60 bg-primary/10 text-primary font-semibold text-base hover:bg-primary hover:text-black hover:border-primary transition-all duration-300 hover:-translate-y-0.5"
              >
                <Zap className="w-4 h-4" />
                Simular Agora
              </a>
            </div>

            {/* Stats com contagem animada */}
            <div className="mt-10 pt-8 border-t border-border/40 grid grid-cols-3 gap-4">
              {stats.map((s) => (
                <StatItem key={s.label} {...s} />
              ))}
            </div>
          </div>

          {/* ── Coluna direita — simulador embutido (desktop only) ── */}
          <div
            ref={revealRight}
            className="reveal hidden lg:flex lg:flex-col"
            style={{ transitionDelay: "150ms" }}
          >
            <Simulator embedded />
          </div>
        </div>
      </div>
    </section>
  );
};
