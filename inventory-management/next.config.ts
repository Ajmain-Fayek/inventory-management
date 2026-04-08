import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  /* config option here */
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: "https://inventory-management-server-gffg.onrender.com/api/auth/:path*",
        // destination: "http://localhost:3000/api/auth/:path*",
      },
      {
        source: "/api/proxy/:path*",
        destination: "https://inventory-management-server-gffg.onrender.com/:path*",
        // destination: "http://localhost:3000/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
