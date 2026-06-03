'use client';

import { useEffect, useState } from 'react';
import styles from './DebugRightLine.module.scss';

/**
 * 一時的なデバッグ用ガイド線。URL に `?debug=1` を付けたときだけ表示する。
 * NEWS セクションの content 右端（＝ WORKS 画像の揃え先ライン）に赤い縦線を引き、
 * レスポンシブで幅を変えても両画像の右端が同じラインに乗るか目視確認するための補助。
 */
export default function DebugRightLine() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(new URLSearchParams(window.location.search).get('debug') === '1');
  }, []);

  if (!show) return null;
  return <div className={styles.line} aria-hidden="true" />;
}
