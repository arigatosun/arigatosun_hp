import Image from 'next/image';
import styles from './MemberHeroBlock.module.scss';

// 写真カードのみの単一責務コンポーネント。テキスト情報（role/name/divider/INSTAGRAM）は
// MemberInfoHeader で扱い、ページ側で 2-col レイアウトとして組む。
interface MemberHeroBlockProps {
  photo: string;
  photoAlt: string;
  photoColor?: string;
}

export default function MemberHeroBlock({
  photo,
  photoAlt,
  photoColor,
}: MemberHeroBlockProps) {
  return (
    <div className={styles.photoFrame}>
      <Image
        src={photo}
        alt={photoAlt}
        width={293}
        height={293}
        className={styles.photo}
        priority
        unoptimized
      />
      {/* カラー版を上に重ねて hover でフェード表示（MemberSection 一覧と同方式） */}
      {photoColor && (
        <Image
          src={photoColor}
          alt=""
          aria-hidden="true"
          width={293}
          height={293}
          className={styles.photoColor}
          priority
          unoptimized
        />
      )}
    </div>
  );
}
