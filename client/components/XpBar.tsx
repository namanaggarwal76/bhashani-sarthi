import { useUser } from "@/context/UserContext";
import { Progress } from "@/components/ui/progress";

export default function XpBar() {
  const { user, t } = useUser();
  const xp = user?.stats.xp ?? 0;
  const percent = Math.min(100, (xp % 1000) / 10); // visualize progress within current tier window
  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-4">
      <div className="flex items-center justify-between text-sm mb-2">
        <span>
          {t("tier")}: <strong>{user?.stats.tier ?? "Wanderer"}</strong>
        </span>
        <span>
          {t("xp")}: <strong>{xp}</strong>
        </span>
      </div>
      <Progress value={percent} />
    </div>
  );
}
