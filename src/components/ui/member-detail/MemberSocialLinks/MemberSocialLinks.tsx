import styles from './MemberSocialLinks.module.scss';

interface MemberSocialLinksProps {
  instagramUrl?: string;
}

export default function MemberSocialLinks({ instagramUrl }: MemberSocialLinksProps) {
  if (!instagramUrl) return null;
  return (
    <div className={styles.root}>
      <a
        href={instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
      >
        INSTAGRAM
      </a>
    </div>
  );
}
