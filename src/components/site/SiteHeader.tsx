import { useEffect, useState } from "react";
import { Sun, Zap, Star, Info, Phone, MessageSquare } from "lucide-react";

const links = [
  { href: "#top", label: "Simulador", icon: Zap },
  { href: "#beneficios", label: "Benefícios", icon: Star },
  { href: "#depoimentos", label: "Depoimentos", icon: MessageSquare },
  { href: "#sobre", label: "Sobre", icon: Info },
  { href: "#contato", label: "Contato", icon: Phone },
];

const sectionIds = links.map((l) => l.href.replace("#", ""));

export const SiteHeader = () => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const linkCls = (id: string) =>
    `flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-lg transition-all ${
      active === id
        ? "text-black bg-primary"
        : "text-muted-foreground hover:text-primary hover:bg-primary/10"
    }`;

  const mobileLinkCls = (id: string) =>
    `flex items-center gap-3 py-3 text-base font-bold transition-colors ${
      active === id ? "text-black" : "text-muted-foreground hover:text-primary"
    }`;

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60">
      <div className="container flex items-center justify-between h-16 md:h-20">
        <a href="#top" className="flex items-center group">
          <img 
            src="/logo.png" 
            alt="Grupo Sunny Energia" 
            className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105" 
          />
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map(({ href, label, icon: Icon }) => {
            const id = href.replace("#", "");
            return (
              <a key={href} href={href} className={linkCls(id)}>
                <Icon className={`w-4 h-4 ${active === id ? "text-black" : "text-primary"}`} strokeWidth={2} />
                {label}
              </a>
            );
          })}
        </nav>

        <a
          href="#top"
          className="hidden md:inline-flex items-center px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Simular agora
        </a>

        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          <span className="material-icons text-[24px]">{open ? "close" : "menu"}</span>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl">
          <nav className="container flex flex-col py-4 gap-1">
            {links.map(({ href, label, icon: Icon }) => {
              const id = href.replace("#", "");
              return (
                <a key={href} href={href} onClick={() => setOpen(false)} className={mobileLinkCls(id)}>
                  <Icon className={`w-5 h-5 ${active === id ? "text-black" : "text-primary"}`} strokeWidth={2} />
                  {label}
                </a>
              );
            })}
            <a
              href="#top"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center px-5 py-3 rounded-full bg-primary text-primary-foreground font-semibold"
            >
              Simular agora
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};
