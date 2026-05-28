import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

/**
 * Cookie / セッションに依存しない anon クライアント (Server / Client Component 両対応)。
 *
 * 用途:
 *   - 公開ページ用の Client Component から Supabase を直叩きする時 (例: TOP の NewsSection)
 *   - `createBrowserClient` を使うと admin ログイン中の管理者 Cookie がそのまま乗り、
 *     RLS の `authenticated` 権限で下書きまで読めてしまうため、その回避用。
 *
 * RLS 上は常に anon ロールとして動作するため、公開記事 (status='published'
 * AND published_at <= now()) のみが取得される。
 */
export function createPublicClient() {
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
