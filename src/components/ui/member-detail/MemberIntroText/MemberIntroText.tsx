import styles from './MemberIntroText.module.scss';

interface MemberIntroTextProps {
  paragraphs: string[];
}

export default function MemberIntroText({ paragraphs }: MemberIntroTextProps) {
  return (
    <div className={styles.root}>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className={styles.paragraph}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}
