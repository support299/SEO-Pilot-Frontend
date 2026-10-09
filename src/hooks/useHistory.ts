import { useEffect, useState } from "react";
import { historyService } from "@/api/historyService";
import type { HistoryEvent, ScorePoint } from "@/types/history";

type LoadState = "idle" | "loading" | "loaded" | "error";

export function useHistory(businessId: number) {
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [scoreTrend, setScoreTrend] = useState<ScorePoint[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loadState, setLoadState] = useState<LoadState>("idle");

  useEffect(() => {
    let cancelled = false;
    // oxlint-disable-next-line react/set-state-in-effect
    setLoadState("loading");
    historyService.getPage(businessId, page).then(
      (result) => {
        if (cancelled) return;
        setEvents((current) => (page === 1 ? result.results : [...current, ...result.results]));
        setScoreTrend(result.score_trend);
        setHasMore(result.next !== null);
        setLoadState("loaded");
      },
      () => {
        if (!cancelled) setLoadState("error");
      },
    );
    return () => {
      cancelled = true;
    };
  }, [businessId, page]);

  function loadMore() {
    setPage((current) => current + 1);
  }

  return { events, scoreTrend, hasMore, loadState, loadMore };
}
