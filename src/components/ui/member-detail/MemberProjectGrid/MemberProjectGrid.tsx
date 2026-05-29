import Link from 'next/link';
import Image from 'next/image';
import type { MemberProject } from '@/types/member';
import styles from './MemberProjectGrid.module.scss';

interface MemberProjectGridProps {
  title?: string;
  projects: MemberProject[];
}

export default function MemberProjectGrid({
  title = '関わったプロジェクト',
  projects,
}: MemberProjectGridProps) {
  if (!projects || projects.length === 0) return null;

  return (
    <section className={styles.root}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.grid}>
        {projects.map((project) => (
          <Link key={project.slug} href={`/works/${project.slug}`} className={styles.card}>
            {project.thumbnail ? (
              <Image
                src={project.thumbnail}
                alt={project.title}
                width={357}
                height={202}
                className={styles.thumbnail}
                sizes="(max-width: 1023px) 48vw, 24vw"
              />
            ) : (
              <div className={styles.placeholder} aria-label={project.title} />
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
