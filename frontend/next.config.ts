import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Link", value: "<https://api.961shop.com>; rel=preconnect" },
        ],
      },
    ];
  },
  images: {
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/static/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8001",
        pathname: "/static/**",
      },
      {
        protocol: "https",
        hostname: "api.961shop.com",
        pathname: "/static/**",
      },
      {
        protocol: "http",
        hostname: "api.961shop.com",
        pathname: "/static/**",
      },
      {
        protocol: "https",
        hostname: "hamdancomputers.com",
        pathname: "/static/**",
      },
    ],
  },
};

export default nextConfig;
