import { useState } from "react";
import { businessService } from "@/api/businessService";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorText, SuccessText } from "@/components/ui/Feedback";
import { Field, TextInput } from "@/components/ui/Field";
import { useAuth } from "@/hooks/useAuth";
import { useBusiness } from "@/hooks/useBusiness";
import { useForm } from "@/hooks/useForm";

export function SettingsPage() {
  const { user, accounts } = useAuth();
  const { business, reload } = useBusiness();
  const [saved, setSaved] = useState(false);
  const { values, setValue, fieldErrors, formError, isSubmitting, handleSubmit } = useForm({
    name: business.name,
    website: business.website ?? "",
  });
  const account = accounts.find((item) => item.id === business.account) ?? accounts[0];

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaved(false);
    handleSubmit(async (v) => {
      await businessService.update(business.id, { name: v.name, website: v.website || undefined });
      setSaved(true);
      reload();
    });
  }

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Business settings"
        description="Name, website, and account details for this workspace. Billing and marketplace installs are not part of this phase."
      />

      <Card>
        <h2 className="text-sm font-semibold">Business profile</h2>
        <form onSubmit={onSubmit} className="mt-4 flex max-w-lg flex-col gap-4">
          <Field label="Business name" htmlFor="settings-name">
            <TextInput id="settings-name" required value={values.name} onChange={(e) => setValue("name", e.target.value)} />
            <ErrorText>{fieldErrors.name}</ErrorText>
          </Field>
          <Field label="Website" htmlFor="settings-website" hint="Optional">
            <TextInput id="settings-website" value={values.website} onChange={(e) => setValue("website", e.target.value)} placeholder="https://example.com" />
            <ErrorText>{fieldErrors.website}</ErrorText>
          </Field>
          <ErrorText>{formError}</ErrorText>
          {saved ? <SuccessText>Saved.</SuccessText> : null}
          <Button type="submit" loading={isSubmitting} disabled={!values.name.trim()}>
            Save changes
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold">Account</h2>
        <p className="mt-2 text-sm text-muted">{account?.name ?? "Your account"}</p>
        <p className="mt-1 text-sm text-muted">{user?.email}</p>
      </Card>
    </>
  );
}
