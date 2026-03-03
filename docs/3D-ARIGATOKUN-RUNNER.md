# アリガトクン3D走行演出 — 実装ガイド

## 概要

トップページヒーローセクションで、IPキャラクター「アリガトクン」が左から右へ走り抜けるループ演出を実装する。

## ステータス

**待ち**: Blenderデザイナーによる走行アニメーション付きGLBの納品待ち

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
