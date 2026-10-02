import { useEffect, useState } from "react";
import { analyticsService } from "@/api/analyticsService";
import type { AnalyticsConnectionStatus, AnalyticsOverview } from "@/types/analytics";
import type { RangeDays } from "@/types/searchConsole";

type LoadState = "idle" | "loading" | "loaded" | "error";

export function useAnalytics(businessId: number, range: RangeDays) {
  const [status, setStatus] = useState<AnalyticsConnectionStatus | null>(null);
  const [statusState, setStatusState] = useState<LoadState>("idle");
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [overviewState, setOverviewState] = useState<LoadState>("idle");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // oxlint-disable-next-line react/set-state-in-effect
    setStatusState("loading");

    analyticsService.getStatus(businessId).then(
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
  }, [businessId, reloadToken]);

  useEffect(() => {
    if (!status?.connected) return;
    let cancelled = false;
    // oxlint-disable-next-line react/set-state-in-effect
    setOverviewState("loading");

    analyticsService.getOverview(businessId, range).then(
      (result) => {
        if (cancelled) return;
        setOverview(result);
        setOverviewState("loaded");
      },
      () => {
        if (!cancelled) setOverviewState("error");
      },
    );

    return () => {
      cancelled = true;
    };
  }, [businessId, range, status?.connected, reloadToken]);

  async function connect() {
    await analyticsService.connect(businessId);
  }

  async function disconnect() {
    setIsDisconnecting(true);
    try {
      await analyticsService.disconnect(businessId);
      setOverview(null);
      setReloadToken((token) => token + 1);
    } finally {
      setIsDisconnecting(false);
    }
  }

  async function sync() {
    setIsSyncing(true);
    try {
      await analyticsService.sync(businessId);
      setTimeout(() => setReloadToken((token) => token + 1), 4000);
    } finally {
      setIsSyncing(false);
    }
  }

  return { status, statusState, overview, overviewState, isSyncing, isDisconnecting, connect, sync, disconnect };
}
