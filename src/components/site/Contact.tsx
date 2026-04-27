import { MessageCircle, Instagram, Clock } from "lucide-react";
import { defaultWhatsappUrl, COMPANY_INSTAGRAM } from "@/lib/whatsapp";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export const Contact = () => {
  const revealHeader = useScrollReveal<HTMLDivElement>();
  const revealGrid   = useScrollReveal<HTMLDivElement>();

  return (
    <section id="contato" className="py-20 md:py-28 relative bg-background">
      <div className="container">
        <div ref={revealHeader} className="reveal max-w-2xl mx-auto text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            Contato
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Vamos conversar?
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Tire suas dúvidas e receba um orçamento completo.
          </p>
        </div>

        <div ref={revealGrid} className="reveal-stagger grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          <a
            href={defaultWhatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card glass-card-hover p-7 text-center"
          >
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/15 text-primary mb-4">
              <MessageCircle className="w-6 h-6" />
            </span>
            <div className="font-bold text-lg mb-1">WhatsApp</div>
            <div className="text-muted-foreground">(15) 99179-8612</div>
          </a>

          <a
            href={COMPANY_INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card glass-card-hover p-7 text-center"
          >
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/15 text-primary mb-4">
              <Instagram className="w-6 h-6" />
            </span>
            <div className="font-bold text-lg mb-1">Instagram</div>
            <div className="text-muted-foreground">@sunny_energia</div>
          </a>

          <div className="glass-card glass-card-hover p-7 text-center cursor-default">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/15 text-primary mb-4">
              <Clock className="w-6 h-6" />
            </span>
            <div className="font-bold text-lg mb-1">Horário</div>
            <div className="text-muted-foreground">
              Segunda a sábado
              <br />
              09h às 17h
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};