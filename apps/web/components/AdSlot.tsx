"use client";

import { useEffect } from "react";

interface AdSlotProps {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
}

const CLIENT = process.env["NEXT_PUBLIC_ADSENSE_CLIENT_ID"] ?? "";
const ENABLED = process.env["NEXT_PUBLIC_ADS_ENABLED"] === "true";

export function AdSlot({ slot, format = "auto", className = "" }: AdSlotProps) {
  useEffect(() => {
    if (!ENABLED || !CLIENT) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // adsbygoogle not loaded yet
    }
  }, []);

  if (!ENABLED || !CLIENT) return null;

  return (
    <div className={`ad-slot overflow-hidden ${className}`} aria-hidden="true">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
