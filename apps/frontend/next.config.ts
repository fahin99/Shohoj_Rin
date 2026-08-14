import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Pre-existing Prettier formatting issues in source files — run lint separately
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:5000/api/v1/:path*",
      },
    ];
  },
  transpilePackages: ["@shohojrin/shared"],
};

export default nextConfig;
