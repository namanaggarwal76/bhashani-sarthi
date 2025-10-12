import { useTranslation } from "react-i18next";
import { useUser } from "@/context/UserContext";
import Profile from "./Profile";

export default function Header() {
  const { user } = useUser();
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
            </div>
          </div>
          {user && <Profile />}
        </div>
      </div>
    </header>
  );
}
