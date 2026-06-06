"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function PwaInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };
    setIsInstalled(window.matchMedia("(display-mode: standalone)").matches || Boolean(navigatorWithStandalone.standalone));

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setInstallPrompt(null);
      setIsInstalled(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function installApp() {
    if (!installPrompt) {
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome !== "dismissed") {
      setInstallPrompt(null);
    }
  }

  if (!installPrompt || isInstalled) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={installApp}
      className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded border border-cyan-300/70 bg-slate-950/95 px-4 py-2 text-sm font-black text-cyan-100 shadow-glow hover:border-yellow-300 hover:text-yellow-200"
    >
      <Download className="h-4 w-4" />
      Install App
    </button>
  );
}
