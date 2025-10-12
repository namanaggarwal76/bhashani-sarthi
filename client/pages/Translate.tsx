import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Translate() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen pb-28">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <h1 className="text-xl font-semibold">{t("translate.title")}</h1>
        <div className="flex gap-2">
          <Input placeholder={t("translate.placeholder")} />
          <Button>{t("translate.button")}</Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("translate.description")}
        </p>
      </main>
      <BottomNav />
    </div>
  );
}
