import { NavLink } from "react-router-dom";
import { Camera, Home, Languages, MessageCircle, Mic } from "lucide-react";
import { useUser } from "@/context/UserContext";

const Tab = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center justify-center text-xs px-4 py-2 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`
    }
  >
    <Icon className="h-6 w-6" />
    <span className="mt-1">{label}</span>
  </NavLink>
);

export default function BottomNav() {
  const { t } = useUser();
  return (
    <nav className="fixed bottom-3 left-1/2 z-50 w-[94%] -translate-x-1/2 rounded-2xl bg-white/90 shadow-xl ring-1 ring-black/5 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:bg-zinc-900/80">
      <div className="grid grid-cols-5">
        <Tab to="/home" icon={Home} label={t("home")} />
        <Tab to="/translate" icon={Languages} label={t("translate")} />
        <Tab to="/speech" icon={Mic} label={t("speech")} />
        <Tab to="/ocr" icon={Camera} label={t("ocr")} />
        <Tab to="/guide" icon={MessageCircle} label={t("guide")} />
      </div>
    </nav>
  );
}
