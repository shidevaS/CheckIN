"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    if (isStandalone || isInWebAppiOS) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Also show after a delay if the event already fired
    const timer = setTimeout(() => {
      if (!deferredPrompt) setShowPrompt(true);
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for a week
    localStorage.setItem('pwa-dismissed', Date.now().toString());
  };

  // Don't show if dismissed recently
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      setShowPrompt(false);
    }
  }, []);

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 md:bottom-6 md:right-6 animate-slide-up">
      <Card className="w-80 shadow-xl border-[rgb(var(--primary))/0.3]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-serif text-lg">Install Tuiton</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Add Tuiton to your home screen for quick access and offline support.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button onClick={handleInstall} className="w-full" size="lg">
            <Download className="h-4 w-4 mr-2" />
            Install App
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Type for beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}