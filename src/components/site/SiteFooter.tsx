import { Sun } from "lucide-react";

export const SiteFooter = () => {
  return (
    <footer className="border-t border-border/60 py-10 mt-10">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-primary text-primary-foreground">
            <Sun className="w-4 h-4" strokeWidth={2.5} />
          </span>
          <span className="font-semibold text-sm">
            Grupo <span className="text-primary">Sunny</span> Energia
          </span>
        </div>
        <p className="text-xs text-muted-foreground text-center md:text-right">
          © {new Date().getFullYear()} Grupo Sunny Energia. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};