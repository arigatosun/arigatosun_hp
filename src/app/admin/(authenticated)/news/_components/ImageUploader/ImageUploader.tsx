'use client';

import { useState, useTransition, useRef } from 'react';
import Image from 'next/image';
import { uploadNewsImage } from '../../../../_actions/upload';
import styles from './ImageUploader.module.scss';

interface ImageUploaderProps {
  name: string;
  defaultValue?: string | null;
  label?: string;
}

export default function ImageUploader({ name, defaultValue, label = '画像' }: ImageUploaderProps) {
  const [url, setUrl] = useState<string | null>(defaultValue ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, startUpload] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    startUpload(async () => {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadNewsImage(formData);
      if (result.ok) {
        setUrl(result.url);
      } else {
        setError(result.error);
      }
      if (inputRef.current) inputRef.current.value = '';
    });
  };

  const handleRemove = () => {
    setUrl(null);
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
          {isUploading ? 'アップロード中...' : url ? '別の画像をアップロード' : '画像をアップロード'}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className={styles.fileInput}
            disabled={isUploading}
          />
        </label>
        <span className={styles.hint}>jpg / png / webp / gif、5MB 以下</span>
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <input type="hidden" name={name} value={url ?? ''} />
    </div>
  );
}
