import { useEffect, useState } from "react";

export function registerServiceWorker(): void {
  if (!("serviceWorker" in navigator)) return;
  // Register only on pages that are part of the installed app (not local dev).
  if (location.hostname === "localhost" || location.hostname === "127.0.0.1") return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* SW unavailable (http, unsupported) — app still works */
    });
  });
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

/** Hook: returns install prompt trigger, whether it's available, and install state. */
export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true;
    setInstalled(isStandalone);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = async (): Promise<"installed" | "unavailable"> => {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") {
        setInstalled(true);
        return "installed";
      }
      return "unavailable";
    }
    return "unavailable";
  };

  return { canInstall: !!deferred, installed, promptInstall };
}

export function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true
  );
}
