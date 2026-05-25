/**
 * Figma SP（フレーム 390 基準）の About 周辺モチーフ位置データ。
 * 出典: Figma node 2599:24677 (Group 933) — 17 個の Vector + ABOUT テキスト。
 *
 * Group 933 は Figma フレーム上で x=-209, y=1244, width=803, height=863 に配置されている。
 * 各モチーフの x/y は Figma フレーム絶対座標。
 * src: 個別 SVG（事前に Figma からダウンロード済み → public/images/sections/about/motifs-sp/）。
 * rotation: Figma 上での回転（deg）。
 */
export type SpMotif = {
  id: string;
  src: string;
  /** Figma フレーム上の AABB 左端 x（px） */
  frameX: number;
  /** Figma フレーム上の AABB 上端 y（px） */
  frameY: number;
  /** AABB 幅（px） */
  width: number;
  /** AABB 高さ（px） */
  height: number;
  /** 回転（deg） */
  rotation: number;
  /** SVG のネイティブ viewBox 幅（drop shadow 含む） */
  nativeW: number;
  /** SVG のネイティブ viewBox 高さ（drop shadow 含む） */
  nativeH: number;
};

/** Group 933 コンテナの Figma フレーム位置・サイズ */
export const SP_MOTIFS_CONTAINER = {
  frameX: -209,
  frameY: 1244,
  width: 803,
  height: 863,
} as const;

export const SP_MOTIFS: SpMotif[] = [
  { id: 'v1',  src: '/images/sections/about/motifs-sp/motif-01.svg', frameX: 303.15, frameY: 2006.17, width: 115.15, height: 132.49, rotation: 148.46,  nativeW: 183.681, nativeH: 236.366 },
  { id: 'v2',  src: '/images/sections/about/motifs-sp/motif-02.svg', frameX: 303.00, frameY: 1958.78, width: 291.18, height: 175.98, rotation: -23.93,  nativeW: 332.312, nativeH: 105.681 },
  { id: 'v3',  src: '/images/sections/about/motifs-sp/motif-03.svg', frameX: 290.51, frameY: 1362.37, width: 127.53, height: 87.74,  rotation: 77.28,   nativeW: 105.68,  nativeH: 158.366 },
  { id: 'v4',  src: '/images/sections/about/motifs-sp/motif-04.svg', frameX: 264.23, frameY: 1481.97, width: 189.50, height: 173.49, rotation: -40.02,  nativeW: 313.965, nativeH: 183.681 },
  { id: 'v5',  src: '/images/sections/about/motifs-sp/motif-05.svg', frameX: 504.19, frameY: 1346.74, width: 202.51, height: 209.62, rotation: 79.96,   nativeW: 224.176, nativeH: 215.401 },
  { id: 'v6',  src: '/images/sections/about/motifs-sp/motif-06.svg', frameX: 479.37, frameY: 1310.22, width: 166.93, height: 103.28, rotation: 166.18,  nativeW: 275.134, nativeH: 188.193 },
  { id: 'v7',  src: '/images/sections/about/motifs-sp/motif-07.svg', frameX: 532.41, frameY: 1574.68, width: 298.14, height: 208.55, rotation: 90,      nativeW: 328.54,  nativeH: 418.129 },
  { id: 'v8',  src: '/images/sections/about/motifs-sp/motif-08.svg', frameX: 173.36, frameY: 1739.42, width: 317.36, height: 244.42, rotation: -92.31,  nativeW: 352.183, nativeH: 428.257 },
  { id: 'v9',  src: '/images/sections/about/motifs-sp/motif-09.svg', frameX: 285.26, frameY: 2054.69, width: 334.92, height: 320.77, rotation: -128.36, nativeW: 310.095, nativeH: 396.673 },
  { id: 'v10', src: '/images/sections/about/motifs-sp/motif-10.svg', frameX: 81.71,  frameY: 1609.04, width: 69.09,  height: 69.09,  rotation: -62.28,  nativeW: 93.1605, nativeH: 93.1605 },
  { id: 'v11', src: '/images/sections/about/motifs-sp/motif-11.svg', frameX: 167.43, frameY: 2088.46, width: 297.70, height: 235.46, rotation: -155.77, nativeW: 383.653, nativeH: 259.557 },
  { id: 'v12', src: '/images/sections/about/motifs-sp/motif-12.svg', frameX: 201.44, frameY: 1866.44, width: 71.23,  height: 71.23,  rotation: -55.11,  nativeW: 111.16,  nativeH: 111.161 },
  { id: 'v13', src: '/images/sections/about/motifs-sp/motif-13.svg', frameX: -29.53, frameY: 1543.99, width: 349.96, height: 384.41, rotation: 57.91,   nativeW: 362.897, nativeH: 253.842 },
  { id: 'v14', src: '/images/sections/about/motifs-sp/motif-14.svg', frameX: -72.00, frameY: 1792.39, width: 224.57, height: 92.12,  rotation: -81.1,   nativeW: 179.105, nativeH: 338.052 },
  { id: 'v15', src: '/images/sections/about/motifs-sp/motif-15.svg', frameX: -29.52, frameY: 1500.29, width: 119.21, height: 95.92,  rotation: -65.31,  nativeW: 164.834, nativeH: 117.37 },
  { id: 'v16', src: '/images/sections/about/motifs-sp/motif-16.svg', frameX: 176.99, frameY: 1965.93, width: 115.00, height: 114.39, rotation: 135.52,  nativeW: 125.563, nativeH: 179.807 },
  { id: 'v17', src: '/images/sections/about/motifs-sp/motif-17.svg', frameX: 334.86, frameY: 2044.55, width: 133.86, height: 98.16,  rotation: 107.26,  nativeW: 117.37,  nativeH: 164.834 },
];
