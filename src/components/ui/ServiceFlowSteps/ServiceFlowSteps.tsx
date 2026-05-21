import Image from 'next/image';
import type { ServiceFlowStep } from '@/types/service';
import styles from './ServiceFlowSteps.module.scss';

type ServiceFlowStepsProps = {
  items: ServiceFlowStep[];
};

/**
 * PROCESS（進め方）の縦並びステップリスト
 * AI/DEV 進め方セクション専用。STEP.1〜5 の縦リスト + 左に円形インジケーター。
 */
export default function ServiceFlowSteps({ items }: ServiceFlowStepsProps) {
  return (
    <div className={styles.wrap}>
      {/* 5 円 + 縦線インジケーター (Figma 由来) */}
      <div className={styles.indicator} aria-hidden="true">
        <Image
          src="/images/sections/service/detail/process-indicator.png"
          alt=""
          width={64}
          height={1410}
          className={styles.indicatorImage}
        />
      </div>

      <ol className={styles.list}>
        {items.map((item, i) => (
          <li key={i} className={styles.item}>
            <span className={styles.step}>{item.step}</span>
            <p className={styles.title}>{item.title}</p>
            <p className={styles.description}>{item.description}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
