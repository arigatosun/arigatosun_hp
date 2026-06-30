import styles from './WorkLinkLine.module.scss';

type WorkLinkLineProps = {
  /** リンク前のラベル（例: "URL→ "）。省略可。 */
  label?: string;
  /** 遷移先 URL（別タブで開く）。 */
  href: string;
  /** リンクの表示テキスト（例: URL 文字列）。 */
  text: string;
  /** テキスト列の Figma 実測幅（px・1920 基準）。指定時のみ列を max-width 固定。 */
  width?: number;
};

// 「URL→ <a>https://...</a>」のような外部リンク1行。
export default function WorkLinkLine({
  label,
  href,
  text,
  width,
}: WorkLinkLineProps) {
  return (
    <section className={styles.linkLine}>
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
        {label}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          {text}
        </a>
      </p>
    </section>
  );
}
