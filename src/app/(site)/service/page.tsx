import type { Metadata } from 'next';
import Image from 'next/image';
import ServiceCardGrid from '@/components/ui/ServiceCardGrid';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'サービス',
};

export default function ServicePage() {
  return (
    <div className={styles.page}>
      {/* タイトルブロック */}
      <section className={styles.intro}>
        <h1 className={styles.introTitle}>
          <Image
            src="/images/sections/service/title-logo.png"
            alt="サービス"
            width={203}
            height={47}
            className={styles.introLogo}
            priority
          />
        </h1>
        <p className={styles.introLabel}>SERVICE</p>
        <div className={styles.introText}>
          {/* Figma: 幅600pxボックス内で 。ごとに 3 行（PC は各文1行）。
              SP では文節を inline-block 化し、折り返しを文節境界に限定して
              語尾の孤立（「を形に。」「す。」等）を防ぐ。 */}
          <p>
            <span className={styles.phrase}>最先端のAI開発技術で、</span>
            <span className={styles.phrase}>アイデアや理想を形に。</span>
          </p>
          <p>
            <span className={styles.phrase}>ブランディングで、</span>
            <span className={styles.phrase}>世の中に届けるところまで。</span>
          </p>
          <p>
            <span className={styles.phrase}>構想からリリースまで</span>
            <span className={styles.phrase}>一気通貫で進めます。</span>
          </p>
        </div>
      </section>

      {/* サービス3カード（動画背景付き） */}
      <ServiceCardGrid />
    </div>
  );
}
