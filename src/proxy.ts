import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Next.js 16 から middleware.ts → proxy.ts に名称変更。export 名も `proxy` に。
// 旧名 (middleware) からの移行ガイド: https://nextjs.org/docs/messages/middleware-to-proxy
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // /admin 配下のみ proxy を通す。
  // 公開サイト側で Supabase セッションを必要としないため範囲を絞ることで
  // 静的最適化を阻害しない。
  matcher: ['/admin/:path*'],
};
