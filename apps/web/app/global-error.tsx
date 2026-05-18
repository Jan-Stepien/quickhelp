"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "sans-serif", background: "#0a0a0a", color: "#ffffff" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 32, fontWeight: 700 }}>Application error</h1>
          <p style={{ marginTop: 8, color: "#6b7280" }}>A critical error occurred. Please reload.</p>
          <button
            onClick={reset}
            style={{ marginTop: 24, padding: "10px 20px", background: "#ffffff", color: "#0a0a0a", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
