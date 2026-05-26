import 'server-only';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// service_role キーで RLS を完全にバイパスする管理クライアント。
// **絶対にクライアントへ露出させない**（'server-only' で import を弾く）。
// 用途: 認証ユーザー作成、システム由来の書き込みなど RLS では表現しきれない処理のみ。
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY が未設定です');
  }

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}
