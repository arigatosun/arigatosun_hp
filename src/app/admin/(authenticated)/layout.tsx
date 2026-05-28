import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminHeader from '../_components/AdminHeader';
import styles from './layout.module.scss';

// メタデータ (title.template + robots) は親の app/admin/layout.tsx で定義済み。

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
