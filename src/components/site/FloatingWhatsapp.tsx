import { useEffect, useState } from "react";
import { COMPANY_WHATSAPP, buildWhatsappUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/lib/icons";

export const FloatingWhatsapp = () => {
  const url = buildWhatsappUrl(COMPANY_WHATSAPP, "Olá! Vim pelo site e gostaria de saber mais sobre energia solar.");

  // Esconde o botão enquanto o Hero (#top) está visível na viewport
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) { setVisible(true); return; }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className={`fixed bottom-5 right-5 z-50 inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-glow hover:scale-110 transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <WhatsAppIcon className="w-7 h-7" />
      <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping opacity-30 pointer-events-none" aria-hidden />
    </a>
  );
};
