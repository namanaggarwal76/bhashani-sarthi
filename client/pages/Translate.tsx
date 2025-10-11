import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useUser } from "@/context/UserContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Translate() {
  const { t } = useUser();
  return (
    <div className="min-h-screen pb-28">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <h1 className="text-xl font-semibold">{t("translate")}</h1>
        <div className="flex gap-2">
          <Input placeholder="Enter text" />
          <Button>Go</Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Real-time translation via API (not stored).
        </p>
      </main>
      <BottomNav />
    </div>
  );
}
