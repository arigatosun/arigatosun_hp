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
  // 旧サイト（合同会社アリガトサン）にあって新サイトに無いパスを恒久リダイレクト。
  // 検索インデックスやブックマークに残る旧URLが 404 にならないようにする。
  // 共通パス（/about /works /news /contact）は新サイトにも存在するため不要。
  async redirects() {
    return [
      // 旧トップ（/top）→ 新トップ（/）
      { source: '/top', destination: '/', permanent: true },
      // 旧インタビュー（/testimonials）は新サイトに該当ページが無いためトップへ
      { source: '/testimonials', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
