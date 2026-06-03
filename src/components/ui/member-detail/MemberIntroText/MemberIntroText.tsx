import type { MemberIntro } from '@/types/member';
import styles from './MemberIntroText.module.scss';

interface MemberIntroTextProps {
  // string[]（PC/SP 共通）または { pc, sp }（ビューポート別の改行）
  paragraphs: MemberIntro;
}

function Paragraphs({ items }: { items: string[] }) {
  return (
    <>
      {items.map((paragraph, index) => (
        <p key={index} className={styles.paragraph}>
          {paragraph}
        </p>
      ))}
    </>
  );
}

export default function MemberIntroText({ paragraphs }: MemberIntroTextProps) {
  // 共通（string[]）はそのまま描画
  if (Array.isArray(paragraphs)) {
    return (
      <div className={styles.root}>
        <Paragraphs items={paragraphs} />
      </div>
    );
  }

  // PC/SP で改行が異なる場合は両方描画し、CSS で表示を出し分ける
  return (
    <div className={styles.root}>
      <div className={styles.pcOnly}>
        <Paragraphs items={paragraphs.pc} />
      </div>
      <div className={styles.spOnly}>
        <Paragraphs items={paragraphs.sp} />
      </div>
    </div>
  );
}
