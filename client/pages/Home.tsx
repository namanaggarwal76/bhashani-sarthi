import { useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import XpBar from "@/components/XpBar";
import ChapterCard from "@/components/ChapterCard";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

export default function Home() {
  const { user, addChapter, t } = useUser();
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [description, setDescription] = useState("");

  const submit = () => {
    if (!city || !country) return;
    addChapter({ city, country, description });
    setCity("");
    setCountry("");
    setDescription("");
    setOpen(false);
  };

  return (
    <div className="min-h-screen pb-28">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-4 space-y-6">
        <div>
          <h2 className="text-xl font-semibold">
            {t("welcome")}, {user?.basic_info.name?.split(" ")[0] || "Traveler"}{" "}
            👋
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("tier")}: {user?.stats.tier} | {t("xp")}: {user?.stats.xp}
          </p>
        </div>
        <XpBar />

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t("yourChapters")}</h3>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm">{t("createChapter")}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("createChapter")}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3">
                  <Input
                    placeholder={t("city")}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <Input
                    placeholder={t("country")}
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                  <Input
                    placeholder={t("description")}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="secondary" onClick={() => setOpen(false)}>
                      {t("cancel")}
                    </Button>
                    <Button onClick={submit}>{t("add")}</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {user && user.chapters.length > 0 ? (
            <div className="space-y-4">
              {user.chapters.map((c) => (
                <ChapterCard key={c.id} chapter={c} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border bg-card p-6 text-center text-muted-foreground">
              {t("startJourney")}
            </div>
          )}
        </section>
      </main>

      <Button
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg"
        size="icon"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <BottomNav />
    </div>
  );
}
