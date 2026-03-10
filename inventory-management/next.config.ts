import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  /* config option here */
  async rewrites() {
    return [
      {
        source: "api/proxy/:path*",
        destination: "https://inventory-management-server-gffg.onrender.com/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
