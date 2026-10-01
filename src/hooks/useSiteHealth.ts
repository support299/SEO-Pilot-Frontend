import { useEffect, useState } from "react";
import { siteHealthService } from "@/api/siteHealthService";
import type { SiteHealthReport } from "@/types/siteHealth";

type LoadState = "idle" | "loading" | "loaded" | "error";

export function useSiteHealth(businessId: number) {
  const [report, setReport] = useState<SiteHealthReport | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // oxlint-disable-next-line react/set-state-in-effect
    setLoadState("loading");
    siteHealthService.getReport(businessId).then(
      (result) => {
        if (cancelled) return;
        setReport(result);
        setLoadState("loaded");
      },
      () => {
        if (!cancelled) setLoadState("error");
      },
    );
    return () => {
      cancelled = true;
    };
  }, [businessId, reloadToken]);

  useEffect(() => {
    if (report?.status !== "queued" && report?.status !== "running") return;
    const timer = window.setTimeout(() => setReloadToken((token) => token + 1), 3000);
    return () => window.clearTimeout(timer);
  }, [report?.status, report?.finished_at, reloadToken]);

  async function startCrawl() {
    setIsStarting(true);
    setStartError(null);
    try {
      await siteHealthService.startCrawl(businessId);
      setReloadToken((token) => token + 1);
    } catch {
      setStartError("Couldn't start the crawl. Check that Redis and the Celery worker are running.");
    } finally {
      setIsStarting(false);
    }
  }

  return { report, loadState, isStarting, startError, startCrawl };
}
