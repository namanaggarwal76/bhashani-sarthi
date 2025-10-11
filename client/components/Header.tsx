import { BadgeCheck } from "lucide-react";
import { useUser } from "@/context/UserContext";

export default function Header() {
  const { user } = useUser();
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-b from-white/80 to-white/30 backdrop-blur border-b border-transparent supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-3xl px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground grid place-items-center font-extrabold">
              S
            </div>
            <div>
              <p className="font-extrabold text-lg tracking-tight">Sarthi</p>
              <p className="text-xs text-muted-foreground">
                Your AI Travel Companion
              </p>
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm">
              <BadgeCheck className="h-4 w-4 text-primary" />
              <span>{user.stats.tier}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
