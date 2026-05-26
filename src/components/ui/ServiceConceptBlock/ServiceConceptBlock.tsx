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
  children,
}: ServiceConceptBlockProps) {
  const blockClass = [
    styles.block,
    variant === 'phases' ? styles.variantPhases : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <section className={blockClass} id={id}>
      <div className={styles.text}>
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
              {i > 0 && <br />}
              {segment}
            </Fragment>
          ))}
        </p>
      </div>
      <div className={styles.visual}>{children}</div>
    </section>
  );
}
