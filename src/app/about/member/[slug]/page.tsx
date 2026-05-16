import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getMemberBySlug, getAllMemberSlugs } from '@/data/members';
import MemberHeroBlock from '@/components/ui/member-detail/MemberHeroBlock';
import MemberSocialLinks from '@/components/ui/member-detail/MemberSocialLinks';
import MemberQuoteText from '@/components/ui/member-detail/MemberQuoteText';
import MemberIntroText from '@/components/ui/member-detail/MemberIntroText';
import MemberCareerSection from '@/components/ui/member-detail/MemberCareerSection';
import MemberProjectGrid from '@/components/ui/member-detail/MemberProjectGrid';
import MemberSection from '@/components/ui/MemberSection';
import styles from './page.module.scss';

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

  const roleJp = member.roleJp ?? '社員';
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

      {member.social?.instagram && (
        <div className={styles.socialBlock}>
          <MemberSocialLinks instagramUrl={member.social.instagram} />
        </div>
      )}

      {member.quote && (
        <div className={styles.quoteBlock}>
          <MemberQuoteText text={member.quote} />
        </div>
      )}

      {member.introParagraphs && member.introParagraphs.length > 0 && (
        <div className={styles.introBlock}>
          <MemberIntroText paragraphs={member.introParagraphs} />
        </div>
      )}

      {member.career && (
        <div className={styles.careerBlock}>
          <MemberCareerSection body={member.career} />
        </div>
      )}

      {member.projects && member.projects.length > 0 && (
        <div className={styles.projectsBlock}>
          <MemberProjectGrid projects={member.projects} />
        </div>
      )}

      <MemberSection variant="slider" />
    </div>
  );
}
