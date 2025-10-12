import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supportedLanguages } from "@/lib/i18n";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LanguageSelection() {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorage.getItem("selectedLanguage") || "en"
  );

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    i18n.changeLanguage(languageCode);
    localStorage.setItem("selectedLanguage", languageCode);
  };

  const handleContinue = () => {
    // Check if user is already logged in
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/");
    } else {
      navigate("/signup");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-2">
            {t('languageSelection.title')}
          </h1>
          <p className="text-lg text-blue-700">
            {t('languageSelection.subtitle')}
          </p>
        </div>

        {/* Language Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {supportedLanguages.map((language) => (
            <Card
              key={language.code}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                selectedLanguage === language.code
                  ? "ring-4 ring-blue-600 bg-blue-50 shadow-xl"
                  : "hover:ring-2 hover:ring-blue-300"
              }`}
              onClick={() => handleLanguageSelect(language.code)}
            >
              <div className="p-6 text-center relative">
                {selectedLanguage === language.code && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-blue-600 rounded-full p-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
                <div className="text-3xl mb-2">{language.nativeName}</div>
                <div className="text-sm text-gray-600">{language.name}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleContinue}
            size="lg"
            className="px-12 py-6 text-lg bg-blue-600 hover:bg-blue-700"
            disabled={!selectedLanguage}
          >
            {t('languageSelection.continue')} →
          </Button>
        </div>
      </div>
    </div>
  );
}
