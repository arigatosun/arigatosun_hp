'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './CopyLinkButton.module.scss';

interface CopyLinkButtonProps {
  /** コピーする URL */
  url: string;
  /** アイコン画像パス */
  iconSrc: string;
  /** 親（ニュースページ）から渡すサイズ・基底クラス（shareIcon 系） */
  iconClassName?: string;
  /** アクセシブルラベル */
  label?: string;
}

export default function CopyLinkButton({
  url,
  iconSrc,
  iconClassName = '',
  label = 'リンクをコピー',
}: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // アンマウント時にタイマーを掃除
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // 非セキュアコンテキスト等のフォールバック
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // コピー失敗時は何もしない
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`${styles.copyButton} ${iconClassName}`}
      aria-label={copied ? 'コピーしました' : label}
    >
      <Image src={iconSrc} alt="" width={24} height={24} />
      <span
        className={`${styles.tooltip} ${copied ? styles.tooltipVisible : ''}`}
        aria-hidden="true"
      >
        コピーしました
      </span>
    </button>
  );
}
