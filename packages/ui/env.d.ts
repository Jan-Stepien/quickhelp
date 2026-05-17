// Next.js inlines NEXT_PUBLIC_* env vars at build time — declare process for TypeScript.
declare const process: {
  env: Record<string, string | undefined>;
};
