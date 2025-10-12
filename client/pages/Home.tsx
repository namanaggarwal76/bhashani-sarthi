import { useState } from "react";
import { useTranslation } from "react-i18next";
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

export default function Home() {
  const { user, addChapter, loading } = useUser();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!city || submitting) return;
    
    setSubmitting(true);
    try {
      await addChapter({ 
        city, 
        ...(country && { country }), 
        ...(description && { description }) 
      });
      setCity("");
      setCountry("");
      setDescription("");
      setOpen(false);
    } catch (error) {
      console.error("Failed to create chapter:", error);
      alert("Failed to create chapter. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading your journey...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-4 space-y-6">
        <div>
          <h2 className="text-xl font-semibold">
            {t("home.welcome")}, {user.basic_info.name?.split(" ")[0] || "Traveler"}{" "}
            👋
          </h2>
        </div>
        <XpBar />

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t("home.yourChapters")}</h3>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={loading || !user}>
                  {t("home.addChapter")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("home.addChapter")}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3">
                  <Input
                    placeholder={t("home.city") + " *"}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                  <Input
                    placeholder={t("home.country")}
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                  <Input
                    placeholder={t("home.description")}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <Button 
                      variant="secondary" 
                      onClick={() => setOpen(false)}
                      disabled={submitting}
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button 
                      onClick={submit}
                      disabled={submitting || !user || !city}
                    >
                      {submitting ? t("home.generatingTasks") : t("home.addChapter")}
                    </Button>
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
              {t("home.noChaptersDesc")}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
