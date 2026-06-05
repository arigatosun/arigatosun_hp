// オープニング（プリローダー）をセッション中に一度だけ表示するための
// sessionStorage キー（タブ単位）。
//
// Preloader 本体・(site) レイアウトの描画前スクリプト・3D ローダーの
// 「再訪問なら即マウント」判定で共有する。gsap 等を巻き込まないよう、
// 依存のない単独モジュールに置いて単一ソース化している。
export const PRELOADER_SESSION_KEY = 'arigatosun:preloaded';
