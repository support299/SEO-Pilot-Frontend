/**
 * Google refuses to show its sign-in page inside an iframe (the "403 … you do not have access" screen),
 * which is what happens when SEO Pilot is opened from a GoHighLevel menu link. In that case the login runs
 * in a popup window and the app waits for the new connection to appear.
 */
export function isEmbedded(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true; // reading window.top threw: we're in a cross-origin frame
  }
}

/** Opens `url` in a popup; false if the browser blocked it. */
export function openGooglePopup(url: string): boolean {
  const width = 520;
  const height = 720;
  const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
  const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);
  const popup = window.open(url, "seopilot-google", `width=${width},height=${height},left=${left},top=${top}`);
  return popup !== null;
}

/** Polls `isDone` every 2 seconds until it returns true or `timeoutMs` passes. Resolves whether it finished. */
export async function pollUntil(isDone: () => Promise<boolean>, timeoutMs = 180_000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    try {
      if (await isDone()) return true;
    } catch {
      // a failed poll isn't a failed connection; keep waiting
    }
  }
  return false;
}
