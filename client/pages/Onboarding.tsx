import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useUser, BasicInfo, Preferences } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Onboarding() {
  const { currentUser } = useAuth();
  const { completeOnboarding, user } = useUser();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Get the language that was already selected
  const selectedLanguage = localStorage.getItem("selectedLanguage") || i18n.language || "en";

  // Redirect if user already completed onboarding
  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const [basic, setBasic] = useState<BasicInfo>({
    name: "",
    email: currentUser?.email || "",
    country: "",
    age: 18,
    language: { code: selectedLanguage, name: selectedLanguage },
  });

  const [prefs, setPrefs] = useState<Preferences>({
    interests: [],
    travel_style: "relaxed",
    budget: "moderate",
  });

  const interestOptions = [
    "food",
    "monuments",
    "nature",
    "culture",
    "museums",
    "adventure",
  ];

  const submit = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      await completeOnboarding({
        basic_info: { ...basic, language: { code: selectedLanguage, name: selectedLanguage } },
        preferences: prefs,
      });
      navigate("/home");
    } catch (error) {
      console.error("Onboarding failed:", error);
      alert("Failed to complete onboarding. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-transparent">
      <div className="mx-auto max-w-md px-6 pt-10 pb-28">
        <h1 className="text-3xl font-extrabold tracking-tight">{t('landing.title')}</h1>
        <p className="text-muted-foreground">{t('landing.subtitle')}</p>

        {step === 1 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold">{t('onboarding.title')}</h2>
            <div className="grid gap-4">
              <div>
                <Label>{t('onboarding.name')}</Label>
                <Input
                  value={basic.name}
                  onChange={(e) => setBasic({ ...basic, name: e.target.value })}
                  placeholder={t('onboarding.name')}
                />
              </div>
              <div>
                <Label>{t('auth.email')}</Label>
                <Input
                  value={basic.email}
                  onChange={(e) =>
                    setBasic({ ...basic, email: e.target.value })
                  }
                  placeholder={t('auth.email')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('onboarding.country')}</Label>
                  <Input
                    value={basic.country}
                    onChange={(e) =>
                      setBasic({ ...basic, country: e.target.value })
                    }
                    placeholder={t('onboarding.country')}
                  />
                </div>
                <div>
                  <Label>{t('onboarding.age')}</Label>
                  <Input
                    type="number"
                    value={basic.age}
                    onChange={(e) =>
                      setBasic({ ...basic, age: Number(e.target.value) })
                    }
                    placeholder={t('onboarding.age')}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button className="w-full" onClick={() => setStep(2)}>
                {t('common.next')}
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold">{t('onboarding.title')}</h2>
            <div>
              <Label>{t('onboarding.interests')}</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {interestOptions.map((i) => {
                  const active = prefs.interests.includes(i);
                  return (
                    <button
                      key={i}
                      className={`rounded-full px-3 py-1 text-sm border ${active ? "bg-primary text-primary-foreground" : "bg-white"}`}
                      onClick={() =>
                        setPrefs((p) => ({
                          ...p,
                          interests: active
                            ? p.interests.filter((x) => x !== i)
                            : [...p.interests, i],
                        }))
                      }
                    >
                      {t(`onboarding.interestsList.${i}`)}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('onboarding.travelStyle')}</Label>
                <Select
                  value={prefs.travel_style}
                  onValueChange={(v) => setPrefs({ ...prefs, travel_style: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relaxed">{t('onboarding.travelStyles.relaxed')}</SelectItem>
                    <SelectItem value="adventurous">{t('onboarding.travelStyles.adventurous')}</SelectItem>
                    <SelectItem value="cultural">{t('onboarding.travelStyles.cultural')}</SelectItem>
                    <SelectItem value="luxury">{t('onboarding.travelStyles.luxury')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('onboarding.budget')}</Label>
                <Select
                  value={prefs.budget}
                  onValueChange={(v) => setPrefs({ ...prefs, budget: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t('onboarding.budgetLevels.low')}</SelectItem>
                    <SelectItem value="moderate">{t('onboarding.budgetLevels.moderate')}</SelectItem>
                    <SelectItem value="high">{t('onboarding.budgetLevels.high')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={() => setStep(1)} disabled={loading}>
                {t('common.back')}
              </Button>
              <Button className="flex-1" onClick={submit} disabled={loading}>
                {loading ? t('common.loading') : t('common.finish')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
