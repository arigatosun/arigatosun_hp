import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminHeader from '../_components/AdminHeader';
import styles from './layout.module.scss';

export const metadata: Metadata = {
  title: {
    default: '管理画面',
    template: '%s | 管理画面',
  },
  robots: 'noindex, nofollow',
};

export default async function AdminAuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // middleware で誘導済みだが、Server Component で auth を必ず確認する二重防御
  if (!user) {
    redirect('/admin/login');
  }

  return (
    <div className={styles.root}>
      <AdminHeader email={user.email ?? ''} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
