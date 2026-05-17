"use client";

import React, { useState } from "react";
import { useConsent } from "./ConsentProvider";

export function ConsentBanner() {
  const { consent, setConsent, isManagerOpen, closeManager } = useConsent();
  const [showCustomize, setShowCustomize] = useState(false);
  const [analyticsOn, setAnalyticsOn] = useState(true);
  const [adsOn, setAdsOn] = useState(true);

  const visible = consent === null || isManagerOpen;
  if (!visible) return null;

  const acceptAll = () => {
    setConsent({ advertising: true, analytics: true, timestamp: Date.now() });
    closeManager();
    setShowCustomize(false);
  };

  const rejectAll = () => {
    setConsent({ advertising: false, analytics: false, timestamp: Date.now() });
    closeManager();
    setShowCustomize(false);
  };

  const savePrefs = () => {
    setConsent({ advertising: adsOn, analytics: analyticsOn, timestamp: Date.now() });
    closeManager();
    setShowCustomize(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background shadow-lg">
      <div className="mx-auto max-w-5xl px-6 py-4">
        {!showCustomize ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              We use cookies to serve ads and measure traffic.{" "}
              <a href="/cookies" className="underline underline-offset-2 hover:text-foreground transition-colors">
                Cookie policy
              </a>
              {" · "}
              <a href="/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors">
                Privacy policy
              </a>
            </p>
            <div className="flex flex-shrink-0 flex-wrap gap-2">
              <button
                onClick={() => setShowCustomize(true)}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Customize
              </button>
              <button
                onClick={rejectAll}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Reject all
              </button>
              <button
                onClick={acceptAll}
                className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-80 transition-opacity"
              >
                Accept all
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Cookie preferences</p>
            <div className="space-y-2">
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked disabled className="h-4 w-4 cursor-not-allowed opacity-50" />
                <span className="text-foreground">Necessary</span>
                <span className="text-xs text-muted-foreground">Theme, consent preferences (always on)</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={analyticsOn}
                  onChange={(e) => setAnalyticsOn(e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-foreground">Analytics</span>
                <span className="text-xs text-muted-foreground">Cloudflare Web Analytics (cookieless)</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={adsOn}
                  onChange={(e) => setAdsOn(e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-foreground">Advertising</span>
                <span className="text-xs text-muted-foreground">Google AdSense</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCustomize(false)}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Back
              </button>
              <button
                onClick={savePrefs}
                className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-80 transition-opacity"
              >
                Save preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
