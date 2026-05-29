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
  // 3D モデル(.glb)はサイズが大きくリロード毎の再取得が表示遅延の主因になる。
  // 本番ではファイル内容が変わったら参照側の ?v= を上げる運用にして immutable で
  // 長期キャッシュさせる（2回目以降のリロードを即時化）。
  // 開発では差し替え（モデル更新）を即反映させたいので no-cache にしておく。
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';
    return [
      {
        source: '/models/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: isProd
              ? 'public, max-age=31536000, immutable'
              : 'no-cache',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
