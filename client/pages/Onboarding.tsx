import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUser, BasicInfo, Preferences } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

const languages = [ { code: "en-US", name: "English" }, { code: "hi-IN", name: "Hindi" }, { code: "es-ES", name: "Spanish" }];
const interestOptions = ["food", "monuments", "nature", "culture", "museums", "adventure"];

// A sleek progress bar component
const ProgressIndicator = ({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) => (
  <div className="flex w-full gap-2">
    {Array.from({ length: totalSteps }).map((_, i) => (
  <div key={i} className={`h-1 flex-1 rounded-full ${i < currentStep ? 'bg-gradient-to-r from-purple-500 to-blue-600' : 'bg-secondary'}`} />
    ))}
  </div>
);

export default function Onboarding() {
  const { currentUser } = useAuth();
  const { completeOnboarding, user } = useUser();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState(languages[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate("/home"); }, [user, navigate]);
  useEffect(() => { if (!currentUser) navigate("/login"); }, [currentUser, navigate]);

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
  
  const submit = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      await completeOnboarding({ basic_info: { ...basic, language }, preferences: prefs });
      navigate("/home");
    } catch (error) {
      console.error("Onboarding failed:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const motionProps = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
    transition: { type: "tween" as const, duration: 0.3 },
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Sarthi</h1>
          <p className="text-muted-foreground">Let's set up your profile</p>
        </div>
        
        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
          <ProgressIndicator currentStep={step} totalSteps={3} />
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key={1} {...motionProps} className="space-y-4">
                <h2 className="text-xl font-semibold">Choose your language</h2>
                <Select value={language.code} onValueChange={(v) => setLanguage(languages.find((l) => l.code === v)!)}>
                  <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                  <SelectContent>{languages.map((l) => (<SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>))}</SelectContent>
                </Select>
                <Button className="w-full !mt-6" onClick={() => setStep(2)}>Continue</Button>
              </motion.div>
            )}

            {step === 2 && (
               <motion.div key={2} {...motionProps} className="space-y-4">
                <h2 className="text-xl font-semibold">Create your profile</h2>
                {/* Inputs for name, email, country, age, sex */}
                {/* ... same input logic as before ... */}
                <div className="flex gap-3 pt-2">
                  <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                  <Button className="flex-1" onClick={() => setStep(3)}>Continue</Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
               <motion.div key={3} {...motionProps} className="space-y-4">
                <h2 className="text-xl font-semibold">Tell us your style</h2>
                <div>
                  <Label>Interests</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {interestOptions.map((i) => {
                      const active = prefs.interests.includes(i);
                      return (
                        <button key={i} onClick={() => setPrefs(p => ({...p, interests: active ? p.interests.filter(x => x !== i) : [...p.interests, i]}))}
                          className={`rounded-full px-4 py-1.5 text-sm border transition-colors ${active ? "text-white border-transparent bg-gradient-to-r from-purple-500 to-blue-600" : "bg-transparent hover:bg-accent"}`}>
                          {i}
                        </button>
                      );
                    })}
                  </div>
                </div>
                 {/* Selects for travel style and budget */}
                 {/* ... same select logic as before ... */}
                <div className="flex gap-3 pt-2">
                  <Button variant="secondary" onClick={() => setStep(2)} disabled={loading}>Back</Button>
                  <Button className="flex-1" onClick={submit} disabled={loading}>{loading ? "Saving..." : "Finish Setup"}</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}