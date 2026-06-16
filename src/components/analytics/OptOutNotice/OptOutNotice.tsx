'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { setOptOut, clearOptOut } from '@/lib/analyticsOptout';
import styles from './OptOutNotice.module.scss';

type OptOutNoticeProps = {
  /** 'out' = 計測をオフにする / 'in' = 計測を元に戻す。 */
  mode: 'out' | 'in';
};

/**
 * アクセス計測のオプトアウト / オプトインを行うページ用パネル。
 * マウント時に Cookie を更新する（書き込みのみの副作用）。
 * 関係者専用の機能ページのため装飾は最小限（Header/Footer 無しの素ページ）。
 */
export default function OptOutNotice({ mode }: OptOutNoticeProps) {
  useEffect(() => {
    if (mode === 'out') {
      setOptOut();
    } else {
      clearOptOut();
    }
  }, [mode]);

  const title =
    mode === 'out' ? 'アクセス計測をオフにしました' : 'アクセス計測を再開しました';

  const body =
    mode === 'out'
      ? 'このブラウザでのアクセスは、今後アクセス解析（Google アナリティクス等）の集計に含まれません。会社・自宅・スマートフォンなど回線が変わっても、このブラウザでは計測されません。普段サイト確認に使う別のブラウザ・端末がある場合は、それぞれで このページ（/optout）を一度開いてください。'
      : 'このブラウザは、通常の訪問者と同じようにアクセス解析の集計対象に戻りました。';

  return (
    <main className={styles.root}>
      <div className={styles.card}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.body}>{body}</p>
        <p className={styles.note}>
          うまく反映されない場合は、ブラウザの Cookie が有効になっているかご確認ください。
        </p>

        <p className={styles.actions}>
          {mode === 'out' ? (
            <Link className={styles.link} href="/optin">
              計測を元に戻す
            </Link>
          ) : (
            <Link className={styles.link} href="/optout">
              もう一度オフにする
            </Link>
          )}
        </p>
      </div>
    </main>
  );
}
