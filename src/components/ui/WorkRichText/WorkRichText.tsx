import { Fragment } from 'react';
import Link from 'next/link';
import type { WorkRichSegment } from '@/types/work';
import styles from './WorkRichText.module.scss';

type WorkRichTextProps = {
  segments: WorkRichSegment[];
  /** テキスト列の Figma 実測幅（px・1920 基準）。指定時のみ列を max-width 固定。 */
  width?: number;
};

// 通常テキスト / nowrap（折り返さない）/ リンク を混在できる本文1ブロック。
export default function WorkRichText({ segments, width }: WorkRichTextProps) {
  return (
    <section className={styles.richText}>
      <p
        className={styles.text}
        style={
          width
            ? {
                maxWidth: `clamp(${Math.round(width * 0.42)}px, ${(
                  width / 19.2
                ).toFixed(3)}vw, ${width}px)`,
              }
            : undefined
        }
      >
        {segments.map((seg, i) => {
          if (seg.href) {
            // http(s) は外部リンク（別タブ）、それ以外は内部 Link。nowrap 併用可。
            const external = /^https?:\/\//.test(seg.href);
            const cls = seg.nowrap
              ? `${styles.link} ${styles.nowrap}`
              : styles.link;
            return external ? (
              <a
                key={i}
                href={seg.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cls}
              >
                {seg.text}
              </a>
            ) : (
              <Link key={i} href={seg.href} className={cls}>
                {seg.text}
              </Link>
            );
          }
          if (seg.nowrap) {
            return (
              <span key={i} className={styles.nowrap}>
                {seg.text}
              </span>
            );
          }
          return <Fragment key={i}>{seg.text}</Fragment>;
        })}
      </p>
    </section>
  );
}
