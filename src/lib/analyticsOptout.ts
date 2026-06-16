// 会社関係者など「計測対象から外したい人」のためのオプトアウト処理。
// ブラウザに Cookie を 1 つ持たせ、その有無で計測タグ（GTM/GA4/Clarity）の
// 読み込みを止める（IP ではなくブラウザ単位の除外なので回線が変わっても効く）。
// Cookie の値は '1' のみで、個人情報は一切保持しない。

export const OPTOUT_COOKIE = 'ag_optout';

// 2 年（秒）。長期保持して、踏み直しの手間を減らす。
const MAX_AGE_SECONDS = 60 * 60 * 24 * 365 * 2;

/** このブラウザが計測オプトアウト中かどうか。SSR では常に false（クライアントで再判定）。 */
export function isOptedOut(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie
    .split('; ')
    .some((entry) => entry === `${OPTOUT_COOKIE}=1`);
}

/** このブラウザを計測対象から外す（除外 Cookie をセット）。 */
export function setOptOut(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${OPTOUT_COOKIE}=1; max-age=${MAX_AGE_SECONDS}; path=/; SameSite=Lax`;
}

/** 計測を元に戻す（除外 Cookie を削除）。 */
export function clearOptOut(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${OPTOUT_COOKIE}=; max-age=0; path=/; SameSite=Lax`;
}
