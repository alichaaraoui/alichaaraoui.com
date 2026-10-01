import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages serves static files only — no Node server.
  output: "export",
  // next/image optimization needs a server; disable it for the static export.
  images: { unoptimized: true },
  // Emit /about/index.html rather than /about.html so Pages resolves clean URLs.
  trailingSlash: true,
};

export default nextConfig;
