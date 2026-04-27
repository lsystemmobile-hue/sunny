import { MapPin, ExternalLink } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const MAP_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31924.17128973158!2d-47.74232201239692!3d-23.08523657947806!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94c60d37d2e79589%3A0x14d793b77538d27a!2sGrupo%20Sunny%20Energia!5e1!3m2!1spt-BR!2sbr!4v1777304697464!5m2!1spt-BR!2sbr";

const MAP_LINK =
  "https://www.google.com/maps/search/?api=1&query=Rod.+Cornélio+Pires+76+Água+Branca+Tietê+SP";

export const About = () => {
  const revealLeft  = useScrollReveal<HTMLDivElement>();
  const revealRight = useScrollReveal<HTMLDivElement>();

  return (
    <section id="sobre" className="py-20 md:py-28 bg-card">
      <div className="container">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-start">

          {/* ── Texto institucional ── */}
          <div ref={revealLeft} className="reveal">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              Sobre a empresa
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Grupo <span className="text-gradient">Sunny Energia</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              Empresa especializada em energia solar e eficiência energética.
              Atendemos clientes residenciais, comerciais e rurais com soluções
              completas — do projeto à instalação e manutenção.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Nossa missão é tornar a energia limpa acessível e gerar economia
              real para você todos os meses.
            </p>
          </div>

          {/* ── Mapa ── */}
          <div ref={revealRight} className="reveal" style={{ transitionDelay: "150ms" }}>
            <div className="glass-card overflow-hidden">
              {/* Iframe do Google Maps */}
              <div className="relative w-full" style={{ paddingBottom: "56.25%" /* 16:9 */ }}>
                <iframe
                  title="Localização Grupo Sunny Energia"
                  src={MAP_EMBED}
                  className="absolute inset-0 w-full h-full border-0 grayscale contrast-[1.1] brightness-[0.85]"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Rodapé do card com endereço + link */}
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    Rod. Cornélio Pires, 76 — Água Branca
                    <br />
                    Tietê — SP
                  </span>
                </div>
                <a
                  href={MAP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  Abrir no Maps
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};