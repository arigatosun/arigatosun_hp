import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

// セッション Cookie のリフレッシュ + 認証ガード。
// 管理画面実装時に src/middleware.ts から呼び出す（雛形段階では未登録）。
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // getUser() を必ず呼ぶ（getSession() ではトークンの検証が走らない）
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginRoute = pathname === '/admin/login';

  // 未ログインで /admin/* (login 除く) → /admin/login へリダイレクト
  if (isAdminRoute && !isLoginRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // ログイン済みで /admin/login → /admin へリダイレクト
  if (isLoginRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    url.searchParams.delete('next');
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
