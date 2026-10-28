import { useState } from "react";
import type { GridPoint } from "@/types/localVisibility";

function rankClasses(point: Pick<GridPoint, "rank" | "failed">) {
  if (point.failed) return "border-dashed border-border bg-surface text-muted";
  if (point.rank === null) return "border-transparent bg-neutral-300 text-neutral-700";
  if (point.rank <= 3) return "border-transparent bg-green-600 text-white";
  if (point.rank <= 10) return "border-transparent bg-amber-400 text-neutral-900";
  return "border-transparent bg-orange-500 text-white";
}

function rankLabel(point: GridPoint) {
  if (point.failed) return "–";
  return point.rank === null ? "20+" : String(point.rank);
}

function movement(point: GridPoint) {
  if (point.failed || point.previous_rank === null || point.rank === null) return null;
  return point.previous_rank - point.rank; // positive = moved up
}

export function GridMap({ points, size, radiusKm }: { points: GridPoint[]; size: number; radiusKm: number }) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const active = points.find((point) => `${point.row}-${point.col}` === activeKey) ?? null;
  const moved = active ? movement(active) : null;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div>
        <div className="mx-auto w-full max-w-[520px]">
          <p className="text-center text-[0.65rem] font-bold uppercase tracking-[0.15em] text-muted">North</p>
          <div className="mt-1 grid gap-2 sm:gap-3" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
            {points.map((point) => {
              const key = `${point.row}-${point.col}`;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveKey(key)}
                  aria-label={`Grid point row ${point.row + 1}, column ${point.col + 1}: ${rankLabel(point)}`}
                  className={`flex aspect-square items-center justify-center rounded-full border-2 text-sm font-semibold transition hover:scale-105 ${rankClasses(point)} ${activeKey === key ? "ring-2 ring-primary ring-offset-2" : ""}`}
                >
                  {rankLabel(point)}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-center text-xs text-muted">
            Each circle is a search from a different spot, up to {radiusKm} km from the centre. The number is where the business shows in Google Maps there.
          </p>
        </div>
        <Legend />
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        {active ? (
          <>
            <p className="text-sm font-semibold">
              {active.failed ? "Check failed" : active.rank === null ? "Not in the top 20 here" : `Ranks #${active.rank} here`}
            </p>
            {moved !== null && moved !== 0 ? (
              <p className={`mt-1 text-xs font-medium ${moved > 0 ? "text-success" : "text-danger"}`}>
                {moved > 0 ? "↑" : "↓"} {Math.abs(moved)} {Math.abs(moved) === 1 ? "place" : "places"} since the last scan
              </p>
            ) : null}
            <p className="mt-1 text-xs text-muted">
              {active.latitude.toFixed(4)}, {active.longitude.toFixed(4)}
            </p>
            {active.top_results.length > 0 ? (
              <>
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.08em] text-muted">Top results here</p>
                <ol className="mt-2 space-y-2">
                  {active.top_results.map((result) => (
                    <li key={`${result.rank}-${result.title}`} className="text-sm">
                      <span className="font-semibold">#{result.rank}</span> {result.title}
                      {result.rating ? <span className="text-xs text-muted"> · {result.rating}★ ({result.reviews ?? 0})</span> : null}
                    </li>
                  ))}
                </ol>
              </>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-muted">Select a circle to see who ranks around that spot.</p>
        )}
      </div>
    </div>
  );
}

function Legend() {
  const items: { label: string; className: string }[] = [
    { label: "1–3", className: "bg-green-600" },
    { label: "4–10", className: "bg-amber-400" },
    { label: "11–20", className: "bg-orange-500" },
    { label: "Not in top 20", className: "bg-neutral-300" },
  ];
  return (
    <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5 text-xs text-muted">
          <span className={`h-3 w-3 rounded-full ${item.className}`} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
