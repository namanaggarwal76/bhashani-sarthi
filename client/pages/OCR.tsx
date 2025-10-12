import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import LiveLensOCR from "./LiveLens";
import { useTranslation } from "react-i18next";

export default function OCR() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen pb-28 bg-gray-50">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{t("ocr.title") || "Live Lens OCR"}</h1>
          <p className="text-sm text-muted-foreground">
            {t("ocr.description") || "Point your camera at text to extract and translate it in real-time"}
          </p>
        </div>
        <LiveLensOCR />
      </main>
      <BottomNav />
    </div>
  );
}
