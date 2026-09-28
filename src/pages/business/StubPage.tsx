import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/Feedback";
import { useBusiness } from "@/hooks/useBusiness";

export type StubCopy = {
  eyebrow: string;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
};

export function StubPage({ copy }: { copy: StubCopy }) {
  const { business } = useBusiness();

  return (
    <>
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
      <EmptyState title={copy.emptyTitle} description={copy.emptyDescription.replace("{business}", business.name)} />
    </>
  );
}
