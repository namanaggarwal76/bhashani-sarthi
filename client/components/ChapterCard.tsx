import { CheckCircle2, Circle } from "lucide-react";
import { Chapter } from "@/context/UserContext";
import { useUser } from "@/context/UserContext";

export default function ChapterCard({ chapter }: { chapter: Chapter }) {
  const { togglePlaceDone } = useUser();
  const completed = chapter.ai_suggested_places.filter((p) => p.status === "done").length;
  const total = chapter.ai_suggested_places.length;

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{chapter.city}, {chapter.country}</h3>
          {chapter.description && (
            <p className="text-sm text-muted-foreground mt-1">{chapter.description}</p>
          )}
        </div>
        <div className="text-sm text-muted-foreground">{completed}/{total}</div>
      </div>
      <ul className="mt-3 space-y-2">
        {chapter.ai_suggested_places.map((p) => (
          <li
            key={p.place_id}
            className="flex items-center justify-between rounded-xl bg-secondary px-3 py-2"
          >
            <div className="flex items-center gap-2">
              {p.status === "done" ? (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium leading-tight">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.type} • ⭐ {p.rating.toFixed(1)}</p>
              </div>
            </div>
            <button
              onClick={() => togglePlaceDone(chapter.id, p.place_id)}
              className={`text-xs font-semibold rounded-full px-3 py-1 ${p.status === "done" ? "bg-primary text-primary-foreground" : "bg-white text-foreground border"}`}
            >
              {p.status === "done" ? "Done" : "Mark"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
