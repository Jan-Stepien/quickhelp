"use client";

import { useEffect } from "react";
import { useConsent } from "@quickhelp/ui";
import { onCLS, onINP, onLCP, onFCP, onTTFB } from "web-vitals/attribution";
import type { MetricWithAttribution } from "web-vitals/attribution";

function sendMetric(metric: MetricWithAttribution) {
  const payload = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
    path: window.location.pathname,
    ts: Date.now(),
  });
  navigator.sendBeacon("/api/cwv", new Blob([payload], { type: "application/json" }));
}

export function WebVitalsReporter() {
  const { consent } = useConsent();

  useEffect(() => {
    if (consent?.analytics !== true) return;
    onCLS(sendMetric);
    onINP(sendMetric);
    onLCP(sendMetric);
    onFCP(sendMetric);
    onTTFB(sendMetric);
  }, [consent?.analytics]);

  return null;
}
