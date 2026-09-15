import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-contrast">S</div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
        </div>
        <Card className="shadow-sm">{children}</Card>
        <div className="mt-6 text-center text-sm text-muted">{footer}</div>
      </div>
    </div>
  );
}
