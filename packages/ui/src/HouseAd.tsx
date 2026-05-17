import React from "react";

export function HouseAd({ className }: { className?: string }) {
  return (
    <a
      href="/tools"
      className={[
        "flex items-center justify-between rounded-md border border-border",
        "bg-muted px-4 py-3 text-sm transition-colors hover:border-foreground/30",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="text-muted-foreground">
        <span className="font-medium text-foreground">quickhelp.dev</span>
        {" — more free developer tools"}
      </span>
      <span className="text-muted-foreground text-xs">Browse all →</span>
    </a>
  );
}
