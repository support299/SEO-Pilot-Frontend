import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { agencyService, type AgencyClient } from "@/api/agencyService";
import { businessService } from "@/api/businessService";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorText, LoadingState } from "@/components/ui/Feedback";
import { Field, TextInput } from "@/components/ui/Field";
import { useForm } from "@/hooks/useForm";
import { useToast } from "@/hooks/useToast";

/** Agency admin home: every client, each with its own websites. Every website is a separate workspace. */
export function AgencyClients() {
  const [clients, setClients] = useState<AgencyClient[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const reload = useCallback(() => {
    agencyService.listClients().then(setClients, () => setLoadError("Couldn't load clients right now."));
  }, []);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    reload();
  }, [reload]);

  return (
    <div className="mt-6 flex flex-col gap-4">
      {loadError ? <ErrorText>{loadError}</ErrorText> : null}
      {clients === null && !loadError ? <LoadingState label="Loading clients…" /> : null}
      {clients?.length === 0 ? <EmptyState title="No clients yet" description="Add your first client below, then add each of their websites." /> : null}

      {clients?.map((client) => (
        <ClientCard key={client.id} client={client} onChanged={reload} />
      ))}

      <AddClientForm onCreated={reload} />
    </div>
  );
}

function ClientCard({ client, onChanged }: { client: AgencyClient; onChanged: () => void }) {
  const [adding, setAdding] = useState(false);
  const logins = client.members.map((member) => member.email);

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-foreground">{client.name}</h2>
          <p className="mt-0.5 text-xs text-muted">
            {client.businesses.length} {client.businesses.length === 1 ? "website" : "websites"}
            {logins.length > 0 ? ` · Login: ${logins.join(", ")}` : " · No client login"}
          </p>
        </div>
        {!adding ? (
          <Button variant="secondary" onClick={() => setAdding(true)}>
            + Add website
          </Button>
        ) : null}
      </div>

      <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
        {client.businesses.length === 0 ? <li className="px-4 py-3 text-sm text-muted">No websites yet.</li> : null}
        {client.businesses.map((business) => (
          <li key={business.id}>
            <Link to={`/businesses/${business.id}/overview`} className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-black/[0.02]">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{business.name}</p>
                <p className="truncate text-xs text-muted">{business.website || "No website added"}</p>
              </div>
              <span className="shrink-0 text-sm text-primary">Open workspace →</span>
            </Link>
          </li>
        ))}
      </ul>

      {adding ? (
        <AddWebsiteForm
          accountId={client.id}
          clientName={client.name}
          onDone={() => setAdding(false)}
          onAdded={() => {
            setAdding(false);
            onChanged();
          }}
        />
      ) : null}
    </Card>
  );
}

function AddWebsiteForm({ accountId, clientName, onAdded, onDone }: { accountId: number; clientName: string; onAdded: () => void; onDone: () => void }) {
  const toast = useToast();
  const { values, setValue, fieldErrors, formError, isSubmitting, handleSubmit } = useForm({ name: "", website: "" });

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    handleSubmit(async (v) => {
      const business = await businessService.create({ account: accountId, name: v.name.trim(), website: v.website.trim() || undefined });
      toast.show("success", `${business.name} added to ${clientName}.`);
      onAdded();
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-4 rounded-lg bg-background p-4">
      <p className="text-sm font-medium text-foreground">New website for {clientName}</p>
      <Field label="Name" htmlFor={`site-name-${accountId}`} hint="How you'll recognise this workspace, e.g. Acme HVAC">
        <TextInput id={`site-name-${accountId}`} required autoFocus value={values.name} onChange={(e) => setValue("name", e.target.value)} placeholder="Acme HVAC" />
        <ErrorText>{fieldErrors.name}</ErrorText>
      </Field>
      <Field label="Website address" htmlFor={`site-url-${accountId}`} hint="Needed for crawls and WordPress. You can add it later.">
        <TextInput id={`site-url-${accountId}`} value={values.website} onChange={(e) => setValue("website", e.target.value)} placeholder="acmehvac.com" />
        <ErrorText>{fieldErrors.website}</ErrorText>
      </Field>
      <ErrorText>{formError}</ErrorText>
      <div className="flex gap-3">
        <Button type="submit" loading={isSubmitting} loadingText="Adding…" disabled={!values.name.trim()}>
          Add website
        </Button>
        <Button type="button" variant="secondary" disabled={isSubmitting} onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function AddClientForm({ onCreated }: { onCreated: () => void }) {
  const toast = useToast();
  const { values, setValue, fieldErrors, formError, isSubmitting, handleSubmit } = useForm({ customer_name: "", website: "", email: "", password: "" });

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    handleSubmit(async (v) => {
      const result = await agencyService.createCustomer({
        customer_name: v.customer_name.trim(),
        website: v.website.trim() || undefined,
        email: v.email.trim() || undefined,
        password: v.password || undefined,
      });
      toast.show("success", result.login_email ? `${result.account.name} added. Client login: ${result.login_email} (view only).` : `${result.account.name} added.`);
      setValue("customer_name", "");
      setValue("website", "");
      setValue("email", "");
      setValue("password", "");
      onCreated();
    });
  }

  return (
    <Card>
      <h2 className="text-sm font-semibold text-foreground">Add a client</h2>
      <p className="mt-1 text-sm text-muted">Creates the client with a first website workspace. Add more websites to it afterwards, each with its own separate workspace.</p>
      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-4">
        <Field label="Client name" htmlFor="client_name">
          <TextInput id="client_name" required value={values.customer_name} onChange={(e) => setValue("customer_name", e.target.value)} placeholder="Acme Group" />
          <ErrorText>{fieldErrors.customer_name}</ErrorText>
        </Field>
        <Field label="First website" htmlFor="client_website" hint="Optional. Needed for crawls and WordPress.">
          <TextInput id="client_website" value={values.website} onChange={(e) => setValue("website", e.target.value)} placeholder="acmegroup.com" />
          <ErrorText>{fieldErrors.website}</ErrorText>
        </Field>
        <Field label="Client login email" htmlFor="client_email" hint="Optional. Gives the client view-only access to all of their websites.">
          <TextInput id="client_email" type="email" value={values.email} onChange={(e) => setValue("email", e.target.value)} placeholder="owner@acmegroup.com" />
          <ErrorText>{fieldErrors.email}</ErrorText>
        </Field>
        {values.email ? (
          <Field label="Starting password" htmlFor="client_password" hint="Share it with the client; they can't change it yet">
            <TextInput id="client_password" type="password" autoComplete="new-password" value={values.password} onChange={(e) => setValue("password", e.target.value)} />
            <ErrorText>{fieldErrors.password}</ErrorText>
          </Field>
        ) : null}
        <ErrorText>{formError}</ErrorText>
        <Button type="submit" loading={isSubmitting} loadingText="Adding…" disabled={!values.customer_name.trim()} className="w-full">
          Add client
        </Button>
      </form>
    </Card>
  );
}
