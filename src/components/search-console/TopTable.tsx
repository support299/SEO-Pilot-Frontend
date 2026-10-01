import { ColumnHint } from "@/components/ui/ColumnHint";

type Row = { label: string; clicks: number; impressions: number; ctr: number; position: number };

export function TopTable({ title, rows, labelHeader, error }: { title: string; rows: Row[]; labelHeader: string; error?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>

      {error ? (
        <p className="mt-4 text-sm text-muted">Couldn&apos;t load this right now — {error}</p>
      ) : rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No data yet.</p>
      ) : (
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted">
              <th className="pb-2 font-medium">{labelHeader}</th>
              <th className="pb-2 pl-3 pr-1 text-right font-medium">Clicks</th>
              <th className="pb-2 pl-3 pr-1 text-right font-medium">
                <ColumnHint label="Impressions" hint="How many times this result showed up in Google search." />
              </th>
              <th className="pb-2 pl-3 pr-1 text-right font-medium">CTR</th>
              <th className="pb-2 pl-3 text-right font-medium">
                <ColumnHint label="Position" hint="Average place in Google results. 1 is the top result. A higher number means it usually appeared further down." />
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-border/60 last:border-0">
                <td className="max-w-0 truncate py-2 pr-2 text-foreground" title={row.label}>
                  {row.label}
                </td>
                <td className="py-2 pl-3 pr-1 text-right tabular-nums text-foreground">{row.clicks.toLocaleString("en-US")}</td>
                <td className="py-2 pl-3 pr-1 text-right tabular-nums text-muted">{row.impressions.toLocaleString("en-US")}</td>
                <td className="py-2 pl-3 pr-1 text-right tabular-nums text-muted">{(row.ctr * 100).toFixed(1)}%</td>
                <td className="py-2 pl-3 text-right tabular-nums text-muted">{row.position.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
