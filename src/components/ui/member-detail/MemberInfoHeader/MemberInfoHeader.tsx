import type { MemberSocial } from '@/types/member';
import styles from './MemberInfoHeader.module.scss';

// テキスト列の先頭: role / name / divider と右上の SNS リンク群。
// 写真は親ページで MemberHeroBlock として独立して描画する。
interface MemberInfoHeaderProps {
  roleJp: string;
  nameEn: string;
  social?: MemberSocial;
}

// SNS ラベルとデータキーの対応
const SNS_LINKS: Array<{ key: keyof MemberSocial; label: string }> = [
  { key: 'instagram', label: 'INSTAGRAM' },
  { key: 'x', label: 'X' },
];

export default function MemberInfoHeader({
  roleJp,
  nameEn,
  social,
}: MemberInfoHeaderProps) {
  const visibleLinks = SNS_LINKS.filter((link) => social?.[link.key]);

  return (
    <header className={styles.root}>
      <div className={styles.infoBlock}>
        <p className={styles.role}>{roleJp}</p>
        <h1 className={styles.name}>{nameEn}</h1>
        <div className={styles.divider} aria-hidden="true" />
      </div>

      {visibleLinks.length > 0 && (
        <nav className={styles.snsLinks} aria-label="SNS">
          {visibleLinks.map((link) => (
            <a
              key={link.key}
              href={social?.[link.key]}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.snsLink}
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
