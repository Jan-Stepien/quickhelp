/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@no-work/ui",
    "@no-work/seo",
    "@no-work/analytics",
    "@no-work/tool-kit",
    "@no-work/agent-sdk",
    "@no-work/tools-jwt-decoder",
    "@no-work/tools-json-formatter",
    "@no-work/tools-image-converter",
  ],
  // Keep sharp (native libvips) out of the webpack bundle — it must be loaded by Node at runtime
  // (Next.js 14 uses experimental.serverComponentsExternalPackages; renamed to serverExternalPackages in 15)
  experimental: {
    serverComponentsExternalPackages: ["sharp"],
  },
  webpack(config) {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },
};

export default nextConfig;
