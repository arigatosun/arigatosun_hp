import SectionTitle from '@/components/ui/SectionTitle';
import InterviewCard from '@/components/ui/InterviewCard';
import { INTERVIEWS } from '@/data/interviews';
import styles from './InterviewSection.module.scss';

// TOP ページの「インタビュー（CLIENT INTERVIEW）」セクション。横に最大3つ表示。
export default function InterviewSection() {
  const items = INTERVIEWS.slice(0, 3);
  if (items.length === 0) return null;

  return (
    <section className={styles.section}>
      <SectionTitle
        src="/images/sections/interview/title-logo.png"
        alt="インタビュー"
        width={259}
        height={42}
        label="CLIENT INTERVIEW"
        className={styles.title}
      />
      <ul className={styles.grid}>
        {items.map((item, i) => (
          <li key={i}>
            <InterviewCard item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}
