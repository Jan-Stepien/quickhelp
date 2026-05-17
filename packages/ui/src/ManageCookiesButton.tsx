"use client";

import React from "react";
import { useConsent } from "./ConsentProvider";

export function ManageCookiesButton() {
  const { openManager } = useConsent();
  return (
    <button
      onClick={openManager}
      className="underline underline-offset-2 hover:text-foreground transition-colors"
    >
      Manage cookies
    </button>
  );
}
