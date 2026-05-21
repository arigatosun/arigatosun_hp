import type { ServiceFlowStep } from '@/types/service';
import styles from './ServiceFlowSteps.module.scss';

type ServiceFlowStepsProps = {
  items: ServiceFlowStep[];
};

/**
 * PROCESS（進め方）の縦並びステップリスト
 * AI/DEV 進め方セクション専用。STEP.1〜5 の縦リスト。
 */
export default function ServiceFlowSteps({ items }: ServiceFlowStepsProps) {
  return (
    <ol className={styles.list}>
      {items.map((item, i) => (
        <li key={i} className={styles.item}>
          <span className={styles.step}>{item.step}</span>
          <p className={styles.title}>{item.title}</p>
          <p className={styles.description}>{item.description}</p>
        </li>
      ))}
    </ol>
  );
}
