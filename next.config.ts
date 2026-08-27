import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Playwright とローカル確認は loopback から dev server へ接続する。
  allowedDevOrigins: ['127.0.0.1'],
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
    qualities: [75, 90],
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
    const webMcpHeaders: { key: string; value: string }[] = [
      { key: 'Permissions-Policy', value: 'tools=(self)' },
    ];
    if (process.env.WEBMCP_ORIGIN_TRIAL_TOKEN) {
      webMcpHeaders.push({ key: 'Origin-Trial', value: process.env.WEBMCP_ORIGIN_TRIAL_TOKEN });
    }
    return [
      {
        source: '/:path*',
        headers: webMcpHeaders,
      },
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
      // 旧サイトの Works 詳細（UUID スラッグ）救済。
      // KUSOMEGANE は現行の IP / CREATIVE 詳細が最も近いため個別に誘導する。
      {
        source: '/works/18d1d263-c3f1-4e70-ae07-75e4af3fb79b',
        destination: '/service/ip-creative',
        permanent: true,
      },
      // それ以外の旧 UUID 詳細は現行の Works 一覧へ集約する。
      {
        source: '/works/:slug([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})',
        destination: '/works',
        permanent: true,
      },
      // Works スラッグを連番→内容ベースに変更。旧URL（公開済み）を新URLへ恒久リダイレクト
      { source: '/works/work-1', destination: '/works/choritz', permanent: true },
      { source: '/works/work-2', destination: '/works/logo-archive', permanent: true },
      { source: '/works/work-3', destination: '/works/nest', permanent: true },
      { source: '/works/work-4', destination: '/works/mente', permanent: true },
    ];
  },
};

export default nextConfig;
