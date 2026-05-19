import styles from './WorkCreditList.module.scss';

type WorkCreditListProps = {
  groups: { label: string; lines: string[] }[];
};

export default function WorkCreditList({ groups }: WorkCreditListProps) {
  return (
    <section className={styles.creditList}>
      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className={styles.group}>
          <p className={styles.label}>{group.label}</p>
          <div className={styles.lines}>
            {group.lines.map((line, lineIndex) => (
              <p key={lineIndex} className={styles.line}>
                {line}
              </p>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
