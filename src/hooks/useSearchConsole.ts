import { useEffect, useState } from "react";
import { searchConsoleService } from "@/api/searchConsoleService";
import type { ConnectionStatus, Overview, RangeDays, TopPage, TopQuery } from "@/types/searchConsole";

type LoadState = "idle" | "loading" | "loaded" | "error";

/**
 * Owns all Search Console data + loading/error state for one business, so
 * the page component that renders it stays presentation-only. Re-fetches
 * the overview (and only the overview — top queries/pages are a snapshot,
 * not range-scoped) whenever `range` changes.
 */
export function useSearchConsole(businessId: number) {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [statusState, setStatusState] = useState<LoadState>("idle");

  const [range, setRange] = useState<RangeDays>(28);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [overviewState, setOverviewState] = useState<LoadState>("idle");

  const [topQueries, setTopQueries] = useState<TopQuery[] | null>(null);
  const [topPages, setTopPages] = useState<TopPage[] | null>(null);

  const [isSyncing, setIsSyncing] = useState(false);
  // Bumping this re-runs the "load status" effect — used to force a refresh
  // after a background sync completes, without calling setState synchronously
  // at the top of an effect body.
  const [statusReloadToken, setStatusReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // Setting the loading flag synchronously before kicking off the fetch is
    // the standard data-fetching-in-an-effect pattern (see react.dev's own
    // example) — the state update below in .then() is what the linter's
    // "derive during render" suggestion doesn't cover for async fetches.
    // oxlint-disable-next-line react/set-state-in-effect
    setStatusState("loading");

    searchConsoleService.getStatus(businessId).then(
      (result) => {
        if (cancelled) return;
        setStatus(result);
        setStatusState("loaded");
      },
      () => {
        if (!cancelled) setStatusState("error");
      },
    );

    return () => {
      cancelled = true;
    };
  }, [businessId, statusReloadToken]);

  useEffect(() => {
    if (!status?.connected) return;
    let cancelled = false;
    // oxlint-disable-next-line react/set-state-in-effect
    setOverviewState("loading");

    Promise.all([searchConsoleService.getOverview(businessId, range), searchConsoleService.getTopQueries(businessId), searchConsoleService.getTopPages(businessId)]).then(
      ([overviewResult, queriesResult, pagesResult]) => {
        if (cancelled) return;
        setOverview(overviewResult);
        setTopQueries(queriesResult);
        setTopPages(pagesResult);
        setOverviewState("loaded");
      },
      () => {
        if (!cancelled) setOverviewState("error");
      },
    );

    return () => {
      cancelled = true;
    };
  }, [businessId, range, status?.connected, statusReloadToken]);

  async function connect() {
    await searchConsoleService.connect(businessId); // navigates the browser away — nothing to await here in practice
  }

  async function sync() {
    setIsSyncing(true);
    try {
      await searchConsoleService.sync(businessId);
      // The sync runs in the background (Celery) — refresh once after a beat
      // so a fast sync's result shows up without a manual page reload.
      setTimeout(() => setStatusReloadToken((token) => token + 1), 4000);
    } finally {
      setIsSyncing(false);
    }
  }

  return {
    status,
    statusState,
    range,
    setRange,
    overview,
    overviewState,
    topQueries,
    topPages,
    isSyncing,
    connect,
    sync,
  };
}
