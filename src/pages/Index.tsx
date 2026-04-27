import { SiteHeader } from "@/components/site/SiteHeader";
import { Hero } from "@/components/site/Hero";
import { Simulator } from "@/components/site/Simulator";
import { Benefits } from "@/components/site/Benefits";
import { Testimonials } from "@/components/site/Testimonials";
import { About } from "@/components/site/About";
import { Contact } from "@/components/site/Contact";
import { SiteFooter } from "@/components/site/SiteFooter";
import { FloatingWhatsapp } from "@/components/site/FloatingWhatsapp";

const Index = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <Hero />
      {/* Em desktop o simulador aparece embutido no Hero; aqui só é exibido em tablet/mobile */}
      <div className="lg:hidden">
        <Simulator />
      </div>
      <Benefits />
      <Testimonials />
      <About />
      <Contact />
      <SiteFooter />
      <FloatingWhatsapp />
    </main>
  );
};

export default Index;
