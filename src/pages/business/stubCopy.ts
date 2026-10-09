import type { StubCopy } from "./StubPage";

export const stubCopy = {
  localVisibility: {
    eyebrow: "Local",
    title: "Local Visibility",
    description: "Map pack and local presence will live here once Google Business Profile measurement exists.",
    emptyTitle: "Local visibility is not connected",
    emptyDescription: "No local listing or geo data is connected for {business} yet.",
  },
  manager: {
    eyebrow: "SEO Manager",
    title: "SEO Manager",
    description: "The AI operator workspace is not enabled in this phase.",
    emptyTitle: "SEO Manager is not active",
    emptyDescription: "There is no sprint, agent, or weekly plan running for {business}.",
  },
  authority: {
    eyebrow: "Authority & Competition",
    title: "Authority",
    description: "Competitor and citation views stay empty until those sources are connected.",
    emptyTitle: "Authority data is not connected",
    emptyDescription: "No competitor or listing authority signals are available for {business}.",
  },
  work: {
    eyebrow: "Execution",
    title: "Execution",
    description: "Verified work and content changes will list here once execution exists.",
    emptyTitle: "No work in progress",
    emptyDescription: "There is no execution queue for {business} in this phase.",
  },
} satisfies Record<string, StubCopy>;
