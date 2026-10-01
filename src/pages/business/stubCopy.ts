import type { StubCopy } from "./StubPage";

export const stubCopy = {
  localVisibility: {
    eyebrow: "Local",
    title: "Local Visibility",
    description: "Map pack and local presence will live here once Google Business Profile measurement exists.",
    emptyTitle: "Local visibility is not connected",
    emptyDescription: "No local listing or geo data is connected for {business} yet.",
  },
  opportunities: {
    eyebrow: "Opportunities",
    title: "Opportunities",
    description: "Ranked work items will show here after analysis exists for this site.",
    emptyTitle: "No opportunities yet",
    emptyDescription: "There is no opportunity list for {business}. This is not sample data.",
  },
  manager: {
    eyebrow: "SEO Manager",
    title: "SEO Manager",
    description: "The AI operator workspace is not enabled in this phase.",
    emptyTitle: "SEO Manager is not active",
    emptyDescription: "There is no sprint, agent, or weekly plan running for {business}.",
  },
  approvals: {
    eyebrow: "Approvals",
    title: "Approvals",
    description: "Major decisions that need an owner will land here.",
    emptyTitle: "No decisions needed",
    emptyDescription: "There are no pending approvals for {business}.",
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
  history: {
    eyebrow: "History & Proof",
    title: "History",
    description: "A ledger of decisions and outcomes will appear after work has actually happened.",
    emptyTitle: "No history yet",
    emptyDescription: "Nothing has been recorded for {business} yet.",
  },
} satisfies Record<string, StubCopy>;
