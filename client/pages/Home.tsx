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
  const { user, addChapter, t, loading } = useUser();
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
            {t("welcome")}, {user.basic_info.name?.split(" ")[0] || "Traveler"}{" "}
            👋
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("tier")}: {user.stats.tier} | {t("xp")}: {user.stats.xp}
          </p>
        </div>
        <XpBar />

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t("yourChapters")}</h3>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={loading || !user}>
                  {t("createChapter")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("createChapter")}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3">
                  <Input
                    placeholder={t("city") + " *"}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                  <Input
                    placeholder={t("country") + " (optional)"}
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                  <Input
                    placeholder={t("description") + " (optional)"}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <Button 
                      variant="secondary" 
                      onClick={() => setOpen(false)}
                      disabled={submitting}
                    >
                      {t("cancel")}
                    </Button>
                    <Button 
                      onClick={submit}
                      disabled={submitting || !user || !city}
                    >
                      {submitting ? "Generating AI Tasks..." : t("add")}
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
              {t("startJourney")}
            </div>
          )}
        </section>
      </main>

      <Button
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg"
        size="icon"
        onClick={() => setOpen(true)}
        disabled={loading || !user}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <BottomNav />
    </div>
  );
}
