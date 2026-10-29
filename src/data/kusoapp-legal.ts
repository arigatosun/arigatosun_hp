// KUSOMEGANE PLUS(kusoapp)の規約・ポリシー一覧。
// 本文は src/content/legal/kusoapp/<slug>.md。slug はアプリ側の legal_links と同じ URL なので変えない。
// 文面を差し替えたら lastRevised を更新する。

export type KusoappLegalDoc = {
  slug: string;
  title: string;
  /** 制定日(YYYY-MM-DD) */
  established: string;
  /** 最終改定日(YYYY-MM-DD) */
  lastRevised: string;
};

export const KUSOAPP_LEGAL_DOCS: KusoappLegalDoc[] = [
  { slug: 'terms', title: '利用規約', established: '2026-10-29', lastRevised: '2026-10-29' },
  { slug: 'privacy', title: 'プライバシーポリシー', established: '2026-10-29', lastRevised: '2026-10-29' },
  { slug: 'external-transmission', title: '外部送信に関する公表事項', established: '2026-10-29', lastRevised: '2026-10-29' },
  { slug: 'commerce', title: '特定商取引法に基づく表記', established: '2026-10-29', lastRevised: '2026-10-29' },
  { slug: 'payment-services', title: '資金決済法に基づく表示', established: '2026-10-29', lastRevised: '2026-10-29' },
  { slug: 'gacha-rates', title: 'ガチャ提供割合', established: '2026-10-29', lastRevised: '2026-10-29' },
  { slug: 'community-guidelines', title: 'コミュニティガイドライン', established: '2026-10-29', lastRevised: '2026-10-29' },
  { slug: 'account-deletion', title: 'アカウントの削除について', established: '2026-10-29', lastRevised: '2026-10-29' },
  { slug: 'support', title: 'サポート', established: '2026-10-29', lastRevised: '2026-10-29' },
];

export const KUSOAPP_LEGAL_BASE_PATH = '/legal/kusoapp';

/** '2026-10-29' → '2026年10月29日' */
export function formatLegalDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${y}年${m}月${d}日`;
}
