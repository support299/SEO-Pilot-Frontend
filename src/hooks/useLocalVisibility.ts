import { useCallback, useEffect, useState } from "react";
import { localVisibilityService } from "@/api/localVisibilityService";
import type { KeywordDetail, LocalVisibilityOverview, ProfileInput } from "@/types/localVisibility";

type LoadState = "idle" | "loading" | "loaded" | "error";

function messageOf(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function useLocalVisibility(businessId: number) {
  const [overview, setOverview] = useState<LocalVisibilityOverview | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<KeywordDetail | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    let cancelled = false;
    localVisibilityService.getOverview(businessId).then(
      (result) => {
        if (cancelled) return;
        setOverview(result);
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

  // Default to the first keyword; drop the selection if that keyword was removed.
  const keywordIds = overview?.keywords.map((keyword) => keyword.id) ?? [];
  const effectiveSelectedId = selectedId !== null && keywordIds.includes(selectedId) ? selectedId : (keywordIds[0] ?? null);

  const anyScanning = overview?.keywords.some((keyword) => keyword.scanning) ?? false;

  useEffect(() => {
    if (effectiveSelectedId === null) return;
    let cancelled = false;
    localVisibilityService.getKeyword(businessId, effectiveSelectedId).then(
      (result) => {
        if (!cancelled) setDetail(result);
      },
      () => {
        if (!cancelled) setDetail(null);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [businessId, effectiveSelectedId, reloadToken]);

  useEffect(() => {
    if (!anyScanning) return;
    const timer = window.setTimeout(reload, 3000);
    return () => window.clearTimeout(timer);
  }, [anyScanning, reloadToken, reload]);

  async function run(action: () => Promise<unknown>, fallback: string) {
    setBusy(true);
    setActionError(null);
    try {
      await action();
      reload();
      return true;
    } catch (error) {
      setActionError(messageOf(error, fallback));
      return false;
    } finally {
      setBusy(false);
    }
  }

  return {
    overview,
    loadState,
    detail: detail && detail.keyword.id === effectiveSelectedId ? detail : null,
    selectedId: effectiveSelectedId,
    select: setSelectedId,
    anyScanning,
    busy,
    actionError,
    saveProfile: (input: ProfileInput) => run(() => localVisibilityService.saveProfile(businessId, input), "Couldn't save the location."),
    addKeyword: (keyword: string) => run(() => localVisibilityService.addKeyword(businessId, keyword), "Couldn't add the keyword."),
    removeKeyword: (keywordId: number) => run(() => localVisibilityService.removeKeyword(businessId, keywordId), "Couldn't remove the keyword."),
    startScan: (keywordId: number) => run(() => localVisibilityService.startScan(businessId, keywordId), "Couldn't start the scan."),
  };
}
