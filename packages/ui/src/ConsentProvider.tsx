"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface ConsentState {
  advertising: boolean;
  analytics: boolean;
  timestamp: number;
}

interface ConsentContextValue {
  consent: ConsentState | null;
  setConsent: (s: ConsentState) => void;
  isManagerOpen: boolean;
  openManager: () => void;
  closeManager: () => void;
}

const ConsentContext = createContext<ConsentContextValue>({
  consent: null,
  setConsent: () => {},
  isManagerOpen: false,
  openManager: () => {},
  closeManager: () => {},
});

export function useConsent() {
  return useContext(ConsentContext);
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsentState] = useState<ConsentState | null>(null);
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("qh-consent-v1");
      if (raw) setConsentState(JSON.parse(raw) as ConsentState);
    } catch {
      // ignore
    }
  }, []);

  const setConsent = (s: ConsentState) => {
    setConsentState(s);
    try {
      localStorage.setItem("qh-consent-v1", JSON.stringify(s));
    } catch {
      // ignore
    }
  };

  return (
    <ConsentContext.Provider
      value={{
        consent,
        setConsent,
        isManagerOpen,
        openManager: () => setIsManagerOpen(true),
        closeManager: () => setIsManagerOpen(false),
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
}
