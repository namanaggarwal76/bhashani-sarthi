
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
<<<<<<< HEAD
import { useUser } from "@/context/UserContext";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft } from "lucide-react";
=======
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";


// Supported language codes and names
const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "bn", name: "Bengali" },
  { code: "te", name: "Telugu" },
  { code: "ta", name: "Tamil" },
  { code: "ml", name: "Malayalam" },
  { code: "kn", name: "Kannada" },
  { code: "gu", name: "Gujarati" },
  { code: "mr", name: "Marathi" },
  { code: "or", name: "Odia" },
  { code: "pa", name: "Punjabi" },
  { code: "as", name: "Assamese" },
  { code: "ur", name: "Urdu" },
  { code: "sa", name: "Sanskrit" },
  { code: "ne", name: "Nepali" },
  { code: "sd", name: "Sindhi" },
  { code: "ks", name: "Kashmiri" },
  { code: "brx", name: "Bodo" },
  { code: "doi", name: "Dogri" },
  { code: "gom", name: "Konkani" },
  { code: "mai", name: "Maithili" },
  { code: "mni", name: "Manipuri" },
  { code: "sat", name: "Santali" },
];

const AUTH_TOKEN = "DveTyi8IJRxMNJdbUI0EhiE1X0yQYmoIiNLafiNLYbr4K0JCmDxFasFbOQQgkz7w";
const MT_SERVICE_ID = "ai4bharat/indictrans-v2-all-gpu--t4";
const API_URL = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline";

async function translateText(text, sourceLang, targetLang) {
  if (!text.trim()) throw new Error("Text cannot be empty");
  if (sourceLang === targetLang) throw new Error("Source and target languages must be different");
  const payload = {
    pipelineTasks: [
      {
        taskType: "translation",
        config: {
          language: {
            sourceLanguage: sourceLang,
            targetLanguage: targetLang,
          },
          serviceId: MT_SERVICE_ID,
          numTranslation: "True",
        },
      },
    ],
    inputData: {
      input: [{ source: text }],
      audio: [{ audioContent: null }],
    },
  };
  const headers = {
    Authorization: AUTH_TOKEN,
    "Content-Type": "application/json",
  };
  const res = await fetch(API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`MT request failed [${res.status}]: ${await res.text()}`);
  const result = await res.json();
  try {
    return result.pipelineResponse[0].output[0].target;
  } catch {
    throw new Error("No translation found in MT response");
  }
}
>>>>>>> origin/main

export default function Translate() {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [sourceLang, setSourceLang] = useState("hi");
  const [targetLang, setTargetLang] = useState("en");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTranslate = async () => {
    setError("");
    setResult("");
    setLoading(true);
    try {
      const translated = await translateText(text, sourceLang, targetLang);
      setResult(translated);
    } catch (e) {
      setError(e.message || "Translation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
  <div className="min-h-screen pb-28 bg-transparent">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{t("translate")}</h1>
          <p className="text-gray-900">Instantly translate text between languages.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <Textarea placeholder="Enter text to translate..." className="h-36 text-base" />
          <Textarea placeholder="Translation..." readOnly className="h-36 bg-gray-100/60 text-base" />
        </div>
        <div className="flex justify-center items-center gap-4">
            <Button variant="outline">English</Button>
            <ArrowRightLeft className="h-6 w-6 text-gray-900" />
            <Button variant="outline">Hindi</Button>
            <Button>Translate</Button>
        </div>
=======
    <div className="min-h-screen pb-28 flex flex-col bg-white">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 flex flex-col justify-center px-4 sm:px-6 md:px-8 py-6 sm:py-8 space-y-6">
        <h1 className="text-2xl font-semibold text-center mb-2">{t("translate.title")}</h1>
        <div className="flex flex-col sm:flex-row gap-6 mt-2 items-stretch">
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex flex-col mb-2">
              <label className="mb-1 text-sm font-medium text-gray-700 text-left">From</label>
              <select
                className="border rounded px-3 py-2 bg-white w-full"
                value={sourceLang}
                onChange={e => setSourceLang(e.target.value)}
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
            <label className="mb-2 text-sm font-medium text-gray-700">{t("INPUT TEXT") || "Input Text"}</label>
            <textarea
              className="border rounded px-3 py-3 min-h-[120px] sm:min-h-[140px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder={t("translate.placeholder")}
              value={text}
              onChange={e => setText(e.target.value)}
            />
          </div>
          <div className="flex-1 flex flex-col justify-between mt-4 sm:mt-0">
            <div className="flex flex-col mb-2">
              <label className="mb-1 text-sm font-medium text-gray-700 text-left">To</label>
              <select
                className="border rounded px-3 py-2 bg-white w-full"
                value={targetLang}
                onChange={e => setTargetLang(e.target.value)}
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
            <label className="mb-2 text-sm font-medium text-gray-700">{t("TRANSLATED TEXT") || "Translated Text"}</label>
            <textarea
              className="border rounded px-3 py-3 min-h-[120px] sm:min-h-[140px] resize-none bg-gray-50 focus:outline-none"
              value={result}
              readOnly
              placeholder={t("OUTPUT") || "Translation will appear here"}
            />
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <Button onClick={handleTranslate} disabled={loading || !text.trim() || sourceLang === targetLang} className="px-6 py-2 text-base w-full sm:w-auto">
            {loading ? t("translate.loading") : t("translate.button")}
          </Button>
        </div>
        {error && <p className="text-sm text-red-500 text-center mt-2">{error}</p>}
        <p className="text-sm text-muted-foreground text-center mt-2">
          {t("translate.description")}
        </p>
>>>>>>> origin/main
      </main>
      <BottomNav />
    </div>
  );
}