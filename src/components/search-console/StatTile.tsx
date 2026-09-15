import { Sparkline } from "./Sparkline";

type Delta =
  | { kind: "percent"; value: number; goodDirection: "up" | "down" }
  | { kind: "absolute"; value: number; unit: string; goodDirection: "up" | "down" }
  | null;

export function StatTile({
  label,
  value,
  delta,
  sparklineValues,
}: {
  label: string;
  value: string;
  /** null when there's no comparable prior-period data to compare against. */
  delta: Delta;
  sparklineValues?: number[];
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-xs font-medium text-muted">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
        {sparklineValues && sparklineValues.length >= 2 ? <Sparkline values={sparklineValues} /> : null}
      </div>
      <div className="mt-2 h-4">{delta ? <DeltaBadge delta={delta} /> : <span className="text-xs text-muted">No prior period to compare</span>}</div>
    </div>
  );
}

function DeltaBadge({ delta }: { delta: NonNullable<Delta> }) {
  const isUp = delta.value > 0;
  const isFlat = Math.round(delta.value * 10) === 0;
  const isGood = isFlat ? null : delta.goodDirection === "up" ? isUp : !isUp;

  const colorClass = isFlat ? "text-muted" : isGood ? "text-success" : "text-danger";
  const arrow = isFlat ? "" : isUp ? "↑" : "↓";
  const magnitude = delta.kind === "percent" ? `${Math.abs(delta.value).toFixed(1)}%` : `${Math.abs(delta.value).toFixed(1)} ${delta.unit}`;

  return (
    <span className={`text-xs font-medium ${colorClass}`}>
      {arrow} {magnitude} vs. previous period
    </span>
  );
}
