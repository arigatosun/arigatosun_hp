import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getMemberBySlug, getAllMemberSlugs } from '@/data/members';
import MemberHeroBlock from '@/components/ui/member-detail/MemberHeroBlock';
import MemberInfoHeader from '@/components/ui/member-detail/MemberInfoHeader';
import MemberQuoteText from '@/components/ui/member-detail/MemberQuoteText';
import MemberIntroText from '@/components/ui/member-detail/MemberIntroText';
import MemberCareerSection from '@/components/ui/member-detail/MemberCareerSection';
import MemberProjectGrid from '@/components/ui/member-detail/MemberProjectGrid';
import MemberSection from '@/components/ui/MemberSection';
import styles from './page.module.scss';

type Props = {
  params: Promise<{ slug: string }>;
};

// member.role (英語) → 表示用の日本語ロール（member.roleJp が設定されていれば優先）
const ROLE_JP_DEFAULTS: Record<string, string> = {
  CEO: '代表社員',
  CTO: '取締役',
  'LEAD ENGINEER': 'リードエンジニア',
  ENGINEER: 'エンジニア',
  'CDO / DESIGN DIRECTOR': 'デザインディレクター',
  'CCO / KUSOMEGANE': 'クリエイティブディレクター',
  'CREATIVE ENGINEER': 'クリエイティブエンジニア',
  'CORPORATE OPERATIONS': '経理 / 総務',
  CHARACTER: 'キャラクター',
};

// データ未設定時のプレースホルダー（Figma node 2498:46776 の見本テキストと同じ）
const PLACEHOLDER_QUOTE = '「〜〜〜。」';
const PLACEHOLDER_INTRO_PARAGRAPH = 'ここに文章が入ります。'.repeat(40);
const PLACEHOLDER_PROJECTS = [
  { title: 'Project 1', slug: 'project-1' },
  { title: 'Project 2', slug: 'project-2' },
  { title: 'Project 3', slug: 'project-3' },
  { title: 'Project 4', slug: 'project-4' },
  { title: 'Project 5', slug: 'project-5' },
  { title: 'Project 6', slug: 'project-6' },
];

export async function generateStaticParams() {
  return getAllMemberSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const member = getMemberBySlug(slug);
  if (!member) return {};

  const description = [`${member.name}（${member.role}）`, member.catchphrase]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
  return {
    title: `${member.name} | ${member.role}`,
    description,
    openGraph: { title: `${member.name} | 株式会社アリガトサン`, description },
  };
}

export default async function MemberDetailPage({ params }: Props) {
  const { slug } = await params;
  const member = getMemberBySlug(slug);

  if (!member) {
    notFound();
  }

  const roleJp = member.roleJp ?? ROLE_JP_DEFAULTS[member.role] ?? '社員';
  // データ未設定でも Figma の標準レイアウト（quote → body → 経歴 → projects）を必ず描画する
  const quote = member.quote ?? PLACEHOLDER_QUOTE;
  // introParagraphs は string[]（共通）/ { pc, sp }（ビューポート別）/ 未設定 のいずれか
  const hasIntro =
    member.introParagraphs != null &&
    (Array.isArray(member.introParagraphs)
      ? member.introParagraphs.length > 0
      : true);
  const introParagraphs = hasIntro
    ? member.introParagraphs!
    : [PLACEHOLDER_INTRO_PARAGRAPH];
  // projects 未設定（undefined）はダミーのプレースホルダーを表示。
  // 実データ反映済みで「掲載なし」を意図する場合は空配列 [] を渡すと欄ごと非表示になる。
  const projects = member.projects ?? PLACEHOLDER_PROJECTS;

  return (
    <div className={styles.page}>
      {/* 上部: 左に写真 / 右にテキスト列 の 2 カラム */}
      <div className={styles.detailRow}>
        <aside className={styles.photoColumn}>
          <MemberHeroBlock
            photo={member.photo ?? ''}
            photoAlt={member.name}
            photoColor={member.photoColor}
          />
        </aside>

        <div className={styles.textColumn}>
          <MemberInfoHeader
            roleJp={roleJp}
            nameEn={member.name}
            social={member.social}
          />

          <div className={styles.quoteBlock}>
            <MemberQuoteText text={quote} />
          </div>

          <div className={styles.introBlock}>
            <MemberIntroText paragraphs={introParagraphs} />
          </div>

          {member.career && (
            <div className={styles.careerBlock}>
              <MemberCareerSection body={member.career} />
            </div>
          )}

          {projects.length > 0 && (
            <div className={styles.projectsBlock}>
              <MemberProjectGrid projects={projects} />
            </div>
          )}
        </div>
      </div>

      <MemberSection variant="slider" />
    </div>
  );
}
