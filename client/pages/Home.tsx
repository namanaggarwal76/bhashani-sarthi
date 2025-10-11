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
  const { user, addChapter, t } = useUser();
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [description, setDescription] = useState("");

  const submit = () => {
    if (!city || !country) return;
    addChapter({ city, country, description });
    setCity(""); setCountry(""); setDescription("");
    setOpen(false);
  };

  return (
    <div className="bg-transparent min-h-screen pb-28">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-4 space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("welcome")}, {user?.basic_info.name?.split(" ")[0] || "Traveler"} 👋
          </h2>
          <p className="text-sm text-gray-900">
            {t("tier")}: {user?.stats.tier} | {t("xp")}: {user?.stats.xp}
          </p>
        </motion.div>
        
        <XpBar />

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold">{t("yourChapters")}</h3>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
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

      <BottomNav />
    </div>
  );
}