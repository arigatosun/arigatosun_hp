import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getMemberBySlug, getAllMemberSlugs } from '@/data/members';
import MemberSection from '@/components/ui/MemberSection';
import styles from './page.module.scss';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>;
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

  return (
    <div className={styles.page}>
      {/* プロフィールセクション */}
      <section className={styles.profile}>
        {/* 左: 写真 */}
        <div className={styles.photoArea}>
          {member.photo ? (
            <Image
              src={member.photo}
              alt={member.name}
              width={280}
              height={308}
              className={styles.photo}
            />
          ) : (
            <div className={styles.photoPlaceholder} />
          )}
        </div>

        {/* 右: テキスト情報 */}
        <div className={styles.info}>
          {/* 役職 + 名前 + SNS */}
          <div className={styles.infoHeader}>
            <div className={styles.infoHeaderLeft}>
              <p className={styles.role}>{member.role}</p>
              <h1 className={styles.name}>{member.name}</h1>
            </div>
            {member.social && (
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
          </div>

          {/* 区切り線 */}
          <div className={styles.divider} />

          {/* キャッチコピー */}
          <p className={styles.catchphrase}>{member.catchphrase}</p>

          {/* 自己紹介文 */}
          <p className={styles.description}>{member.description}</p>

          {/* 経歴 */}
          <div className={styles.careerSection}>
            <h2 className={styles.sectionLabel}>経歴</h2>
            <p className={styles.careerText}>{member.career}</p>
          </div>

          {/* 関わったプロジェクト */}
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

      {/* メンバー一覧（横スライド） */}
      <MemberSection variant="slider" />
    </div>
  );
}
