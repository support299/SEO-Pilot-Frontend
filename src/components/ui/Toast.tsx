import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { ToastContext, type ToastKind } from "@/contexts/toast-context";

type Toast = { id: number; kind: ToastKind; message: string };

const DISMISS_AFTER_MS = 5000;
const KIND_STYLES: Record<ToastKind, string> = {
  success: "border-success/30 text-success",
  error: "border-danger/30 text-danger",
  info: "border-border text-foreground",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((current) => current.filter((t) => t.id !== id)), []);

  const show = useCallback(
    (kind: ToastKind, message: string) => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, kind, message }]);
      setTimeout(() => dismiss(id), DISMISS_AFTER_MS);
    },
    [dismiss],
  );

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`pointer-events-auto flex items-start justify-between gap-3 rounded-lg border bg-surface px-4 py-3 text-sm shadow-lg ${KIND_STYLES[toast.kind]}`}>
            <span>{toast.message}</span>
            <button type="button" onClick={() => dismiss(toast.id)} className="text-muted hover:text-foreground" aria-label="Dismiss">
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
