import styles from './WorkPageTitle.module.scss';

type WorkPageTitleProps = {
  label: string;
  subtitle: string;
};

// banner 直下のページタイトル（ブランド名＋サブ見出し＋短い下線）。
// ケアGO のように banner にタイトルがベイクされず、ライブテキストで置くページ用。
export default function WorkPageTitle({ label, subtitle }: WorkPageTitleProps) {
  return (
    <section className={styles.pageTitle}>
      {/* 作品詳細ページの冒頭に1つだけ置くため、ページの主見出し（h1）にする */}
      <h1 className={styles.label}>{label}</h1>
      <p className={styles.subtitle}>{subtitle}</p>
      <span className={styles.divider} aria-hidden="true" />
    </section>
  );
}
