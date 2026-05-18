import { useSyncExternalStore } from 'react';

/**
 * メディアクエリの一致状態を購読するフック。
 *
 * matchMedia を「外部ストア」として useSyncExternalStore で扱うことで、
 * useEffect 内での同期 setState（再レンダリング連鎖の原因）を避ける。
 *
 * @param query - 例: '(min-width: 768px)'
 * @returns query に一致していれば true（サーバー描画時・ハイドレーション時は false）
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
