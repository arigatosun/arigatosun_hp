import Link from 'next/link';
import styles from './Button.module.scss';

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: 'outline' | 'filled';
  external?: boolean;
};

export default function Button({
  href,
  children,
  variant = 'outline',
  external = false,
}: ButtonProps) {
  const className = `${styles.button} ${styles[variant]}`;

  if (external) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
