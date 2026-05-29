import 'server-only';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Server Action 専用の認証ガード。
 * - 未ログイン時は /admin/login にリダイレクトして以降の処理を打ち切る
 * - 戻り値で Supabase クライアントと user を返し、呼び出し側で再利用できる
 *
 * 各 Server Action の最初に必ず呼ぶ。RLS の `authenticated` ポリシーが防壁ではあるが、
 * 「middleware + layout + Server Action 内」の三層防御を維持するため。
 */
export async function requireAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/admin/login');
  }
  return { supabase, user };
}
