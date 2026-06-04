import { Fragment } from 'react';
import styles from './WorkCreditList.module.scss';

type WorkCreditListProps = {
  groups: { label: string; lines: string[] }[];
};

// 日本語（ひらがな/カタカナ/漢字/半角カナ）判定
const JP_CHAR = /[぀-ヿ㐀-鿿ｦ-ﾟ々〆]/;

/** 1 行を「日本語の連続」と「それ以外（英数字・記号）」のランに分割する。 */
function splitByScript(text: string): { text: string; jp: boolean }[] {
  const segments: { text: string; jp: boolean }[] = [];
  for (const char of text) {
    const jp = JP_CHAR.test(char);
    const last = segments[segments.length - 1];
    if (last && last.jp === jp) {
      last.text += char;
    } else {
      segments.push({ text: char, jp });
    }
  }
  return segments;
}

export default function WorkCreditList({ groups }: WorkCreditListProps) {
  return (
    <section className={styles.creditList}>
      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className={styles.group}>
          <p className={styles.label}>{group.label}</p>
          <div className={styles.lines}>
            {group.lines.map((line, lineIndex) => (
              <p key={lineIndex} className={styles.line}>
                {/* 英語は Mozaic GEO Light（Figma 準拠）/ 日本語は Noto Sans JP・少し小さく（.jp） */}
                {splitByScript(line).map((seg, segIndex) =>
                  seg.jp ? (
                    <span key={segIndex} className={styles.jp}>
                      {seg.text}
                    </span>
                  ) : (
                    <Fragment key={segIndex}>{seg.text}</Fragment>
                  ),
                )}
              </p>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
