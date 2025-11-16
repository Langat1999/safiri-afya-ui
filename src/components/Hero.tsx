import { Button } from "@/components/ui/button";
import { Heart, MapPin, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-healthcare.jpg";

interface HeroProps {
  language: 'en' | 'sw';
}

export const Hero = ({ language }: HeroProps) => {
  const content = {
    en: {
      title: "Your Health Journey Starts Here",
      subtitle: "AI-powered symptom checking and clinic location - access quality healthcare when you need it",
      prompt: "Afya ni uhai, tunza mwili wako leo",
      checkSymptoms: "Check Symptoms",
      findClinics: "Find Clinics",
    },
    sw: {
      title: "Safari Yako ya Afya Inaanza Hapa",
      subtitle: "Tathmini ya dalili kwa AI na mahali pa kliniki - pata huduma za afya wakati unapohitaji",
      prompt: "Afya ni uhai, tunza mwili wako leo",
      checkSymptoms: "Angalia Dalili",
      findClinics: "Tafuta Kliniki",
    },
  };

  const t = content[language];

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background" />
      
      {/* Hero image overlay */}
      <div 
        className="absolute inset-0 opacity-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          {/* Poetic health prompt */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 animate-slide-up">
            <Sparkles className="w-4 h-4 text-primary" />
            <p className="text-sm font-medium text-foreground italic">
              {t.prompt}
            </p>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
            {t.title}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button
              variant="hero"
              size="xl"
              className="w-full sm:w-auto"
              onClick={() => document.getElementById('symptom-checker')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Heart className="w-5 h-5" />
              {t.checkSymptoms}
            </Button>
            <Button
              variant="secondary"
              size="xl"
              className="w-full sm:w-auto"
              onClick={() => document.getElementById('clinic-locator')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <MapPin className="w-5 h-5" />
              {t.findClinics}
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">
                {language === 'en' ? 'AI Support' : 'Msaada wa AI'}
              </div>
            </div>
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="text-3xl font-bold text-secondary">500+</div>
              <div className="text-sm text-muted-foreground">
                {language === 'en' ? 'Clinics' : 'Kliniki'}
              </div>
            </div>
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="text-3xl font-bold text-accent">10K+</div>
              <div className="text-sm text-muted-foreground">
                {language === 'en' ? 'Users Helped' : 'Watu Waliosaidiwa'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient blur effects */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-secondary/20 rounded-full blur-3xl opacity-30" />
    </section>
  );
};
