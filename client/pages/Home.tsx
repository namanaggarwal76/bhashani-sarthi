import { useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import XpBar from "@/components/XpBar";
import ChapterCard from "@/components/ChapterCard";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, Compass } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { user, addChapter, t, loading } = useUser();
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

<<<<<<< HEAD
  const submit = () => {
    if (!city || !country) return;
    addChapter({ city, country, description });
    setCity(""); setCountry(""); setDescription("");
    setOpen(false);
=======
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
>>>>>>> origin/main
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading your journey...</div>
      </div>
    );
  }

  return (
    <div className="bg-transparent min-h-screen pb-28">
      <Header />
<<<<<<< HEAD
      <main className="mx-auto max-w-3xl px-4 py-4 space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("welcome")}, {user?.basic_info.name?.split(" ")[0] || "Traveler"} 👋
          </h2>
          <p className="text-sm text-gray-900">
            {t("tier")}: {user?.stats.tier} | {t("xp")}: {user?.stats.xp}
=======
      <main className="mx-auto max-w-3xl px-4 py-4 space-y-6">
        <div>
          <h2 className="text-xl font-semibold">
            {t("welcome")}, {user.basic_info.name?.split(" ")[0] || "Traveler"}{" "}
            👋
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("tier")}: {user.stats.tier} | {t("xp")}: {user.stats.xp}
>>>>>>> origin/main
          </p>
        </motion.div>
        
        <XpBar />

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold">{t("yourChapters")}</h3>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
<<<<<<< HEAD
                <Button size="sm" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />{t("createChapter")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{t("createChapter")}</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                  <Input placeholder={t("city")} value={city} onChange={(e) => setCity(e.target.value)} />
                  <Input placeholder={t("country")} value={country} onChange={(e) => setCountry(e.target.value)} />
                  <Input placeholder={`${t("description")} (Optional)`} value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setOpen(false)}>{t("cancel")}</Button>
                  <Button onClick={submit}>{t("add")}</Button>
=======
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
>>>>>>> origin/main
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {user && user.chapters.length > 0 ? (
            <div className="space-y-4">
              {user.chapters.map((c, index) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ChapterCard chapter={c} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-card/30 p-12 text-center">
              <Compass className="h-12 w-12 text-muted-foreground mb-4" />
              <h4 className="text-lg font-semibold">{t("startJourney")}</h4>
              <p className="text-sm text-gray-900 mt-1 max-w-xs">Create your first chapter to begin collecting places and earning XP.</p>
              <Button className="mt-4" onClick={() => setOpen(true)}>Start a New Chapter</Button>
            </div>
          )}
        </section>
      </main>

<<<<<<< HEAD
=======
      <Button
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg"
        size="icon"
        onClick={() => setOpen(true)}
        disabled={loading || !user}
      >
        <Plus className="h-6 w-6" />
      </Button>

>>>>>>> origin/main
      <BottomNav />
    </div>
  );
}