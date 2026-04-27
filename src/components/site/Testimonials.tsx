import { Star } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const testimonials = [
  {
    name: "Fenelon Matos",
    initials: "FM",
    text: "Instalei as placas solares na minha casa e fiquei extremamente satisfeito com todo o processo. Desde o primeiro atendimento até a instalação final, tudo foi feito com muita transparência e profissionalismo. Já no primeiro mês percebi uma redução significativa na conta de energia.",
  },
  {
    name: "Natália Bortolazzo",
    initials: "NB",
    text: "Excelente empresa, agilidade no atendimento, equipe super atenciosa. Tiraram todas as minhas dúvidas e me deram total segurança durante o processo. Hoje estou muito feliz com a economia que estou tendo todos os meses.",
  },
  {
    name: "Vinícius Costa",
    initials: "VC",
    text: "Empresa excelente! Muito profissionalismo e qualidade do início ao fim. O investimento realmente vale a pena e o retorno vem mais rápido do que eu imaginava. Recomendo para qualquer pessoa que queira economizar de verdade.",
  },
];

export const Testimonials = () => {
  const revealHeader = useScrollReveal<HTMLDivElement>();
  const revealGrid   = useScrollReveal<HTMLDivElement>();
  const revealBadge  = useScrollReveal<HTMLDivElement>();

  return (
    <section id="depoimentos" className="py-20 md:py-28 relative bg-background">
      <div className="container">
        <div ref={revealHeader} className="reveal max-w-2xl mx-auto text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            Prova social
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Veja quem já está economizando com{" "}
            <span className="text-gradient">energia solar</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Clientes reais que já reduziram sua conta de energia.
          </p>
        </div>

        <div ref={revealGrid} className="reveal-stagger grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <article key={t.name} className="glass-card p-7 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-primary text-primary-foreground font-bold flex items-center justify-center">
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="flex gap-0.5 mt-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed text-[15px]">
                "{t.text}"
              </p>
            </article>
          ))}
        </div>

        <div ref={revealBadge} className="reveal mt-12 text-center">
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card text-sm">
            <span className="text-primary font-bold">+100 clientes</span>
            <span className="text-muted-foreground">atendidos na região</span>
          </span>
        </div>
      </div>
    </section>
  );
};