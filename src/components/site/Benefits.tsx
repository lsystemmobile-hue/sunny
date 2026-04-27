import { TrendingDown, Home, Leaf, Shield, PiggyBank } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const benefits = [
  {
    icon: TrendingDown,
    title: "Redução na conta de luz",
    desc: "Economize até 95% no valor da sua conta de energia desde o primeiro mês.",
  },
  {
    icon: Home,
    title: "Valorização do imóvel",
    desc: "Imóveis com energia solar valorizam até 8% no mercado imobiliário.",
  },
  {
    icon: Leaf,
    title: "Energia limpa",
    desc: "Reduza sua emissão de carbono e ajude o planeta com energia 100% renovável.",
  },
  {
    icon: Shield,
    title: "Independência energética",
    desc: "Pare de depender dos reajustes da concessionária e proteja seu bolso.",
  },
  {
    icon: PiggyBank,
    title: "Economia a longo prazo",
    desc: "Mais de 25 anos de geração com manutenção mínima e payback rápido.",
  },
];

export const Benefits = () => {
  const revealHeader = useScrollReveal<HTMLDivElement>();
  const revealGrid   = useScrollReveal<HTMLDivElement>();

  return (
    <section id="beneficios" className="py-20 md:py-28 bg-card">
      <div className="container">
        <div ref={revealHeader} className="reveal max-w-2xl mx-auto text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            Por que mudar para solar
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Benefícios que duram <span className="text-gradient">décadas</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Mais que economia: um investimento inteligente para o seu futuro.
          </p>
        </div>

        <div ref={revealGrid} className="reveal-stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="glass-card glass-card-hover p-7"
            >
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/15 text-primary mb-5">
                <b.icon className="w-6 h-6" />
              </span>
              <h3 className="text-xl font-bold mb-2">{b.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};