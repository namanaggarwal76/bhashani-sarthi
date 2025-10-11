import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

const languages = [
  { code: "en-US", name: "English" },
  { code: "hi-IN", name: "Hindi" },
  { code: "es-ES", name: "Spanish" },
];

export default function Onboarding() {
  const { currentUser } = useAuth();
  const { completeOnboarding, user } = useUser();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState(languages[0]);
  const [loading, setLoading] = useState(false);

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
    sex: "",
    language,
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
        basic_info: { ...basic, language },
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
        <h1 className="text-3xl font-extrabold tracking-tight">Sarthi</h1>
        <p className="text-muted-foreground">Your AI Travel Companion</p>

        {step === 1 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold">
              Choose your preferred language
            </h2>
            <Select
              value={language.code}
              onValueChange={(v) =>
                setLanguage(languages.find((l) => l.code === v)!)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="pt-2">
              <Button className="w-full" onClick={() => setStep(2)}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold">Create your profile</h2>
            <div className="grid gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={basic.name}
                  onChange={(e) => setBasic({ ...basic, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={basic.email}
                  onChange={(e) =>
                    setBasic({ ...basic, email: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Country</Label>
                  <Input
                    value={basic.country}
                    onChange={(e) =>
                      setBasic({ ...basic, country: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Age</Label>
                  <Input
                    type="number"
                    value={basic.age}
                    onChange={(e) =>
                      setBasic({ ...basic, age: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Sex</Label>
                <Input
                  value={basic.sex}
                  onChange={(e) => setBasic({ ...basic, sex: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button className="flex-1" onClick={() => setStep(3)}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold">Preferences</h2>
            <div>
              <Label>Interests</Label>
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
                      {i}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Travel style</Label>
                <Select
                  value={prefs.travel_style}
                  onValueChange={(v) => setPrefs({ ...prefs, travel_style: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relaxed">relaxed</SelectItem>
                    <SelectItem value="adventurous">adventurous</SelectItem>
                    <SelectItem value="family-friendly">
                      family-friendly
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Budget</Label>
                <Select
                  value={prefs.budget}
                  onValueChange={(v) => setPrefs({ ...prefs, budget: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget">budget</SelectItem>
                    <SelectItem value="moderate">moderate</SelectItem>
                    <SelectItem value="luxury">luxury</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={() => setStep(2)} disabled={loading}>
                Back
              </Button>
              <Button className="flex-1" onClick={submit} disabled={loading}>
                {loading ? "Saving..." : "Finish"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
