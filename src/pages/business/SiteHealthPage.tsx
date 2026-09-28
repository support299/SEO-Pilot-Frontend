import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/Feedback";
import { useBusiness } from "@/hooks/useBusiness";

export function SiteHealthPage() {
  const { business } = useBusiness();

  return (
    <>
      <PageHeader
        eyebrow="Technical SEO"
        title="Site health"
        description="Technical findings will be translated into customer impact here. Nothing is shown until a crawl exists for this business."
      />
      <EmptyState
        title="No site health data yet"
        description={`A site crawl is not connected for ${business.name}. This page stays empty instead of showing sample issues.`}
      />
    </>
  );
}
