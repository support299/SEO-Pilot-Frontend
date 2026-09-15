import { useMemo, useRef, useState } from "react";
import type { DailyMetricRow } from "@/types/searchConsole";

type MetricKey = "clicks" | "impressions" | "ctr" | "position";

const METRICS: { key: MetricKey; label: string; format: (v: number) => string }[] = [
  { key: "clicks", label: "Clicks", format: (v) => Math.round(v).toLocaleString("en-US") },
  { key: "impressions", label: "Impressions", format: (v) => Math.round(v).toLocaleString("en-US") },
  { key: "ctr", label: "CTR", format: (v) => `${(v * 100).toFixed(1)}%` },
  { key: "position", label: "Avg. position", format: (v) => v.toFixed(1) },
];

const VIEW_WIDTH = 720;
const VIEW_HEIGHT = 220;
const PADDING = { top: 16, right: 16, bottom: 28, left: 44 };

export function TrendChart({ rows }: { rows: DailyMetricRow[] }) {
  const [metricKey, setMetricKey] = useState<MetricKey>("clicks");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const metric = METRICS.find((m) => m.key === metricKey)!;
  const values = rows.map((row) => row[metricKey]);
  const plot = useMemo(() => computePlot(values), [values]);

  if (rows.length < 2) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6">
        <ChartHeader metricKey={metricKey} onChange={setMetricKey} />
        <p className="mt-8 text-center text-sm text-muted">Not enough synced days yet to draw a trend line.</p>
      </div>
    );
  }

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const relativeX = ((event.clientX - rect.left) / rect.width) * VIEW_WIDTH;
    const plotWidth = VIEW_WIDTH - PADDING.left - PADDING.right;
    const ratio = clamp((relativeX - PADDING.left) / plotWidth, 0, 1);
    const index = Math.round(ratio * (rows.length - 1));
    setHoverIndex(clamp(index, 0, rows.length - 1));
  }

  const activeIndex = hoverIndex ?? rows.length - 1;
  const activeRow = rows[activeIndex]!;
  const firstRow = rows[0]!;
  const lastRow = rows[rows.length - 1]!;
  const activePoint = plot.points[hoverIndex ?? rows.length - 1]!;
  const lastPoint = plot.points[rows.length - 1]!;
  const firstPoint = plot.points[0]!;

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <ChartHeader metricKey={metricKey} onChange={setMetricKey} />

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="mt-4 w-full touch-none"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoverIndex(null)}
        role="img"
        aria-label={`${metric.label} trend from ${firstRow.date} to ${lastRow.date}`}
      >
        {plot.yTicks.map((tick) => (
          <g key={tick.value}>
            <line x1={PADDING.left} x2={VIEW_WIDTH - PADDING.right} y1={tick.y} y2={tick.y} stroke="var(--border)" strokeWidth={1} />
            <text x={PADDING.left - 8} y={tick.y} textAnchor="end" dominantBaseline="middle" className="fill-muted text-[10px]">
              {metric.format(tick.value)}
            </text>
          </g>
        ))}

        <path d={plot.areaPath} fill="var(--primary)" opacity={0.08} />
        <path d={plot.linePath} fill="none" stroke="var(--primary)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        <text x={firstPoint[0]} y={VIEW_HEIGHT - 8} textAnchor="start" className="fill-muted text-[10px]">
          {formatShortDate(firstRow.date)}
        </text>
        <text x={lastPoint[0]} y={VIEW_HEIGHT - 8} textAnchor="end" className="fill-muted text-[10px]">
          {formatShortDate(lastRow.date)}
        </text>

        <line x1={activePoint[0]} x2={activePoint[0]} y1={PADDING.top} y2={VIEW_HEIGHT - PADDING.bottom} stroke="var(--border)" strokeWidth={1} />
        <circle cx={activePoint[0]} cy={activePoint[1]} r={4} fill="var(--primary)" stroke="var(--surface)" strokeWidth={2} />
      </svg>

      <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
        <span className="text-xs text-muted">{formatFullDate(activeRow.date)}</span>
        <span className="text-sm font-semibold text-foreground">{metric.format(activeRow[metricKey])}</span>
      </div>
    </div>
  );
}

function ChartHeader({ metricKey, onChange }: { metricKey: MetricKey; onChange: (key: MetricKey) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {METRICS.map((m) => (
        <button
          key={m.key}
          type="button"
          onClick={() => onChange(m.key)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${metricKey === m.key ? "bg-primary text-primary-contrast" : "text-muted hover:bg-black/[0.03]"}`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

function computePlot(values: number[]) {
  const plotWidth = VIEW_WIDTH - PADDING.left - PADDING.right;
  const plotHeight = VIEW_HEIGHT - PADDING.top - PADDING.bottom;

  const max = Math.max(...values, 0);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const points: [number, number][] = values.map((value, index) => {
    const x = PADDING.left + (index / (values.length - 1)) * plotWidth;
    const y = PADDING.top + plotHeight - ((value - min) / range) * plotHeight;
    return [x, y];
  });

  const linePath = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const lastPoint = points[points.length - 1]!;
  const firstPoint = points[0]!;
  const areaPath = `${linePath} L${lastPoint[0].toFixed(1)},${PADDING.top + plotHeight} L${firstPoint[0].toFixed(1)},${PADDING.top + plotHeight} Z`;

  const tickCount = 4;
  const yTicks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const value = min + (range * i) / tickCount;
    const y = PADDING.top + plotHeight - (i / tickCount) * plotHeight;
    return { value, y };
  });

  return { points, linePath, areaPath, yTicks };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatShortDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

function formatFullDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
}
