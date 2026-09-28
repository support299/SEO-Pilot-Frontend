import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { businessService } from "@/api/businessService";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorText, LoadingState } from "@/components/ui/Feedback";
import { Field, TextInput } from "@/components/ui/Field";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "@/hooks/useForm";
import type { Business } from "@/types/business";

export function DashboardPage() {
  const { user, accounts, logout } = useAuth();
  const [businesses, setBusinesses] = useState<Business[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Bumping this re-runs the fetch effect below — used to reload the list
  // after creating a business, without giving the effect a named function
  // dependency that changes identity every render.
  const [reloadToken, setReloadToken] = useState(0);

  const account = accounts[0]; // Foundation phase: one account per user. Multi-account switching is a later increment.

  useEffect(() => {
    let cancelled = false;

    businessService.list().then(
      (data) => {
        if (!cancelled) setBusinesses(data);
      },
      () => {
        if (!cancelled) setLoadError("Couldn't load your businesses right now.");
      },
    );

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  function reloadBusinesses() {
    setReloadToken((token) => token + 1);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-contrast">S</div>
            <span className="text-sm font-medium text-foreground">{account?.name ?? "Your account"}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted sm:inline">{user?.email}</span>
            <button type="button" onClick={() => logout()} className="text-sm font-medium text-muted transition hover:text-foreground">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-foreground">Your businesses</h1>

        <div className="mt-6 flex flex-col gap-4">
          {loadError ? <ErrorText>{loadError}</ErrorText> : null}

          {businesses === null && !loadError ? <LoadingState label="Loading your businesses…" /> : null}

          {businesses !== null && businesses.length === 0 ? (
            <EmptyState title="No businesses yet" description="Add the business you're managing SEO for to get started." />
          ) : null}

          {businesses?.map((business) => (
            <Link key={business.id} to={`/businesses/${business.id}/overview`}>
              <Card className="flex items-center justify-between transition hover:border-primary/40">
                <div>
                  <p className="text-sm font-medium text-foreground">{business.name}</p>
                  <p className="text-sm text-muted">{business.website || "No website added"}</p>
                </div>
                <span className="text-sm text-muted">Open workspace →</span>
              </Card>
            </Link>
          ))}

          {account ? <AddBusinessForm accountId={account.id} onCreated={reloadBusinesses} /> : null}
        </div>
      </main>
    </div>
  );
}

function AddBusinessForm({ accountId, onCreated }: { accountId: number; onCreated: () => void }) {
  const { values, setValue, fieldErrors, formError, isSubmitting, handleSubmit } = useForm({ name: "", website: "" });

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    handleSubmit(async (v) => {
      await businessService.create({ account: accountId, name: v.name, website: v.website || undefined });
      setValue("name", "");
      setValue("website", "");
      onCreated();
    });
  }

  return (
    <Card>
      <h2 className="text-sm font-semibold text-foreground">Add a business</h2>
      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-4">
        <Field label="Business name" htmlFor="name">
          <TextInput id="name" required value={values.name} onChange={(e) => setValue("name", e.target.value)} placeholder="Acme Plumbing" />
          <ErrorText>{fieldErrors.name}</ErrorText>
        </Field>
        <Field label="Website" htmlFor="website" hint="Optional — you can add this later">
          <TextInput id="website" value={values.website} onChange={(e) => setValue("website", e.target.value)} placeholder="https://acmeplumbing.com" />
          <ErrorText>{fieldErrors.website}</ErrorText>
        </Field>
        <ErrorText>{formError}</ErrorText>
        <Button type="submit" loading={isSubmitting} disabled={!values.name.trim()} className="w-full">
          Add business
        </Button>
      </form>
    </Card>
  );
}
