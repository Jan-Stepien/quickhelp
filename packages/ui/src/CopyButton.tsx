"use client";

import React, { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleClick}
      className="rounded-md border px-3 py-1 text-xs text-gray-600 hover:bg-gray-50"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
