import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getMemberBySlug, getAllMemberSlugs } from '@/data/members';
import MemberSection from '@/components/ui/MemberSection';
import MemberHeroBlock from '@/components/ui/member-detail/MemberHeroBlock';
import styles from './page.module.scss';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>;
};

const roleJpMap: Record<string, string> = {
  'shuto-nakamura': '代表社員',
};

export async function generateStaticParams() {
  return getAllMemberSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const member = getMemberBySlug(slug);
  if (!member) return {};

  return {
    title: `${member.name} | ${member.role}`,
  };
}

export default async function MemberDetailPage({ params }: Props) {
  const { slug } = await params;
  const member = getMemberBySlug(slug);

  if (!member) {
    notFound();
  }

  const roleJp = roleJpMap[member.slug] ?? '社員';
  const roleEn = `(${member.role})`;

  return (
    <div className={styles.page}>
      <MemberHeroBlock
        photo={member.photo ?? ''}
        photoAlt={member.name}
        roleJp={roleJp}
        roleEn={roleEn}
        nameEn={member.name}
      />

      <section className={styles.profile}>
        <div className={styles.info}>
          {member.social && (member.social.instagram || member.social.x) && (
            <div className={styles.socialLinks}>
              {member.social.instagram && (
                <a
                  href={member.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  INSTAGRAM
                </a>
              )}
              {member.social.x && (
                <a
                  href={member.social.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  X
                </a>
              )}
            </div>
          )}

          <p className={styles.catchphrase}>{member.catchphrase}</p>

          <p className={styles.description}>{member.description}</p>

          <div className={styles.careerSection}>
            <h2 className={styles.sectionLabel}>経歴</h2>
            <p className={styles.careerText}>{member.career}</p>
          </div>

          {member.projects && member.projects.length > 0 && (
            <div className={styles.projectsSection}>
              <h2 className={styles.sectionLabel}>関わったプロジェクト</h2>
              <div className={styles.projectsGrid}>
                {member.projects.map((project) => (
                  <Link
                    key={project.slug}
                    href={`/works/${project.slug}`}
                    className={styles.projectCard}
                  >
                    {project.thumbnail ? (
                      <img
                        src={project.thumbnail}
                        alt={project.title}
                        className={styles.projectThumbnail}
                      />
                    ) : (
                      <div className={styles.projectPlaceholder} />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <MemberSection variant="slider" />
    </div>
  );
}
