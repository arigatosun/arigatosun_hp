import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'arigatosun-web.local',
      },
    ],
  },
};

export default nextConfig;
