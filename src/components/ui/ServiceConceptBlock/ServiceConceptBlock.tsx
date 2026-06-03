import { Fragment, type CSSProperties, type ReactNode } from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import styles from './ServiceConceptBlock.module.scss';

type ServiceConceptBlockProps = {
  id?: string;
  title: string;
  subtitle: string;
  /** Figma の明示的改行ごとに分割した本文セグメント */
  body: string[];
  /** 本文の字間（Figma 実測 px・16px 基準で em 換算） */
  bodyTracking: number;
  /** レイアウトバリアント — 'phases' は ECOSYSTEM PROCESS 用 (gap 195 / visual 585) */
  variant?: 'default' | 'phases';
  /**
   * PC で左カラム (見出し + 本文) を position: sticky で上部に固定する。
   * 右カラム (steps 等) のスクロールが終わるまで左を留め、ブロック末尾で自然解放。
   * SP では sticky 無効 (縦積みのため意味なし)。
   */
  stickyText?: boolean;
  /**
   * 本文の改行を「幅 1513px 以上のときだけ」表示する（= 1512px 以下は改行なしで流す）。
   * MacBook(1512) を含む 1512px 以下では本文を流し、それより大きい画面でのみ元の改行を出すケース用。
   */
  bodyBreakAbove1512?: boolean;
  /** 右側のビジュアル（GlowImage or ServiceScopePills） */
  children: ReactNode;
};

/** 詳細ページ中段のコンセプトブロック（見出し+本文 左 / ビジュアル 右） */
export default function ServiceConceptBlock({
  id,
  title,
  subtitle,
  body,
  bodyTracking,
  variant = 'default',
  stickyText = false,
  bodyBreakAbove1512 = false,
  children,
}: ServiceConceptBlockProps) {
  // bodyBreakAbove1512: 改行は 1513px 以上でのみ表示（≤1512 は流す）。
  // 通常: セグメント間は常時改行(素 br)、セグメント内 \n は SP 限定改行。
  const segmentBreakClass = bodyBreakAbove1512 ? styles.brWideOnly : undefined;
  const innerBreakClass = bodyBreakAbove1512
    ? styles.brWideOnly
    : styles.spOnlyBr;
  const blockClass = [
    styles.block,
    variant === 'phases' ? styles.variantPhases : '',
  ]
    .filter(Boolean)
    .join(' ');
  const textClass = [styles.text, stickyText ? styles.textSticky : '']
    .filter(Boolean)
    .join(' ');
  return (
    <section className={blockClass} id={id}>
      <div className={textClass}>
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
        <p
          className={styles.body}
          style={
            { '--body-tracking': `${bodyTracking / 16}em` } as CSSProperties
          }
        >
          {body.map((segment, i) => (
            <Fragment key={i}>
              {i > 0 && <br className={segmentBreakClass} />}
              {/* セグメント内の `\n` は SP 専用改行 (通常) / 1513px以上のみ改行 (bodyBreakAbove1512) */}
              {segment.split('\n').map((sub, j, arr) => (
                <Fragment key={j}>
                  {sub}
                  {j < arr.length - 1 && <br className={innerBreakClass} />}
                </Fragment>
              ))}
            </Fragment>
          ))}
        </p>
      </div>
      <div className={styles.visual}>{children}</div>
    </section>
  );
}
