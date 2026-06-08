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
  // ── アイドル動作（SP のみ）──
  // タッチしていない間、上下を主体に「自由に動いている」揺れを出す。
  // タッチ追従が優先で、最後の操作から resumeDelayMs 経過後にアイドルへ復帰する。
  // 値は base angle（度）空間で与え、追従と同じ softClamp + weights を通すので可動域内に収まる。
  // 自然さのため周波数の異なる2サインを合成する（単調な往復に見せない）。
  idle: {
    resumeDelayMs: 1200, // 最後のポインタ操作からこの時間後にアイドル復帰
    pitch: { ampDeg: 12, speed: 0.5, ampDeg2: 6, speed2: 0.23, phase2: 1.3 }, // 上下（主）
    yaw: { ampDeg: 9, speed: 0.37, ampDeg2: 4, speed2: 0.17, phase: 0.5 }, // 左右（副）
  },
} as const;

export type CursorFollowConfig = typeof CURSOR_FOLLOW_CONFIG;
