/** A quiet, axis-free trend line for a stat tile. Not interactive — the full TrendChart covers hover/detail. */
export function Sparkline({ values, width = 96, height = 28 }: { values: number[]; width?: number; height?: number }) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);

  const points = values.map((value, index) => {
    const x = index * stepX;
    const y = height - ((value - min) / range) * height;
    return [x, y] as const;
  });

  const path = points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const last = points[points.length - 1]!;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible" aria-hidden="true">
      <path d={path} fill="none" stroke="var(--primary)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" opacity={0.55} />
      <circle cx={last[0]} cy={last[1]} r={3} fill="var(--primary)" stroke="var(--surface)" strokeWidth={1.5} />
    </svg>
  );
}
