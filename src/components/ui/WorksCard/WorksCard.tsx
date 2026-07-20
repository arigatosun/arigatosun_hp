import Link from 'next/link';
import Image from 'next/image';
import { splitClientName } from '@/lib/client-name-segments';
import styles from './WorksCard.module.scss';

type WorksCardProps = {
  client: string;
  title: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  href?: string;
  /**
   * SP で title 内の "|" を改行に置換する。Figma SP の 2 段落構成カード (work-2) で使う。
   * 既定: false (PC/SP とも " | " を可視表示)
   */
  spBreakAtPipe?: boolean;
  /** カード画像の object-position（cover トリミング基準）。横長画像流用時に 'left' 等。 */
  imagePosition?: string;
};

export default function WorksCard({
  client,
  title,
  image,
  imageWidth,
  imageHeight,
  href = '/works',
  spBreakAtPipe = false,
  imagePosition,
}: WorksCardProps) {
  // works.ts の title は LP 用の \n と | 区切りを含む。/works カードは自然折り返しで表示するため
  // \n を除去。spBreakAtPipe=true のカード (work-2) は SP で | を改行に変換、それ以外は " | " を可視表示。
  const cleaned = title.replace(/\n/g, '');
  const clauses = cleaned.split('|');

  return (
    <Link href={href} className={styles.card}>
      <div className={styles.imageWrap}>
        {/* image 未指定（画像後追いの新規実績）は imageWrap のプレースホルダー背景のまま */}
        {image && (
          <Image
            src={image}
            alt={client}
            width={imageWidth}
            height={imageHeight}
            className={styles.image}
            sizes="(max-width: 1023px) 90vw, 30vw"
            style={imagePosition ? { objectPosition: imagePosition } : undefined}
          />
        )}
      </div>

      <p className={styles.client}>
        <span className={styles.clientLabel}>CLIENT：</span>
        {/* クライアント名は文字種の変わり目で区切り、日本語は .clientName(Noto Sans JP)、
            英字は .clientValueEn(font-en = CLIENT ラベルと同体裁) を当てる。文字列全体で
            判定すると日英混在名の英字部分まで日本語の指定になり英字だけ太く見えるため。 */}
        {splitClientName(client).map((seg, i) => (
          <span
            key={i}
            className={seg.isJa ? styles.clientName : styles.clientValueEn}
          >
            {seg.text}
          </span>
        ))}
      </p>

      <p className={styles.body}>
        {clauses.map((clause, i) => (
          <span key={i}>
            {i > 0 &&
              (spBreakAtPipe ? (
                <>
                  <span className={styles.bodyPipe}> | </span>
                  <br className={styles.bodyBreak} />
                </>
              ) : (
                ' | '
              ))}
            {clause.trim()}
          </span>
        ))}
      </p>

      <span className={styles.viewMore}>
        <span className={styles.viewMoreText}>VIEW MORE &gt;</span>
      </span>
    </Link>
  );
}
