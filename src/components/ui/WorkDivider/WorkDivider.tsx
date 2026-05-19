import styles from './WorkDivider.module.scss';

export default function WorkDivider() {
  return (
    <div className={styles.divider}>
      <span className={styles.line} aria-hidden="true" />
    </div>
  );
}
