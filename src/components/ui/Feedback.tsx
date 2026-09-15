import type { ReactNode } from "react";

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <p className="rounded-lg bg-danger/8 px-3 py-2 text-sm text-danger">{children}</p>;
}

export function SuccessText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <p className="rounded-lg bg-success/8 px-3 py-2 text-sm text-success">{children}</p>;
}

/** For a section that has nothing to show yet — never invent numbers instead of using this. */
export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-8 text-center">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted">
      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-border border-t-primary" aria-hidden="true" />
      {label}
    </div>
  );
}
