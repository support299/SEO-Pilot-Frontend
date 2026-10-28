import type { StubCopy } from "./StubPage";

export const stubCopy = {
  localVisibility: {
    eyebrow: "Local",
    title: "Local Visibility",
    description: "Map pack and local presence will live here once Google Business Profile measurement exists.",
    emptyTitle: "Local visibility is not connected",
    emptyDescription: "No local listing or geo data is connected for {business} yet.",
  },
  authority: {
    eyebrow: "Authority & Competition",
    title: "Authority",
    description: "Competitor and citation views stay empty until those sources are connected.",
    emptyTitle: "Authority data is not connected",
    emptyDescription: "No competitor or listing authority signals are available for {business}.",
  },
} satisfies Record<string, StubCopy>;
