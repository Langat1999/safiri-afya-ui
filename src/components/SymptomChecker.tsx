import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Phone, MapPin, Home, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { symptomsAPI } from "@/services/api";

interface SymptomCheckerProps {
  language: 'en' | 'sw';
}

export const SymptomChecker = ({ language }: SymptomCheckerProps) => {
  const [symptoms, setSymptoms] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [gender, setGender] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    urgency: 'low' | 'medium' | 'high';
    condition: string;
    recommendations: string[];
    disclaimer: string;
  } | null>(null);

  const content = {
    en: {
      title: "AI-Powered Symptom Analysis",
      subtitle: "Describe your symptoms in Swahili or English and get instant, accurate health insights powered by AI.",
      symptomsLabel: "Your Symptoms",
      symptomsPlaceholder: "E.g., Nina homa na kichwa kinaumwa",
      symptomsDescription: "Be as detailed as possible for accurate analysis",
      ageLabel: "Age Range",
      agePlaceholder: "Select your age range",
      genderLabel: "Gender",
      genderPlaceholder: "Select your gender",
      analyze: "Analyze Symptoms",
      analyzing: "Analyzing...",
      ageRanges: {
        "0-12": "0-12 years",
        "13-17": "13-17 years",
        "18-35": "18-35 years",
        "36-50": "36-50 years",
        "51-65": "51-65 years",
        "65+": "65+ years",
      },
      genders: {
        male: "Male",
        female: "Female",
        other: "Other",
        prefer_not_to_say: "Prefer not to say",
      },
      riskLevels: {
        low: {
          badge: "Low Risk",
          title: "Common Condition",
          message: "Rest and hydrate.",
          button1: "Homecare Tips",
          button2: "Find Clinic",
        },
        medium: {
          badge: "Medium Risk",
          title: "Needs Attention",
          message: "See a doctor within 24–48 hrs.",
          button1: "Find Clinic",
          button2: "Homecare Tips",
        },
        high: {
          badge: "High Risk",
          title: "Emergency",
          message: "Seek immediate care.",
          button1: "Call Emergency",
          button2: "Find ER",
        },
      },
    },
    sw: {
      title: "Uchambuzi wa Dalili wa AI",
      subtitle: "Eleza dalili zako kwa Kiswahili au Kiingereza na upate maarifa ya haraka na sahihi ya afya yaliyo na nguvu za AI.",
      symptomsLabel: "Dalili Zako",
      symptomsPlaceholder: "Mfano: Nina homa na kichwa kinaumwa",
      symptomsDescription: "Kuwa wa kina iwezekanavyo kwa uchambuzi sahihi",
      ageLabel: "Umri",
      agePlaceholder: "Chagua umri wako",
      genderLabel: "Jinsia",
      genderPlaceholder: "Chagua jinsia yako",
      analyze: "Changanua Dalili",
      analyzing: "Inachamganua...",
      ageRanges: {
        "0-12": "Miaka 0-12",
        "13-17": "Miaka 13-17",
        "18-35": "Miaka 18-35",
        "36-50": "Miaka 36-50",
        "51-65": "Miaka 51-65",
        "65+": "Miaka 65+",
      },
      genders: {
        male: "Mwanaume",
        female: "Mwanamke",
        other: "Nyingine",
        prefer_not_to_say: "Sipendelei kusema",
      },
      riskLevels: {
        low: {
          badge: "Hatari ya Chini",
          title: "Hali ya Kawaida",
          message: "Pumzika na kunywa maji mengi.",
          button1: "Ushauri wa Nyumbani",
          button2: "Tafuta Kliniki",
        },
        medium: {
          badge: "Hatari ya Kati",
          title: "Inahitaji Umakini",
          message: "Ona daktari ndani ya masaa 24–48.",
          button1: "Tafuta Kliniki",
          button2: "Ushauri wa Nyumbani",
        },
        high: {
          badge: "Hatari Kubwa",
          title: "Dharura",
          message: "Tafuta huduma mara moja.",
          button1: "Piga Simu Dharura",
          button2: "Tafuta Chumba cha Dharura",
        },
      },
    },
  };

  const t = content[language];

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      toast.error(language === 'en' ? "Please describe your symptoms" : "Tafadhali eleza dalili zako");
      return;
    }

    if (!ageRange) {
      toast.error(language === 'en' ? "Please select your age range" : "Tafadhali chagua umri wako");
      return;
    }

    if (!gender) {
      toast.error(language === 'en' ? "Please select your gender" : "Tafadhali chagua jinsia yako");
      return;
    }

    setIsAnalyzing(true);

    try {
      const analysisResult = await symptomsAPI.analyze(symptoms, undefined, ageRange, gender);

      setResult({
        urgency: analysisResult.urgency,
        condition: analysisResult.condition,
        recommendations: analysisResult.recommendations,
        disclaimer: analysisResult.disclaimer,
      });

      toast.success(language === 'en' ? "Analysis complete!" : "Uchambuzi umekamilika!");
    } catch (error) {
      toast.error(language === 'en'
        ? "Failed to analyze symptoms. Please try again."
        : "Imeshindwa kuchambanua dalili. Tafadhali jaribu tena.");
      console.error('Symptom analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskLevelConfig = (urgency: 'low' | 'medium' | 'high') => {
    const config = t.riskLevels[urgency];
    const colors = {
      low: {
        badge: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
        card: 'bg-green-50 border-green-200',
        icon: 'text-green-600',
      },
      medium: {
        badge: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100',
        card: 'bg-orange-50 border-orange-200',
        icon: 'text-orange-600',
      },
      high: {
        badge: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
        card: 'bg-red-50 border-red-200',
        icon: 'text-red-600',
      },
    };

    return { ...config, colors: colors[urgency] };
  };

  const handlePrimaryAction = (urgency: string) => {
    if (urgency === 'high') {
      // Call emergency - in Kenya, emergency number is 999 or 112
      window.location.href = 'tel:999';
    } else if (urgency === 'medium') {
      // Navigate to clinic locator
      document.getElementById('clinic-locator')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Low risk: Show homecare tips
      toast.info(language === 'en'
        ? "Homecare tips: Rest, stay hydrated, and monitor your symptoms closely."
        : "Ushauri wa nyumbani: Pumzika, nywa maji mengi, na fuatilia dalili zako kwa karibu.");
    }
  };

  const handleSecondaryAction = (urgency: string) => {
    if (urgency === 'high') {
      // Find nearest emergency room
      document.getElementById('clinic-locator')?.scrollIntoView({ behavior: 'smooth' });
    } else if (urgency === 'medium') {
      // Medium risk: Show homecare tips
      toast.info(language === 'en'
        ? "Homecare tips: Rest, stay hydrated, monitor symptoms, and seek medical attention if they worsen."
        : "Ushauri wa nyumbani: Pumzika, nywa maji mengi, fuatilia dalili, na tafuta huduma ya daktari ikiwa zinazidi.");
    } else {
      // Low risk: Navigate to clinic locator
      document.getElementById('clinic-locator')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getIcon = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return <AlertCircle className="w-5 h-5" />;
      case 'medium':
        return <Stethoscope className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  return (
    <section id="symptom-checker" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
              {t.title}
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          {/* Main Card */}
          <Card className="shadow-xl border-2">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl sm:text-2xl">
                {language === 'en' ? 'Tell us about your symptoms' : 'Tuambie kuhusu dalili zako'}
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                {t.symptomsDescription}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 sm:space-y-6">
              {/* Symptoms Input */}
              <div className="space-y-2">
                <Label htmlFor="symptoms" className="text-sm sm:text-base font-medium">
                  {t.symptomsLabel}
                </Label>
                <Textarea
                  id="symptoms"
                  placeholder={t.symptomsPlaceholder}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={5}
                  className="resize-none text-base focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              {/* Age and Gender Selectors - Mobile First Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Age Range Selector */}
                <div className="space-y-2">
                  <Label htmlFor="age-range" className="text-sm sm:text-base font-medium">
                    {t.ageLabel}
                  </Label>
                  <Select value={ageRange} onValueChange={setAgeRange}>
                    <SelectTrigger id="age-range" className="h-11 text-base">
                      <SelectValue placeholder={t.agePlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-12">{t.ageRanges["0-12"]}</SelectItem>
                      <SelectItem value="13-17">{t.ageRanges["13-17"]}</SelectItem>
                      <SelectItem value="18-35">{t.ageRanges["18-35"]}</SelectItem>
                      <SelectItem value="36-50">{t.ageRanges["36-50"]}</SelectItem>
                      <SelectItem value="51-65">{t.ageRanges["51-65"]}</SelectItem>
                      <SelectItem value="65+">{t.ageRanges["65+"]}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender Selector */}
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm sm:text-base font-medium">
                    {t.genderLabel}
                  </Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger id="gender" className="h-11 text-base">
                      <SelectValue placeholder={t.genderPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t.genders.male}</SelectItem>
                      <SelectItem value="female">{t.genders.female}</SelectItem>
                      <SelectItem value="other">{t.genders.other}</SelectItem>
                      <SelectItem value="prefer_not_to_say">{t.genders.prefer_not_to_say}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Analyze Button */}
              <Button
                onClick={analyzeSymptoms}
                disabled={isAnalyzing}
                className="w-full h-12 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {t.analyzing}
                  </>
                ) : (
                  t.analyze
                )}
              </Button>

              {/* Results Section */}
              {result && (
                <div className="mt-6 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Risk Level Card */}
                  <div className={`p-5 sm:p-6 rounded-xl border-2 ${getRiskLevelConfig(result.urgency).colors.card}`}>
                    {/* Risk Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <Badge
                        variant="outline"
                        className={`text-sm sm:text-base px-3 py-1 font-semibold ${getRiskLevelConfig(result.urgency).colors.badge}`}
                      >
                        <span className={getRiskLevelConfig(result.urgency).colors.icon}>
                          {getIcon(result.urgency)}
                        </span>
                        <span className="ml-2">{getRiskLevelConfig(result.urgency).badge}</span>
                      </Badge>
                    </div>

                    {/* Condition */}
                    <div className="mb-4">
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                        {getRiskLevelConfig(result.urgency).title}
                      </h3>
                      <p className="text-base sm:text-lg font-medium text-foreground/90 mb-1">
                        {result.condition}
                      </p>
                      <p className="text-sm sm:text-base text-muted-foreground font-medium">
                        {getRiskLevelConfig(result.urgency).message}
                      </p>
                    </div>

                    {/* Recommendations */}
                    <div className="mb-5">
                      <h4 className="font-semibold text-foreground text-sm sm:text-base mb-2">
                        {language === 'en' ? 'Recommendations:' : 'Mapendekezo:'}
                      </h4>
                      <ul className="space-y-2">
                        {result.recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm sm:text-base text-foreground/80">
                            <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${getRiskLevelConfig(result.urgency).colors.icon}`} />
                            <span>{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button
                        onClick={() => handlePrimaryAction(result.urgency)}
                        className="w-full h-11 text-base font-semibold"
                        variant={result.urgency === 'high' ? 'destructive' : 'default'}
                      >
                        {result.urgency === 'high' && <Phone className="w-4 h-4 mr-2" />}
                        {result.urgency === 'medium' && <MapPin className="w-4 h-4 mr-2" />}
                        {result.urgency === 'low' && <Home className="w-4 h-4 mr-2" />}
                        {getRiskLevelConfig(result.urgency).button1}
                      </Button>
                      <Button
                        onClick={() => handleSecondaryAction(result.urgency)}
                        className="w-full h-11 text-base font-semibold"
                        variant="outline"
                      >
                        {result.urgency === 'high' && <MapPin className="w-4 h-4 mr-2" />}
                        {result.urgency === 'medium' && <Home className="w-4 h-4 mr-2" />}
                        {result.urgency === 'low' && <MapPin className="w-4 h-4 mr-2" />}
                        {getRiskLevelConfig(result.urgency).button2}
                      </Button>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded-md">
                    <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                      <strong>{language === 'en' ? 'Disclaimer:' : 'Onyo:'}</strong> {result.disclaimer}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
