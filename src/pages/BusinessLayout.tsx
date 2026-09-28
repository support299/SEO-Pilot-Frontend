import { useEffect, useState } from "react";
import { Link, Outlet, useParams } from "react-router-dom";
import { businessService } from "@/api/businessService";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorText, LoadingState } from "@/components/ui/Feedback";
import { BusinessContext } from "@/contexts/business-context";
import type { Business } from "@/types/business";

export function BusinessLayout() {
  const { id } = useParams<{ id: string }>();
  const businessId = Number(id);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const idIsValid = Number.isFinite(businessId) && businessId > 0;

  useEffect(() => {
    if (!idIsValid) return;
    let cancelled = false;

    businessService.get(businessId).then(
      (data) => {
        if (!cancelled) setBusiness(data);
      },
      () => {
        if (!cancelled) setLoadError("Couldn't load this business.");
      },
    );

    return () => {
      cancelled = true;
    };
  }, [businessId, idIsValid, reloadToken]);

  if (!idIsValid || loadError) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <Link to="/" className="text-sm text-muted hover:text-foreground">
          ← All businesses
        </Link>
        <div className="mt-6">
          <ErrorText>{loadError ?? "Couldn't load this business."}</ErrorText>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState label="Loading business…" />
      </div>
    );
  }

  return (
    <BusinessContext.Provider value={{ business, reload: () => setReloadToken((token) => token + 1) }}>
      <AppShell business={business}>
        <Outlet />
      </AppShell>
    </BusinessContext.Provider>
  );
}
