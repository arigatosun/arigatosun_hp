/**
 * SlimeGlow 標準プリセット。
 * サービスページ「アリガトサン・スタンダード」セクションで使われる
 * 不定形の赤グローのパラメータ。サイト内で同じ見た目を再利用する時はこれを渡す。
 *
 * @example
 *   <SlimeGlow {...SLIME_GLOW_STANDARD} />
 *   // 形ごとにクリップしたい場合は GlowImage 経由で:
 *   <GlowImage src="..." mask={...} />  // 既定でこのプリセットが内部適用される
 */
export const SLIME_GLOW_STANDARD = {
  color: '#DA2719',
  radiusRatio: 0.28,
  subBlobCount: 7,
  maxOpacity: 0.22,
  followSpeed: 0.04,
  cursorBlend: 0.85,
  releaseMs: 900,
  driftSpeed: 0.00018,
  coreBoost: 1.5,
  gradientFalloff: 2.2,
  intensityVariance: 0.6,
  /** 約 28 秒で 1 サイクルのゆっくり呼吸 */
  breathSpeed: 0.00022,
  /** ±25% で塊全体が大小変化 */
  breathAmount: 0.25,
} as const;
