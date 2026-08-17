// PWA glue: registers the service worker (offline shell) and captures the
// install prompt so the "Install App" button can trigger it.

let deferredPrompt: (Event & { prompt: () => void; userChoice: Promise<{ outcome: string }> }) | null = null;

export function initPwa(): void {
  if (typeof window === "undefined") return;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as typeof deferredPrompt;
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* registration is best-effort */
      });
    });
  }
}

export function canInstall(): boolean {
  return deferredPrompt !== null;
}

// Returns true if the app was installed, false if unavailable or dismissed.
export async function installApp(): Promise<boolean> {
  if (!deferredPrompt) return false;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return outcome === "accepted";
}
