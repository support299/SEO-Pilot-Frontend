import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

export function Button({
  variant = "primary",
  className = "",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60";
  const styles: Record<Variant, string> = {
    primary: "bg-primary text-primary-contrast hover:bg-primary-hover",
    secondary: "border border-border bg-surface text-foreground hover:bg-black/[0.02]",
    danger: "bg-danger text-white hover:opacity-90",
  };

  return (
    <button {...props} disabled={disabled || loading} className={`${base} ${styles[variant]} ${className}`}>
      {loading ? "Please wait…" : children}
    </button>
  );
}
