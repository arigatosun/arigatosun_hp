import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // worktree 配下で動かす時に親リポジトリ側を root と誤検知させない
  turbopack: {
    root: path.resolve(__dirname),
  },
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
