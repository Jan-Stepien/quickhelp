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
  ],
  webpack(config) {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },
};

export default nextConfig;
