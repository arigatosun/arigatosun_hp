import { Fragment, type CSSProperties } from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import type { ServicePromiseSection } from '@/types/service';
import styles from './ServicePromiseGrid.module.scss';

type ServicePromiseGridProps = ServicePromiseSection;

/**
 * Hero 直後の 3 カラム promise グリッド
 * Figma SERVICE 詳細ページ「私たちが実現すること」「私たちが実現してきたこと」等
 * - 上: SectionHeader (icon + title + subtitle)
 * - 下: 3 カラム catchphrase + body（各カラム上に 01./02./03. ステップ番号）
 * - カラム間に縦区切り線
 */
export default function ServicePromiseGrid({
  id,
  title,
  subtitle,
  items,
}: ServicePromiseGridProps) {
  return (
    <section className={styles.section} id={id}>
      <SectionHeader
        logo={{
          src: '/images/sections/service/detail/section-sun.svg',
          alt: '',
          width: 61,
          height: 58,
        }}
        title={title}
        subtitle={subtitle}
        size="service-detail"
      />

      <div className={styles.grid}>
        {items.map((item, i) => (
          <Fragment key={i}>
            {i > 0 && <div className={styles.divider} aria-hidden="true" />}
            <div className={styles.item}>
              <span className={styles.step}>
                {String(i + 1).padStart(2, '0')}.
              </span>
              <h3 className={styles.catchphrase}>{item.catchphrase}</h3>
              <p
                className={styles.body}
                style={
                  item.bodyTrackingSp !== undefined
                    ? ({ '--body-ls-sp': `${item.bodyTrackingSp}px` } as CSSProperties)
                    : undefined
                }
              >
                {/* data 側 \n は Figma SP の wrap 用の強制改行。PC(MacBook含む) では
                    分断したくない（例: 『感情の循環』）ため、SP のみ有効な <br> に変換して
                    PC では改行せず自然に流す。 */}
                {item.body.split('\n').map((seg, idx) => (
                  <Fragment key={idx}>
                    {idx > 0 && <br className={styles.bodyBreakSp} />}
                    {seg}
                  </Fragment>
                ))}
              </p>
            </div>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
