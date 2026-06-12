'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { uploadNewsImage } from '../../../../_actions/upload';
import { generateNewsImage } from '../../../../_actions/ai-image';
import styles from './ImageUploader.module.scss';

interface ImageUploaderProps {
  name: string;
  defaultValue?: string | null;
  label?: string;
  // AI 生成の初期プロンプト候補（あると「AIで生成」ボタンを表示）
  aiPrompt?: string;
  aiAspectRatio?: string;
  onValueChange?: () => void;
  onBusyChange?: (busy: boolean) => void;
}

export default function ImageUploader({
  name,
  defaultValue,
  label = '画像',
  aiPrompt,
  aiAspectRatio = '16:9',
  onValueChange,
  onBusyChange,
}: ImageUploaderProps) {
  const [url, setUrl] = useState<string | null>(defaultValue ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const isInitialRenderRef = useRef(true);

  const setImageUrl = (nextUrl: string | null) => {
    if (hiddenRef.current) {
      hiddenRef.current.value = nextUrl ?? '';
    }
    setUrl(nextUrl);
  };

  useEffect(() => {
    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false;
      return;
    }
    onValueChange?.();
  }, [onValueChange, url]);

  useEffect(() => {
    onBusyChange?.(isUploading);
  }, [isUploading, onBusyChange]);

  const handleAiGenerate = () => {
    const prompt = window.prompt(
      '生成したい画像の内容（英語推奨）',
      aiPrompt ?? '',
    );
    if (!prompt || !prompt.trim()) return;
    setError(null);
    setIsUploading(true);
    void (async () => {
      try {
        const result = await generateNewsImage(prompt.trim(), aiAspectRatio);
        if (result.ok) {
          setImageUrl(result.url);
        } else {
          setError(result.error);
        }
      } catch {
        setError('画像の処理に失敗しました。時間をおいて再度お試しください。');
      } finally {
        setIsUploading(false);
      }
    })();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setIsUploading(true);
    void (async () => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const result = await uploadNewsImage(formData);
        if (result.ok) {
          setImageUrl(result.url);
        } else {
          setError(result.error);
        }
        if (inputRef.current) inputRef.current.value = '';
      } catch {
        setError('画像の処理に失敗しました。時間をおいて再度お試しください。');
      } finally {
        setIsUploading(false);
      }
    })();
  };

  const handleRemove = () => {
    setImageUrl(null);
    setError(null);
  };

  return (
    <div className={styles.root}>
      {url && (
        <div className={styles.preview}>
          <Image
            src={url}
            alt={`${label} プレビュー`}
            width={320}
            height={180}
            className={styles.previewImg}
            unoptimized
          />
          <button type="button" onClick={handleRemove} className={styles.removeBtn}>
            削除
          </button>
        </div>
      )}
      <div className={styles.controls}>
        <label className={styles.uploadBtn}>
          {isUploading ? '処理中...' : url ? '別の画像をアップロード' : '画像をアップロード'}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className={styles.fileInput}
            disabled={isUploading}
          />
        </label>
        <button
          type="button"
          className={styles.aiBtn}
          onClick={handleAiGenerate}
          disabled={isUploading}
        >
          {isUploading ? '生成中...' : '✦ AIで生成'}
        </button>
        <span className={styles.hint}>jpg / png / webp / gif、5MB 以下</span>
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <input ref={hiddenRef} type="hidden" name={name} defaultValue={url ?? ''} />
    </div>
  );
}
