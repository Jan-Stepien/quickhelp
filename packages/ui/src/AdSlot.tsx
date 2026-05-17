"use client";

import React, { useEffect } from "react";
import { useConsent } from "./ConsentProvider";
import { HouseAd } from "./HouseAd";

interface AdSlotProps {
  slot: string;
  format?: "banner" | "square" | "horizontal";
  className?: string;
}

const CLIENT_ID = process.env["NEXT_PUBLIC_ADSENSE_CLIENT_ID"] ?? "";
const ADS_ENABLED = process.env["NEXT_PUBLIC_ADS_ENABLED"] === "true";

export function AdSlot({ slot, className }: AdSlotProps) {
  const { consent } = useConsent();
  const showAd = ADS_ENABLED && !!CLIENT_ID && consent?.advertising === true;

  useEffect(() => {
    if (!showAd) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // ignore
    }
  }, [showAd]);

  return (
    <div className={["my-4 min-h-[90px]", className].filter(Boolean).join(" ")}>
      {showAd ? (
        <>
          <p className="mb-1 text-center text-[10px] uppercase tracking-wide text-muted-foreground">
            Advertisement
          </p>
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client={CLIENT_ID}
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </>
      ) : (
        <HouseAd />
      )}
    </div>
  );
}
