import 'server-only';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

/**
 * Cookie に依存しない匿名サーバークライアント。
 * 用途:
 *   - `generateStaticParams` などビルド時実行コンテキスト
 *   - リクエスト外（cookies() が利用不可）からの匿名読み取り
 *
 * 認証セッションは付与されないため RLS の anon ロール権限のみで動作する。
 */
export function createAnonClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}
