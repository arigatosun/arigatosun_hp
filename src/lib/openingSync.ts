// オープニング(Preloader)とヒーロー3D(HeroResponsiveCharacter)の準備を同期させる
// クライアント専用の共有モジュール。
//
// 目的: 「オープニングは終わったのに TOP の 3D がまだ表示されていない」を防ぐ。
//   - Preloader は従来 window 'load' だけを完了条件にしていたが、3D(GLB)は
//     ハイドレーション後に非同期取得されるため load では待たれず、ズレが生じていた。
//   - 本モジュールでヒーロー3Dの「初回描画完了」を Preloader に通知し、オープニングを
//     3D 準備完了まで待たせる（Preloader 側に最大表示時間のフェイルセーフあり）。

import { PRELOADER_SESSION_KEY } from '@/components/ui/Preloader/sessionKey';

// この読み込みでオープニングが出るか（= 初回訪問 かつ privacy 以外）を、
// モジュール評価時に一度だけスナップショットする。
// Preloader が sessionStorage にキーを書く（effect 内）より前に評価されるため、
// 訪問前の状態を正しく捉えられる（effect 実行順に依存しない）。
let openingWillPlay = false;
if (typeof window !== 'undefined') {
  try {
    openingWillPlay =
      !window.sessionStorage.getItem(PRELOADER_SESSION_KEY) &&
      window.location.pathname !== '/privacy';
  } catch {
    openingWillPlay = false;
  }
}

/** この読み込みでオープニングが再生されるか（初回訪問 & not privacy）。 */
export function willOpeningPlay(): boolean {
  return openingWillPlay;
}

let heroReady = false;
const heroReadyListeners = new Set<() => void>();

/** ヒーロー3Dの初回描画が完了した時に呼ぶ（FooterCharacter の ReadySignal 経由）。 */
export function markHeroReady(): void {
  if (heroReady) return;
  heroReady = true;
  heroReadyListeners.forEach((cb) => cb());
  heroReadyListeners.clear();
}

/** ヒーロー3Dが準備完了済みか。 */
export function isHeroReady(): boolean {
  return heroReady;
}

/**
 * ヒーロー3Dの準備完了を購読する。既に完了済みなら即時にコールバックを呼ぶ。
 * 返り値は購読解除関数。
 */
export function onHeroReady(cb: () => void): () => void {
  if (heroReady) {
    cb();
    return () => {};
  }
  heroReadyListeners.add(cb);
  return () => {
    heroReadyListeners.delete(cb);
  };
}
