import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { businessService } from "@/api/businessService";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ErrorText, SuccessText } from "@/components/ui/Feedback";
import { Field, TextInput } from "@/components/ui/Field";
import { useAuth } from "@/hooks/useAuth";
import { useBusiness } from "@/hooks/useBusiness";
import { useForm } from "@/hooks/useForm";
import { useToast } from "@/hooks/useToast";

export function SettingsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, accounts } = useAuth();
  const { business, reload } = useBusiness();
  const [saved, setSaved] = useState(false);
  const [togglingPause, setTogglingPause] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  async function handleTogglePause() {
    setTogglingPause(true);
    try {
      const nextPaused = !business.is_paused;
      await businessService.update(business.id, { is_paused: nextPaused });
      toast.show("success", nextPaused ? `"${business.name}" has been paused.` : `"${business.name}" has been resumed.`);
      reload();
    } catch {
      toast.show("error", "Failed to update workspace status.");
    } finally {
      setTogglingPause(false);
    }
  }

  async function handleDeleteWorkspace() {
    setIsDeleting(true);
    try {
      await businessService.remove(business.id);
      toast.show("success", `Workspace "${business.name}" deleted.`);
      navigate("/");
    } catch {
      toast.show("error", "Failed to delete workspace.");
      setIsDeleting(false);
    }
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
        {!business.can_edit ? (
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="inline font-medium text-foreground">Business: </dt>
              <dd className="inline text-muted">{business.name}</dd>
            </div>
            <div>
              <dt className="inline font-medium text-foreground">Website: </dt>
              <dd className="inline text-muted">{business.website || "Not added"}</dd>
            </div>
            <p className="pt-1 text-muted">Ask your SEO team if anything here needs to change.</p>
          </dl>
        ) : (
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
        )}
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold">Workspace status</h2>
            <p className="mt-1 text-xs text-muted">
              {business.effective_paused
                ? business.is_account_paused
                  ? `Paused because the client account "${business.account_name}" is paused. Automated syncs and scans are on hold.`
                  : "Paused. Automated weekly visibility scans and Search Console syncs are on hold."
                : "Active. Automated weekly visibility scans and Search Console syncs run normally."}
            </p>
          </div>
          {business.can_edit ? (
            <Button
              type="button"
              variant="secondary"
              loading={togglingPause}
              disabled={togglingPause || Boolean(business.is_account_paused && !business.is_paused)}
              onClick={handleTogglePause}
              className={business.is_paused ? "text-amber-800 hover:bg-amber-50" : ""}
            >
              {business.is_paused ? "Resume workspace" : "Pause workspace"}
            </Button>
          ) : null}
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold">Account</h2>
        <p className="mt-2 text-sm text-muted">{account?.name ?? "Your account"}</p>
        <p className="mt-1 text-sm text-muted">{user?.email}</p>
      </Card>

      {business.can_edit ? (
        <Card className="border-danger/30">
          <h2 className="text-sm font-semibold text-danger">Danger zone</h2>
          <p className="mt-1 text-xs text-muted">
            Permanently delete this workspace along with all crawl audits, rank tracking data, and connections. This action cannot be undone.
          </p>
          <div className="mt-4">
            <Button
              type="button"
              variant="danger"
              onClick={() => setConfirmDelete(true)}
            >
              Delete workspace
            </Button>
          </div>
        </Card>
      ) : null}

      <ConfirmModal
        isOpen={confirmDelete}
        title={`Delete workspace "${business.name}"?`}
        description={
          <>
            Are you sure you want to delete <strong>{business.name}</strong>? This will permanently delete all SEO crawl
            data, audit history, rank tracking, and connected services for this workspace. This action cannot be undone.
          </>
        }
        confirmLabel="Delete workspace"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteWorkspace}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
