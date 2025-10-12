import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useTranslation } from "react-i18next";

export default function OCR() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen pb-28">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6 space-y-2">
        <h1 className="text-xl font-semibold">{t("ocr.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("ocr.description")}
        </p>
      </main>
      <BottomNav />
    </div>
  );
}
