import { useLanguage } from "@/contexts/LanguageContext";
import { Hero } from "@/components/Hero";
import { SymptomChecker } from "@/components/SymptomChecker";
import { ClinicLocator } from "@/components/ClinicLocator";
import { HealthPrompt } from "@/components/HealthPrompt";
import { HealthNews } from "@/components/HealthNews";
import { Navbar } from "@/components/Navbar";
import { AdSlot } from "@/components/AdSlot";
import { Heart } from "lucide-react";

const Index = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Main Content */}
      <main>
        <Hero language={language} />

        {/* Ad 1: Banner after Hero - Non-intrusive */}
        <section className="py-4 bg-muted/20">
          <div className="container px-4 sm:px-6 lg:px-8">
            <AdSlot type="banner" closeable className="max-w-5xl mx-auto" />
          </div>
        </section>

        <SymptomChecker language={language} />

        {/* Ad 2: Card between sections - Natural break */}
        <section className="py-8 bg-background">
          <div className="container px-4 sm:px-6 lg:px-8">
            <AdSlot type="card" className="max-w-4xl mx-auto" />
          </div>
        </section>

        <HealthPrompt language={language} />
        <ClinicLocator language={language} />
        <HealthNews language={language} />
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              <span className="text-lg font-semibold text-foreground">
                Afya Karibu Kenya
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {language === 'en' 
                ? 'Making healthcare accessible to all Kenyans, one step at a time.' 
                : 'Kufanya huduma za afya zipatikane kwa Wakenya wote, hatua kwa hatua.'}
            </p>
            <p className="text-xs text-muted-foreground">
              © 2025 Afya Karibu Kenya. {language === 'en' ? 'All rights reserved.' : 'Haki zote zimehifadhiwa.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
