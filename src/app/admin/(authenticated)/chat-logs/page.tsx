import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { LogTopic } from '@/data/arigato-chat';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'チャットログ',
};

// 表示順と日本語ラベル。'unknown'（未分類）は FAQ 強化の手がかりなので先頭で強調する。
const TOPIC_LABELS: { key: LogTopic; label: string }[] = [
  { key: 'unknown', label: '未分類' },
  { key: 'company', label: '会社・事業' },
  { key: 'service', label: 'サービス' },
  { key: 'works', label: '実績' },
  { key: 'member', label: 'メンバー' },
  { key: 'recruit', label: '採用' },
  { key: 'contact', label: '問い合わせ' },
  { key: 'character', label: 'アリガトくん' },
  { key: 'greeting', label: '挨拶' },
];

const RECENT_LIMIT = 100;

function topicLabel(key: string): string {
  return TOPIC_LABELS.find((t) => t.key === key)?.label ?? key;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface ChatLogsPageProps {
  searchParams: Promise<{ topic?: string }>;
}

export default async function ChatLogsPage({ searchParams }: ChatLogsPageProps) {
  const params = await searchParams;
  const validTopics = TOPIC_LABELS.map((t) => t.key as string);
  const activeTopic = params.topic && validTopics.includes(params.topic) ? params.topic : 'all';

  const supabase = await createClient();

  // 話題別の件数（各カテゴリの head カウントを並列取得）＋総数。
  const [totalRes, ...topicResults] = await Promise.all([
    supabase.from('arigato_chat_logs').select('*', { count: 'exact', head: true }),
    ...TOPIC_LABELS.map((t) =>
      supabase
        .from('arigato_chat_logs')
        .select('*', { count: 'exact', head: true })
        .eq('topic', t.key),
    ),
  ]);

  const total = totalRes.count ?? 0;
  const counts = new Map<string, number>();
  TOPIC_LABELS.forEach((t, i) => counts.set(t.key, topicResults[i].count ?? 0));

  // 最近の質問一覧（任意で話題フィルター）。
  let listQuery = supabase
    .from('arigato_chat_logs')
    .select('id, created_at, question, topic, char_count')
    .order('created_at', { ascending: false })
    .limit(RECENT_LIMIT);
  if (activeTopic !== 'all') {
    listQuery = listQuery.eq('topic', activeTopic);
  }
  const { data: logs, error: fetchError } = await listQuery;

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>チャットログ</h1>
        <p className={styles.lead}>
          アリガトくんチャットに来た質問の傾向（総 {total} 件）。
        </p>
      </header>

      <p className={styles.note}>
        ※ 個人情報保護のため、質問本文はメール・電話番号・URL を伏字化して保存しています（IPアドレスは保存しません）。ログは90日で自動削除されます。
      </p>

      {fetchError && (
        <p className={styles.errorBanner} role="alert">
          ログの取得に失敗しました: {fetchError.message}
        </p>
      )}

      {/* 話題別の件数サマリー */}
      <div className={styles.summaryGrid}>
        {TOPIC_LABELS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/chat-logs?topic=${t.key}`}
            className={`${styles.summaryCard} ${t.key === 'unknown' ? styles.summaryCardAlert : ''} ${
              activeTopic === t.key ? styles.summaryCardActive : ''
            }`}
          >
            <span className={styles.summaryLabel}>{t.label}</span>
            <span className={styles.summaryCount}>{counts.get(t.key) ?? 0}</span>
          </Link>
        ))}
      </div>

      {/* フィルター状態 */}
      <nav className={styles.tabs} aria-label="話題フィルター">
        <Link
          href="/admin/chat-logs"
          className={`${styles.tab} ${activeTopic === 'all' ? styles.tabActive : ''}`}
        >
          すべて
        </Link>
        {activeTopic !== 'all' && (
          <span className={styles.tabCurrent}>
            絞り込み中: {topicLabel(activeTopic)}
          </span>
        )}
      </nav>

      {logs && logs.length > 0 ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.colDate}>日時</th>
                <th className={styles.colTopic}>話題</th>
                <th className={styles.colQuestion}>質問（マスキング済み）</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className={styles.colDate}>{formatDate(log.created_at)}</td>
                  <td className={styles.colTopic}>
                    <span
                      className={`${styles.topicBadge} ${
                        log.topic === 'unknown' ? styles.topicBadgeAlert : ''
                      }`}
                    >
                      {topicLabel(log.topic)}
                    </span>
                  </td>
                  <td className={styles.colQuestion}>{log.question}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === RECENT_LIMIT && (
            <p className={styles.limitNote}>最新 {RECENT_LIMIT} 件を表示しています。</p>
          )}
        </div>
      ) : (
        <div className={styles.empty}>
          <p className={styles.emptyText}>
            {activeTopic === 'all'
              ? 'まだ質問ログがありません。'
              : `「${topicLabel(activeTopic)}」の質問はありません。`}
          </p>
        </div>
      )}
    </div>
  );
}
