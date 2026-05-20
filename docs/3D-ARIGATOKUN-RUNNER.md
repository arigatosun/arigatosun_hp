# アリガトクン3D走行演出 — 実装ガイド

## 概要

TOP の Service セクションで、IPキャラクター「アリガトくん」が右→左へ歩く演出を実装している。React Three Fiber + Three.js + drei で組成。

## ステータス

**実装済み**（Phase 18 時点）。粘土風シェーディングの新モデルに差し替え済み。

### 現状の構成

| 要素 | パス | 説明 |
|---|---|---|
| Canvas | `src/components/three/GlobalCanvas.tsx` | ページ全体で 1 つだけのグローバル Canvas（OrthographicCamera）。fixed 配置・pointer-events: none |
| Walker | `src/components/three/WalkingCharacter.tsx` | 汎用の歩行キャラ。`glbPath` を引数で受け取り、対象セクションのスクロール位置に追従して画面端を往復 |
| Footer Bye | `src/components/three/FooterCharacter.tsx` | フッターの手振りキャラ（`arigatokun_bye.glb`） |
| Footer Sit | `src/components/three/FooterSitCharacter.tsx` | フッターの座りキャラ（`arigatokun_sit.glb`） |
| Debug | `src/app/debug/glb/page.tsx` | GLB 単体確認用デバッグページ |

### モデルファイル

| ファイル | サイズ | 用途 | アニメ |
|---|---|---|---|
| **`public/models/arigatokunn_web.glb`** | 14.87MB | **TOP 歩行（現行）** | 歩行ループ 150 フレーム / その場歩行 |
| `public/models/walk.v3.glb` | 23MB | 旧バージョン（保管用） | 同上の旧版 |
| `public/models/arigatokun_bye.glb` | 23MB | フッター手振り | 手振り |
| `public/models/arigatokun_sit.glb` | 23MB | フッター座り | 座り |

### 新モデル `arigatokunn_web.glb` の主な変更点（Blender 担当より）

- ファイルサイズ 24.6MB → **14.87MB**（約 40% 削減）
- メッシュ 1 個に統合（46k vertex / 60k poly）
- マテリアル 3 種:
  - **Procedural Clay**：ボディ・トゲの粘土風（baseColor / Roughness / Normal）
  - **Material.001**：顔の白い部分
  - **マテリアル.003**：目・口の黒単色
- テクスチャは glb 内に埋め込み
- ボーン 59 本（うち deform 56）／ ルートは `root` に統合（旧 `root.00` 廃止）
- IK / コンストレイントはアニメに焼き込み済み（Bake）

### 実装側の注意点

- `WalkingCharacter` は `animations[0]` でアニメ取得 → アニメ名変更の影響なし
- `root.00` 廃止により旧モデル対応の null セーフな分岐ロジックが no-op になるが、互換性のため残置
- 粘土マテリアルは Metallic=0 / Roughness 高めなのでライトは明るめが推奨：
  - 現状: `ambientLight 1.8` + `directionalLight(3,4,8) 1.4` + `fill directional(-4,2,5) 0.6`
  - 沈んで見える場合は HDRI（drei `<Environment />`）の追加も検討

---

## 過去の検討メモ（参考）

> 以下は **GLB 受け取り前の検討段階のメモ**。実装は上の「現状の構成」が正で、ここは仕様/コンポーネント名がずれている。歴史参照として残置。

## Blenderデザイナーへの依頼内容

### 必須要件

- **走行サイクルアニメーション**（ループ可能）を作成
- **In Place（その場走り）** — 水平移動はコード側で制御するため、モデルはその場で走るだけでOK
- **ループ設定** — 最終フレームが最初のフレームに自然に繋がること
- **エクスポート形式**: GLB（アニメーション込み）
- **配置先**: `public/models/arigatokun.glb`（既存ファイルを差し替え）

### 推奨設定

- アクション名: `Run`（任意でOK、コード側で調整可能）
- フレームレート: 30fps
- キャラクターの向き: 進行方向（右方向）を正面とする

### Mixamoは使用不可

アリガトクンは非ヒューマノイドキャラクターのため、Mixamoの自動リグ認識がエラーになる。Blenderでの手動アニメーション作成が必要。

---

## 実装手順（GLB到着後）

### 1. ArigatokunModel コンポーネント

`src/components/three/ArigatokunModel/ArigatokunModel.tsx`

```tsx
'use client';

import { forwardRef, useEffect, useRef } from 'react';
import { useGLTF, useAnimations, Clone } from '@react-three/drei';
import type { Group } from 'three';

const MODEL_PATH = '/models/arigatokun.glb';

const ArigatokunModel = forwardRef<Group>((props, ref) => {
  const { scene, animations } = useGLTF(MODEL_PATH);
  const innerRef = useRef<Group>(null);
  const { actions } = useAnimations(animations, innerRef);

  // 走行アニメーション再生
  useEffect(() => {
    // アクション名はGLBに含まれる名前に合わせる
    const runAction = actions['Run'] || Object.values(actions)[0];
    if (runAction) {
      runAction.play();
    }
  }, [actions]);

  return (
    <group ref={ref} {...props}>
      <group ref={innerRef}>
        <Clone object={scene} />
      </group>
    </group>
  );
});

ArigatokunModel.displayName = 'ArigatokunModel';
useGLTF.preload(MODEL_PATH);

export default ArigatokunModel;
```

`src/components/three/ArigatokunModel/index.ts`

```ts
export { default } from './ArigatokunModel';
```

**ポイント:**
- `Clone` を使用（リグ付きモデルの正しいクローン処理。`<primitive object={scene} />`は2体表示・欠けの原因になる）
- `useAnimations` でGLB内のアニメーションを再生
- `useGLTF.preload` でCanvas前にダウンロード開始

### 2. ArigatokunRunner コンポーネント

`src/components/three/ArigatokunRunner/ArigatokunRunner.tsx`

```tsx
'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { Group } from 'three';
import ArigatokunModel from '@/components/three/ArigatokunModel';

type ArigatokunRunnerProps = {
  speed?: number;       // 走行速度（単位/秒）
  baseY?: number;       // 基準Y座標
  scale?: number;       // モデルスケール
  rotationY?: number;   // 向き調整（ラジアン）
};

export default function ArigatokunRunner({
  speed = 3,
  baseY = -1.5,
  scale = 1,
  rotationY = 0,
}: ArigatokunRunnerProps) {
  const groupRef = useRef<Group>(null);
  const { viewport } = useThree();

  const bounds = useMemo(() => {
    const margin = 3;
    return {
      left: -(viewport.width / 2) - margin,
      right: (viewport.width / 2) + margin,
    };
  }, [viewport.width]);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    const group = groupRef.current;

    // 水平移動（左→右）
    group.position.x += speed * delta;

    // 右端到達 → 左端にリセット（ループ）
    if (group.position.x > bounds.right) {
      group.position.x = bounds.left;
    }
  });

  return (
    <group ref={groupRef} position={[bounds.left, baseY, 0]} scale={scale}>
      <group rotation={[0, rotationY, 0]}>
        <ArigatokunModel />
      </group>
    </group>
  );
}
```

`src/components/three/ArigatokunRunner/index.ts`

```ts
export { default } from './ArigatokunRunner';
```

**ポイント:**
- `useFrame` + `delta` でフレームレート非依存の移動
- `viewport.width` で画面端を動的に計算
- props で速度・位置・スケールを調整可能

### 3. HeroScene コンポーネント

`src/components/three/HeroScene/HeroScene.tsx`

```tsx
'use client';

import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import ArigatokunRunner from '@/components/three/ArigatokunRunner';
import styles from './HeroScene.module.scss';

type HeroSceneProps = {
  className?: string;
};

export default function HeroScene({ className }: HeroSceneProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50, near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} />
          <ArigatokunRunner />
        </Suspense>
      </Canvas>
    </div>
  );
}
```

`src/components/three/HeroScene/HeroScene.module.scss`

```scss
.container {
  width: 100%;
  height: 100%;
}
```

`src/components/three/HeroScene/index.ts`

```ts
export { default } from './HeroScene';
```

**ポイント:**
- `mounted` stateでSSR回避（Next.js App Router対応）
- `alpha: true` で背景透過（ヒーローのテキスト/画像が透けて見える）
- OrbitControlsは不要（pointer-events: noneの環境）
- 既存のSceneコンポーネントは使わない（カメラ設定・コントロールが異なるため）

### 4. page.tsx の変更

`src/app/page.tsx`

```tsx
// import追加（Server ComponentからClient Componentを直接importできる）
import HeroScene from '@/components/three/HeroScene';

// 既存の .heroScene div を変更:
<div className={styles.heroScene}>
  <HeroScene />
</div>
```

**注意:** `next/dynamic` + `ssr: false` はServer Componentでは使用不可。HeroScene内の`mounted` stateがSSR回避を担保する。

---

## 既存のCSS設定（変更不要）

`src/app/page.module.scss` に `.heroScene` が定義済み:

```scss
.heroScene {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;        // heroContent(z-index: 2)の背面を走行
  pointer-events: none;
}
```

キャラクターをテキストの前面に表示したい場合は `z-index: 3` に変更する。

---

## パラメータ調整ガイド

GLBのサイズ・向きはモデルによって異なるため、以下のパラメータを実際の見た目に合わせて調整する:

| パラメータ | 場所 | 説明 | デフォルト |
|-----------|------|------|-----------|
| `speed` | ArigatokunRunner | 走行速度 | 3 |
| `baseY` | ArigatokunRunner | 上下位置 | -1.5 |
| `scale` | ArigatokunRunner | モデルの大きさ | 1 |
| `rotationY` | ArigatokunRunner | キャラの向き（ラジアン） | 0 |
| `fov` | HeroScene Canvas | カメラ画角 | 50 |
| `camera.position[2]` | HeroScene Canvas | カメラ距離 | 10 |

ArigatokunModelにデバッグ用のconsole.log（バウンディングボックス出力）を仕込むと調整しやすい。

---

## パフォーマンス最適化（実装後に検討）

1. **Draco圧縮**: GLBが大きい場合（現在24MB）
   ```bash
   npx @gltf-transform/cli optimize public/models/arigatokun.glb public/models/arigatokun-opt.glb --compress draco
   ```
2. **ローディングUI**: `useProgress` フックでダウンロード進捗表示
3. **モバイル対応**: 画面幅768px未満では3Dを非表示にするフォールバック

---

## 注意事項（実装時に判明した問題）

- **`<primitive object={scene} />`を直接使わない**: リグ付きモデルでは2体表示・半分欠けるバグが発生する。必ず`<Clone object={scene} />`（drei）を使用する
- **Mixamoは使用不可**: 非ヒューマノイドキャラクターのため自動リグ認識がエラーになる
- **既存Sceneコンポーネントは使わない**: OrbitControls・Environment presetが不要、カメラ設定も異なるため、HeroScene専用Canvasを新規作成する
