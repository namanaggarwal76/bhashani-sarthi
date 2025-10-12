import { BadgeCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useUser } from "@/context/UserContext";

export default function Header() {
  const { user } = useUser();
<<<<<<< HEAD

  return (
    <header className="sticky top-3 z-50">
      <div className="mx-auto w-[94%] rounded-2xl bg-white/98 shadow-xl ring-1 ring-black/5 backdrop-blur supports-[backdrop-filter]:bg-white/75 dark:bg-zinc-900/85">
        <div className="mx-auto w-full max-w-5xl px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl overflow-hidden grid place-items-center">
                <img src="/images/icon.jpg" alt="Sarthi logo" className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="font-extrabold text-lg tracking-tight">Sarthi</p>
                <p className="text-xs text-gray-900">Your AI Travel Companion</p>
              </div>
=======
  const { t } = useTranslation();
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-b from-white/80 to-white/30 backdrop-blur border-b border-transparent supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-3xl px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl overflow-hidden">
              <img src="/logo.png" alt="Sarthi Logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="font-extrabold text-lg tracking-tight">{t('landing.title')}</p>
              <p className="text-xs text-muted-foreground">
                {t('landing.subtitle')}
              </p>
>>>>>>> origin/main
            </div>

            {user && (
              <div className="flex items-center gap-3 rounded-full bg-secondary px-3 py-1 text-sm">
                <BadgeCheck className="h-4 w-4 text-gray-900" />
                <span>{user.stats.tier}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
