// 座って静止 + カーソル追従キャラの調整パラメータ。
// 数値変更だけでチューニングできるよう、ロジック本体（FooterSitCharacter）からは
// この const オブジェクト経由でのみアクセスする。
export const CURSOR_FOLLOW_CONFIG = {
  // ボーン配分（合計が 1 を超えないようにすると見た目が安定する）
  weights: {
    spine: 0.7,
    head: 0.25,
    hips: 0.0,
  },
  // 可動域（度）。yaw=左右、pitch=上下
  limits: {
    spine: { yawDeg: 35, pitchDeg: 20 },
    head: { yawDeg: 25, pitchDeg: 15 },
  },
  // slerp 補間係数。大きいほどキビキビ、小さいほどヌルッと
  slerpFactor: 0.04,
  // 不感帯（NDC マウス座標の半径）。中央付近の微小揺れを無視する
  deadzone: 0.05,
  // マウスから生成する基準角の最大値（度）。
  // ここで生成した角度をソフトクランプして可動域に収める。
  // 大きいほどカーソル端で大きく振り、小さいほど穏やか。
  baseAngleDeg: 90,
} as const;

export type CursorFollowConfig = typeof CURSOR_FOLLOW_CONFIG;
