import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useUser } from "@/context/UserContext";

export default function Speech() {
  const { t } = useUser();
  return (
    <div className="min-h-screen pb-28">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6 space-y-2">
        <h1 className="text-xl font-semibold">{t("speech")}</h1>
        <p className="text-sm text-muted-foreground">Real-time speech-to-speech translation via API.</p>
      </main>
      <BottomNav />
    </div>
  );
}
