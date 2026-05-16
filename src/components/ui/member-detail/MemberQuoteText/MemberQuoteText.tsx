import styles from './MemberQuoteText.module.scss';

interface MemberQuoteTextProps {
  text: string;
}

export default function MemberQuoteText({ text }: MemberQuoteTextProps) {
  return <p className={styles.root}>{text}</p>;
}
