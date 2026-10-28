import type { ReactNode } from "react";
import logoStacked from "@/assets/brand/logo-stacked.png";
import { Card } from "@/components/ui/Card";

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img src={logoStacked} alt="The Service Pilot" className="mx-auto mb-5 h-24 w-auto" />
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
        </div>
        <Card className="shadow-sm">{children}</Card>
        {footer ? <div className="mt-6 text-center text-sm text-muted">{footer}</div> : null}
      </div>
    </div>
  );
}
