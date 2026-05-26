#!/usr/bin/env node
/**
 * One-time (and on-demand) IndexNow bulk submit.
 * Usage: node tooling/indexnow/submit.mjs [--dry-run]
 * Submits all URLs in /sitemap.xml to api.indexnow.org (covers Bing, Yandex, Seznam).
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://quickhelp.dev";
const KEY = "1b22ff4c4be6d9319dca296d774c4e1d";
const DRY = process.argv.includes("--dry-run");

async function fetchSitemapUrls() {
  const res = await fetch(`${BASE_URL}/sitemap.xml`);
  const xml = await res.text();
  const matches = xml.matchAll(/<loc>([^<]+)<\/loc>/g);
  return [...matches].map((m) => m[1]).filter(Boolean);
}

async function submitBatch(urls) {
  const body = {
    host: new URL(BASE_URL).hostname,
    key: KEY,
    keyLocation: `${BASE_URL}/${KEY}.txt`,
    urlList: urls,
  };
  if (DRY) {
    console.log("[dry-run] would submit:", JSON.stringify(body, null, 2));
    return;
  }
  const res = await fetch("https://api.indexnow.org/IndexNow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
  console.log(`IndexNow response: ${res.status} ${res.statusText}`);
}

const urls = await fetchSitemapUrls();
console.log(`Submitting ${urls.length} URLs to IndexNow...`);

// IndexNow accepts up to 10,000 URLs per request
for (let i = 0; i < urls.length; i += 10000) {
  await submitBatch(urls.slice(i, i + 10000));
}
console.log("Done.");
