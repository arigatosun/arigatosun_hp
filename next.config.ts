import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // worktree 配下で動かす時に親リポジトリ側を root と誤検知させない
  turbopack: {
    root: path.resolve(__dirname),
  },
  // ニュース管理画面の画像アップロード (uploadNewsImage) で 1MB 超のファイルを
  // 受け付けるため、Server Actions のデフォルト 1MB 制限を 10MB に緩和。
  // (uploadNewsImage 側は別途 5MB の上限チェックあり)
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'arigatosun-web.local',
      },
      {
        protocol: 'https',
        hostname: 'xgvjgvhqmkuulupvvbnr.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
