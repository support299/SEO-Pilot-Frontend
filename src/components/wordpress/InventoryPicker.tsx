import { useEffect, useMemo, useRef, useState } from "react";
import type { WordPressInventoryItem } from "@/types/wordpress";

const STATUS_STYLES: Record<string, string> = {
  publish: "bg-green-50 text-green-700",
  draft: "bg-amber-50 text-amber-700",
  private: "bg-slate-100 text-slate-600",
};

function displayUrl(url: string | null, slug: string) {
  if (!url) return `/${slug}`;
  try {
    const u = new URL(url);
    return `${u.host}${u.pathname}`.replace(/\/$/, "");
  } catch {
    return url;
  }
}

export function InventoryPicker({
  id,
  items,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  items: WordPressInventoryItem[] | null;
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = items?.find((i) => String(i.id) === value) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!items) return [];
    if (!q) return items;
    return items.filter((i) => `${i.title} ${i.slug} ${i.url ?? ""} ${i.status}`.toLowerCase().includes(q));
  }, [items, query]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function choose(item: WordPressInventoryItem) {
    onChange(String(item.id));
    setQuery("");
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && open) {
      e.preventDefault();
      if (filtered[active]) choose(filtered[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        autoComplete="off"
        value={open ? query : selected ? selected.title || "(untitled)" : ""}
        placeholder={items === null ? "Loading…" : placeholder}
        disabled={items === null}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
        className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted/70 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
      {selected && !open ? <p className="mt-1 truncate text-xs text-muted">{displayUrl(selected.url, selected.slug)}</p> : null}

      {open ? (
        <ul
          id={`${id}-list`}
          ref={listRef}
          role="listbox"
          className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-border bg-surface py-1 shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-3.5 py-3 text-sm text-muted">No matches</li>
          ) : (
            filtered.map((item, idx) => (
              <li
                key={item.id}
                role="option"
                aria-selected={String(item.id) === value}
                onMouseEnter={() => setActive(idx)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(item);
                }}
                className={`flex cursor-pointer items-start justify-between gap-3 px-3.5 py-2 ${idx === active ? "bg-black/[0.04]" : ""}`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{item.title || "(untitled)"}</p>
                  <p className="truncate text-xs text-muted">{displayUrl(item.url, item.slug)}</p>
                </div>
                <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${STATUS_STYLES[item.status] ?? "bg-slate-100 text-slate-600"}`}>
                  {item.status}
                </span>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
