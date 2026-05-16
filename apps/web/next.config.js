/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@quickhelp/ui",
    "@quickhelp/seo",
    "@quickhelp/analytics",
    "@quickhelp/tool-kit",
    "@quickhelp/agent-sdk",
    "@quickhelp/tools-jwt-decoder",
    "@quickhelp/tools-json-formatter",
    "@quickhelp/tools-image-converter",
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
