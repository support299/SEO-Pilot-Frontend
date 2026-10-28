import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorText } from "@/components/ui/Feedback";
import { Field, TextInput } from "@/components/ui/Field";
import { InventoryPicker } from "@/components/wordpress/InventoryPicker";
import { useForm } from "@/hooks/useForm";
import type { ProposedChanges, WordPressInventoryItem, WordPressObjectType } from "@/types/wordpress";

export function ProposeChangeForm({
  getInventory,
  onPropose,
}: {
  getInventory: (objectType: WordPressObjectType) => Promise<WordPressInventoryItem[]>;
  onPropose: (input: { target_object_type: WordPressObjectType; target_object_id: number; proposed_changes: ProposedChanges; reason: string }) => Promise<void>;
}) {
  const [objectType, setObjectType] = useState<WordPressObjectType>("page");
  const [inventory, setInventory] = useState<WordPressInventoryItem[] | null>(null);
  const [inventoryError, setInventoryError] = useState<string | null>(null);

  const { values, setValue, formError, isSubmitting, handleSubmit } = useForm({
    target_object_id: "",
    title: "",
    meta_description: "",
    reason: "",
  });

  useEffect(() => {
    let cancelled = false;
    // oxlint-disable-next-line react/set-state-in-effect
    setInventory(null);
    setInventoryError(null);

    getInventory(objectType).then(
      (items) => {
        if (!cancelled) setInventory(items);
      },
      () => {
        if (!cancelled) setInventoryError("Couldn't load pages from WordPress right now.");
      },
    );

    return () => {
      cancelled = true;
    };
  }, [objectType, getInventory]);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    handleSubmit(async (v) => {
      const proposed_changes: ProposedChanges = {};
      if (v.title.trim()) proposed_changes.title = v.title.trim();
      if (v.meta_description.trim()) proposed_changes.meta_description = v.meta_description.trim();

      await onPropose({
        target_object_type: objectType,
        target_object_id: Number(v.target_object_id),
        proposed_changes,
        reason: v.reason,
      });

      setValue("target_object_id", "");
      setValue("title", "");
      setValue("meta_description", "");
      setValue("reason", "");
    });
  }

  const canSubmit = Boolean(values.target_object_id) && (values.title.trim() || values.meta_description.trim());

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex gap-2">
        {(["page", "post"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              setObjectType(type);
              setValue("target_object_id", "");
            }}
            className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition ${objectType === type ? "bg-primary text-primary-contrast" : "border border-border text-muted hover:bg-black/[0.03]"}`}
          >
            {type}s
          </button>
        ))}
      </div>

      {inventoryError ? <ErrorText>{inventoryError}</ErrorText> : null}

      <Field label={`Which ${objectType}?`} htmlFor="wp-target">
        <InventoryPicker
          id="wp-target"
          items={inventory}
          value={values.target_object_id}
          onChange={(id) => setValue("target_object_id", id)}
          placeholder={`Search ${objectType}s by title or URL…`}
        />
      </Field>

      <Field label="New title" htmlFor="wp-title" hint="Leave blank to only change the meta description">
        <TextInput id="wp-title" value={values.title} onChange={(e) => setValue("title", e.target.value)} placeholder="Proposed page title" />
      </Field>

      <Field label="New meta description" htmlFor="wp-meta" hint="Leave blank to only change the title">
        <TextInput id="wp-meta" value={values.meta_description} onChange={(e) => setValue("meta_description", e.target.value)} placeholder="Proposed meta description" />
      </Field>

      <Field label="Reason" htmlFor="wp-reason" hint="Shown to whoever approves this">
        <TextInput id="wp-reason" value={values.reason} onChange={(e) => setValue("reason", e.target.value)} placeholder="e.g. Missing title flagged by the crawl" />
      </Field>

      <ErrorText>{formError}</ErrorText>
      <Button type="submit" loading={isSubmitting} disabled={!canSubmit} className="w-full">
        Propose change
      </Button>
    </form>
  );
}
