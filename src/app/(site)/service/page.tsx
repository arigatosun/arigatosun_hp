import type { Metadata } from 'next';
import Image from 'next/image';
import ServiceCardGrid from '@/components/ui/ServiceCardGrid';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'Service',
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
          {/* Figma: 幅600pxボックス内で 。ごとに 3 行（明示的な改行） */}
          <p>最先端のAI開発技術で、アイデアや理想を形に。</p>
          <p>ブランディングで、世の中に届けるところまで。</p>
          <p>構想からリリースまで一気通貫で進めます。</p>
        </div>
      </section>

      {/* サービス3カード（動画背景付き） */}
      <ServiceCardGrid />
    </div>
  );
}
