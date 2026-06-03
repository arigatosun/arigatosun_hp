import type { MemberCareer } from '@/types/member';
import styles from './MemberCareerSection.module.scss';

interface MemberCareerSectionProps {
  title?: string;
  // string（PC/SP 共通）または { pc, sp }（ビューポート別の改行）
  body: MemberCareer;
}

export default function MemberCareerSection({
  title = '経歴',
  body,
}: MemberCareerSectionProps) {
  return (
    <section className={styles.root}>
      <h2 className={styles.title}>{title}</h2>
      {typeof body === 'string' ? (
        <p className={styles.body}>{body}</p>
      ) : (
        <>
          <p className={`${styles.body} ${styles.pcOnly}`}>{body.pc}</p>
          <p className={`${styles.body} ${styles.spOnly}`}>{body.sp}</p>
        </>
      )}
    </section>
  );
}
