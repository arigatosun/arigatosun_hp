import styles from './MemberCareerSection.module.scss';

interface MemberCareerSectionProps {
  title?: string;
  body: string;
}

export default function MemberCareerSection({
  title = '経歴',
  body,
}: MemberCareerSectionProps) {
  return (
    <section className={styles.root}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.body}>{body}</p>
    </section>
  );
}
