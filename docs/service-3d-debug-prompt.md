# サービスセクションに3Dキャラクター（GLB）が表示されない問題 — DeepResearch用プロンプト

## 概要

Next.js 16 + React Three Fiber のプロジェクトで、同一ページ内に **2つの独立した `<Canvas>`** を配置しています。
**ヒーローセクション**の `<Canvas>` では GLBモデル（`arigatokun_walk.glb`）が正常に表示されますが、
**サービスセクション**の `<Canvas>` では同じ GLBモデルが一切表示されません。

テスト用の `<boxGeometry>` + `<meshStandardMaterial>` は サービスセクション側の Canvas でも正常に描画されることを確認済みです。
つまり **Canvas自体は動作しているが、GLBモデルの読み込み・描画のみが失敗** しています。

---

## 技術スタック

| 項目 | バージョン |
|---|---|
| Next.js | 16.1.6 (App Router, Turbopack) |
| React | 19.x |
| @react-three/fiber | ^9.5.0 |
| @react-three/drei | ^10.7.7 |
| three | ^0.183.2 |
| @types/three | ^0.183.1 |
| OS | Windows 11 |
| Node.js | npm使用 |

---

## プロジェクト構造

```
src/
├── app/
│   ├── page.tsx                    ← トップページ（Server Component）
│   └── page.module.scss
├── components/
│   ├── ui/
│   │   ├── HeroAnimation/         ← ✅ 正常に動作
│   │   │   ├── HeroAnimation.tsx   ← Canvas + RunningCharacter を含む
│   │   │   ├── HeroAnimationLoader.tsx ← dynamic import (ssr: false)
│   │   │   ├── RunningCharacter.tsx ← useGLTF + useAnimations + SkeletonUtils.clone
│   │   │   ├── HeroAnimation.module.scss
│   │   │   └── index.ts           ← HeroAnimationLoader をエクスポート
│   │   ├── ServiceSection/         ← ❌ GLBが表示されない
│   │   │   ├── ServiceSection.tsx  ← GSAP ScrollTrigger横スクロール
│   │   │   ├── ServiceAnimation.tsx ← Canvas + WalkingCharacter
│   │   │   ├── ServiceAnimationLoader.tsx ← dynamic import (ssr: false)
│   │   │   └── ServiceSection.module.scss
public/
├── models/
│   ├── arigatokun_walk.glb         ← 24.6MB、ヒーロー側では正常読み込み
│   ├── arigatokun.glb
│   ├── arigatokun.run.glb
│   ├── arigatokun_bye.glb
│   └── arigatokun_sit.glb
```

---

## 正常に動作するヒーロー側の実装

### page.tsx での配置

```tsx
// page.tsx (Server Component)
import HeroAnimation from '@/components/ui/HeroAnimation';

<section className={styles.hero}>
  {/* コンテンツ */}
  <div className={styles.heroScene}>
    <HeroAnimation />
  </div>
</section>
```

### HeroAnimation/index.ts

```ts
export { default } from './HeroAnimationLoader';
```

### HeroAnimationLoader.tsx

```tsx
'use client';
import dynamic from 'next/dynamic';

const HeroAnimation = dynamic(() => import('./HeroAnimation'), {
  ssr: false,
});

export default function HeroAnimationLoader() {
  return <HeroAnimation />;
}
```

### HeroAnimation.tsx（Canvas部分のみ抜粋）

```tsx
'use client';
import { Canvas } from '@react-three/fiber';
import RunningCharacter from './RunningCharacter';

// ... 中略 ...

<div className={styles.canvas}>
  <Canvas
    camera={{ position: [0, 0, 8], fov: 50 }}
    gl={{ antialias: true, alpha: true }}
    style={{ background: 'transparent' }}
  >
    <ambientLight intensity={0.8} />
    <directionalLight position={[5, 5, 5]} intensity={1.5} />
    <RunningCharacter ... />
  </Canvas>
</div>
```

### RunningCharacter.tsx

```tsx
'use client';
import { useGLTF, useAnimations } from '@react-three/drei';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';

export default function RunningCharacter({ ... }) {
  const { scene, animations } = useGLTF('/models/arigatokun_walk.glb');
  const clonedScene = useMemo(() => skeletonClone(scene), [scene]);
  const { actions } = useAnimations(animations, group);
  // ... アニメーション再生、useFrameで移動 ...
  return (
    <group ref={group} position={[START_X, -3.5, 0]} rotation={[0, Math.PI * 0.5, 0]} scale={1.8}>
      <primitive object={clonedScene} />
    </group>
  );
}
useGLTF.preload('/models/arigatokun_walk.glb');
```

### CSS（heroScene）

```scss
.heroScene {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}
```

**ポイント**: `.hero` セクションは `min-height: 100vh` で高さが確保されている。GSAP ScrollTrigger の pin は使っていない。

---

## 問題のあるサービスセクション側の実装

### page.tsx での配置

```tsx
import ServiceAnimationLoader from '@/components/ui/ServiceSection/ServiceAnimationLoader';

<div className={styles.serviceWrapper}>
  <ServiceSection />
  <div className={styles.serviceScene}>
    <ServiceAnimationLoader />
  </div>
</div>
```

### CSS（serviceScene）

```scss
.serviceWrapper {
  position: relative;
}
.serviceScene {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10;
  pointer-events: none;
}
```

### ServiceAnimationLoader.tsx

```tsx
'use client';
import dynamic from 'next/dynamic';

const ServiceAnimation = dynamic(() => import('./ServiceAnimation'), {
  ssr: false,
});

export default function ServiceAnimationLoader() {
  return <ServiceAnimation />;
}
```

### ServiceAnimation.tsx（現在の実装）

```tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';

function WalkingCharacter() {
  const group = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const [clonedScene, setClonedScene] = useState<THREE.Group | null>(null);
  const isRunning = useRef(false);

  const START_X = 15;
  const END_X = -25;
  const SPEED = 4.5;

  // GLTFLoaderで直接読み込み（useGLTFのキャッシュを完全にバイパス）
  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load('/models/arigatokun_walk.glb', (gltf) => {
      const scene = skeletonClone(gltf.scene);
      setClonedScene(scene);

      if (gltf.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(scene);
        const action = mixer.clipAction(gltf.animations[0]);
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.play();
        mixerRef.current = mixer;
      }

      setTimeout(() => {
        isRunning.current = true;
      }, 500);
    });

    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    };
  }, []);

  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
    if (!isRunning.current || !group.current) return;
    group.current.position.x -= SPEED * delta;
    if (group.current.position.x < END_X) {
      isRunning.current = false;
      setTimeout(() => {
        if (group.current) {
          group.current.position.x = START_X;
          isRunning.current = true;
        }
      }, 6000);
    }
  });

  if (!clonedScene) return null;

  return (
    <group ref={group} position={[START_X, -3.5, 0]} rotation={[0, -Math.PI * 0.5, 0]} scale={1.8}>
      <primitive object={clonedScene} />
    </group>
  );
}

export default function ServiceAnimation() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <WalkingCharacter />
      </Canvas>
    </div>
  );
}
```

---

## 試したが改善されなかったアプローチ

### 1. ServiceSection内にabsolute配置でCanvas追加（最初の試み）
- `.inner` 内に `position: absolute` の div + Canvas を配置
- **結果**: 表示されず。GSAP ScrollTriggerの `pin: true` がDOM構造を変更（pin-spacer wrapper追加）し、absolute配置の基準が失われた

### 2. forwardRef + refでScrollTrigger連動
- `ServiceCharacterCanvas` を `forwardRef` で作成、`ServiceCharacterLoader` 経由でrefを渡す
- ScrollTrigger の `onUpdate` で `characterRef.current.style.opacity` を制御
- **結果**: 表示されず。dynamic importチェーンでforwardRefが正しく伝播しない

### 3. position: fixed でビューポート全体に配置
- `ServiceCharacterCanvas` を `position: fixed; top:0; left:0; width:100vw; height:100vh` で配置
- **結果**: Canvasは存在するがGLBモデルが表示されない（TestBoxは表示される）

### 4. useGLTF のキャッシュバイパス（クエリパラメータ）
- `useLoader(GLTFLoader, '/models/arigatokun_walk.glb?service')` でキャッシュ回避
- **結果**: 表示されず

### 5. GLTFLoader直接使用（useGLTF完全バイパス）
- `new GLTFLoader().load(...)` で手動読み込み、`AnimationMixer` も手動作成
- `SkeletonUtils.clone` でシーンを複製
- **結果**: 表示されず

### 6. page.tsxレベルに配置変更
- ServiceSection内部ではなく、page.tsx で ServiceSection と同階層に配置
- ヒーローの HeroAnimationLoader と全く同じ dynamic import パターン
- **結果**: 表示されず

---

## 確認済みの事実

1. **Canvas自体は動作する**: `<boxGeometry>` + `<meshStandardMaterial>` の赤い回転する箱は表示される
2. **HTML div要素も表示される**: 赤い四角の `<div>` はサービスセクション上に表示される
3. **ヒーロー側は正常**: 同じ `arigatokun_walk.glb` がヒーローセクションのCanvasでは正常に表示・アニメーション再生される
4. **GLBファイルは健全**: 24.6MB、ヒーロー側で正常動作
5. **ビルドエラーなし**: `npm run build` は全て成功
6. **ブラウザコンソールエラー**: 未確認（ユーザーに確認依頼が必要）

---

## 仮説（未検証）

1. **WebGLコンテキスト間のリソース共有問題**:
   - `useGLTF` がグローバルにGLTFをキャッシュし、最初のCanvas（ヒーロー）のWebGLコンテキストでテクスチャ/バッファを生成
   - 2つ目のCanvas（サービス）は別のWebGLコンテキストを持つため、キャッシュされたリソースを使えない
   - `GLTFLoader` 直接使用でも Three.js 内部の `Cache` が残っている可能性

2. **Three.js グローバルキャッシュ**:
   - `THREE.Cache.enabled` がデフォルトで `true` の場合、同じURLのリクエストがキャッシュされ、最初のコンテキストのリソースが返される
   - `THREE.Cache.remove('/models/arigatokun_walk.glb')` や `THREE.Cache.clear()` が必要かもしれない

3. **テクスチャ / マテリアルのコンテキスト依存**:
   - GLBに含まれるテクスチャが最初のCanvas用にコンパイルされ、2つ目のCanvasでは無効になっている
   - 読み込み後に全マテリアルの `needsUpdate = true` を設定する必要があるかもしれない

4. **React Three Fiber のグローバルステート**:
   - R3F が内部的にシーングラフやリソースをグローバルに管理しており、2つのCanvas間で競合が発生

---

## 求める回答

1. **根本原因の特定**: なぜ同じページの2つ目のCanvasでGLBモデルが表示されないのか
2. **具体的な解決コード**: ServiceAnimation.tsx の修正版（コピペで動くレベル）
3. **注意点**: 同一ページで複数のR3F Canvasを使用する際のベストプラクティス

---

## 環境再現手順

1. Next.js 16 (App Router) + @react-three/fiber 9.5 + drei 10.7 + three 0.183
2. 1つ目のCanvasで `useGLTF` + `SkeletonUtils.clone` でGLBを表示（正常動作）
3. 2つ目のCanvasで同じGLBを `new GLTFLoader().load()` で読み込み表示（失敗）
4. 2つ目のCanvasで `<boxGeometry>` は正常に表示される
