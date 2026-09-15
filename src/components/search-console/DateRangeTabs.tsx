import { RANGE_OPTIONS, type RangeDays } from "@/types/searchConsole";

export function DateRangeTabs({ active, onChange }: { active: RangeDays; onChange: (days: RangeDays) => void }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
      {RANGE_OPTIONS.map((days) => (
        <button
          key={days}
          type="button"
          onClick={() => onChange(days)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${days === active ? "bg-primary text-primary-contrast" : "text-muted hover:bg-black/[0.03]"}`}
        >
          {days} days
        </button>
      ))}
    </div>
  );
}
