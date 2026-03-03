# サービスセクション 実装計画書

## 1. 概要

TOPページのサービスセクションは、縦スクロールに連動して右側のサービスカードが横方向にスライドする演出を持つ、複合的なセクションである。左側はstickyで固定され、スクロール進行に応じてアクティブなメニュー項目が切り替わる。アリガトクン（3Dキャラクター）がカードと共に走る演出も含む。

---

## 2. レイアウト構成

```
┌─────────────────────────────────────────────────────┐
│ 赤モチーフ（z-index: 最背面付近、カード上にも重なる）    │
│                                                       │
│  ┌──────────────┐  ┌─────────────────────────────┐   │
│  │  左側（sticky）│  │  右側（横スクロールカード）    │   │
│  │              │  │  ┌────────┐ ┌────────┐      │   │
│  │  サービスロゴ  │  │  │ Card 1 │ │ Card 2 │ ... │   │
│  │  SERVICE     │  │  │        │ │        │      │   │
│  │  説明文      │  │  └────────┘ └────────┘      │   │
│  │  メニュー3つ  │  │                              │   │
│  │  VIEWボタン   │  │     🐷 アリガトクン（前面）    │   │
│  └──────────────┘  └─────────────────────────────┘   │
│                                                       │
│  ┌─ uemask.png（上装飾）─────────────────────────┐   │
│  └─ sitamask.png（下装飾）───────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 3. Z-index レイヤー構成（手前→奥）

| レイヤー | 要素 | z-index |
|---------|------|---------|
| 最前面 | アリガトクン（3Dモデル） | 5 |
| 前面 | 赤モチーフ（ParallaxMotifs） | 4 |
| 中間 | サービスカード群 | 3 |
| 中間 | overlay.png（カード上のオーバーレイ） | 2 |
| 背面 | 白装飾図形（uemask / sitamask） | 1 |
| 最背面 | 左側テキスト・メニュー | 0（通常フロー） |

---

## 4. 素材ファイル一覧

| ファイル | パス | 用途 |
|---------|------|------|
| servicetitlelogo.png | /images/top/ | サービスタイトルロゴ画像 |
| backgroundcard.png | /images/top/ | カード背景画像 |
| overlay.png | /images/top/ | カード上のオーバーレイ画像 |
| uemask.png | /images/top/ | 上部装飾マスク |
| sitamask.png | /images/top/ | 下部装飾マスク |
| motifs.svg | /images/top/ | 赤モチーフ（既存ParallaxMotifs） |
| ありがとくんNEW.glb | /models/ | 3Dキャラクターモデル（リグ付き） |

---

## 5. スクロール連動の仕組み

### 5.1 GSAP ScrollTrigger + pinning

```
縦スクロール量 → 横スクロール変換

[スクロール開始] ─────────────────────── [スクロール終了]
     │                                        │
     ▼                                        ▼
  Card 1 表示                            Card 3 表示
  メニュー: AI/DEV アクティブ             メニュー: IP/CREATIVE アクティブ
  アリガトクン: 左寄り                    アリガトクン: 右寄り
```

- **トリガー**: サービスセクション全体
- **pin**: セクション全体をスクロール中に画面固定
- **横移動**: カードコンテナをtranslateXでスライド
- **scrub**: 縦スクロール量に滑らかに連動
- **スクロール距離**: カード枚数 × カード幅 + gap 分の縦スクロール量を確保

### 5.2 左側メニューのアクティブ切り替え

- スクロール進行率を3等分（カード3枚の場合）
- 0%〜33%: AI / DEVELOPMENT がアクティブ
- 33%〜66%: DESIGN / BRANDING がアクティブ
- 66%〜100%: IP / CREATIVE がアクティブ
- アクティブ時: 白文字 + 赤背景（#DA2719）
- 通常時: #808080 テキスト
- ホバー時: 白文字 + 赤背景

### 5.3 アリガトクン走行演出

- React Three Fiber で3Dモデルをレンダリング
- GLBファイル（リグ付き・アニメーションなし）を読み込み
- スクロール進行に合わせてX座標を移動（左→右に走る）
- リグのボーンをコード側で制御して走るポーズ/動きを作成
- カード群の手前（最前面レイヤー）に表示

---

## 6. コンポーネント設計

### 6.1 新規作成コンポーネント

```
src/components/
├── ui/
│   └── ServiceSection/
│       ├── ServiceSection.tsx        # メインコンテナ（GSAP制御）
│       ├── ServiceSection.module.scss
│       ├── ServiceCard.tsx           # 個別カードコンポーネント
│       ├── ServiceCard.module.scss
│       └── index.ts
└── three/
    └── ArigatokunRunner/
        ├── ArigatokunRunner.tsx       # 3Dキャラ走行演出
        └── index.ts
```

### 6.2 ServiceSection.tsx 構造

```tsx
<section className={styles.service} ref={sectionRef}>
  {/* 上部装飾マスク */}
  <Image src="/images/top/uemask.png" className={styles.decoTop} />

  <div className={styles.inner}>
    {/* 左側: sticky */}
    <div className={styles.left}>
      <Image src="/images/top/servicetitlelogo.png" />
      <p className={styles.label}>SERVICE</p>
      <div className={styles.description}>...</div>
      <ul className={styles.menuList}>
        <li className={activeIndex === 0 ? styles.active : ''}>・AI / DEVELOPMENT ></li>
        <li className={activeIndex === 1 ? styles.active : ''}>・DESIGN / BRANDING ></li>
        <li className={activeIndex === 2 ? styles.active : ''}>・IP / CREATIVE ></li>
      </ul>
      <Button href="/service">VIEW SERVICE ></Button>
    </div>

    {/* 右側: 横スクロールカード */}
    <div className={styles.right} ref={cardsRef}>
      <div className={styles.cardsTrack}>
        {cards.map(card => <ServiceCard key={card.id} {...card} />)}
      </div>
    </div>
  </div>

  {/* アリガトクン（3D） */}
  <ArigatokunRunner progress={scrollProgress} />

  {/* 下部装飾マスク */}
  <Image src="/images/top/sitamask.png" className={styles.decoBottom} />
</section>
```

### 6.3 ServiceCard.tsx 構造

```tsx
<div className={styles.card}>
  {/* 背景画像 */}
  <Image src="/images/top/backgroundcard.png" className={styles.bgImage} />

  {/* オーバーレイ */}
  <Image src="/images/top/overlay.png" className={styles.overlay} />

  {/* グラデーションオーバーレイ */}
  <div className={styles.gradient} />

  {/* カード内コンテンツ */}
  <div className={styles.content}>
    {/* VIEW ボタン（カード上部・赤背景） */}
    <div className={styles.viewButton}>VIEW AI / DEVELOPMENT ></div>

    {/* カード下部情報 */}
    <div className={styles.info}>
      <p className={styles.categoryLabel}>AI・開発</p>
      <h3 className={styles.cardTitle}>AI / DEVELOPMENT</h3>
      <p className={styles.cardDescription}>ここに簡易的な説明文が入ります。...</p>
    </div>
  </div>
</div>
```

---

## 7. スタイル仕様

### 7.1 カードスタイル

```scss
// カード本体
width: 630px;
height: 860px;
opacity: 0.85;
background: linear-gradient(180deg, rgba(0, 0, 0, 0.50) 0%, #000 62.02%);
background-blend-mode: multiply;
mix-blend-mode: multiply;
overflow: hidden;
position: relative;
```

### 7.2 カード内コンテンツ

```scss
// VIEW ボタン（カード上部）
color: #FFF;
font-family: var(--font-en); // mozaic-geo-variable
font-size: 28px;
font-weight: 300;
line-height: 26px;
letter-spacing: 3.64px;
background-color: #DA2719; // 赤塗り背景

// カテゴリラベル
color: #FFF;
font-family: 'Noto Sans JP';
font-size: 16px;
font-weight: 400;
line-height: 32px;
letter-spacing: 2.08px;

// カードタイトル（ラベルの19px下）
color: #FFF;
font-family: var(--font-en);
font-size: 34px;
font-weight: 300;
line-height: 24px;
letter-spacing: 4.42px;

// 説明文（タイトルの19px下）
color: #FFF;
font-family: 'Noto Sans JP';
font-size: 16px;
font-weight: 400;
line-height: 30px;
letter-spacing: 2.08px;
```

### 7.3 左側コンテンツ

```scss
// SERVICE ラベル
color: #808080;
font-family: var(--font-en);
font-size: 20px;
font-weight: 300;
line-height: 24px;
letter-spacing: 2.6px;

// 説明文
color: #140700; // var(--color-black)
font-family: 'Noto Sans JP';
font-size: 24px;
font-weight: 400;
line-height: 52px;
letter-spacing: 3.12px;

// メニューリスト（通常時）
color: #808080;
font-family: var(--font-en);
font-size: 20px;
font-weight: 300;
line-height: 24px;
letter-spacing: 2.6px;

// メニューリスト（アクティブ / ホバー時）
color: #FFF;
background-color: #DA2719;
```

---

## 8. データ構造

```typescript
type ServiceCard = {
  id: string;
  category: string;        // メニュー対応カテゴリ
  categoryLabel: string;   // カード内表示ラベル（例: 「AI・開発」）
  title: string;           // カードタイトル（例: 「AI / DEVELOPMENT」）
  description: string;     // 説明文
  viewLabel: string;       // VIEWボタンラベル（例: 「VIEW AI / DEVELOPMENT >」）
  bgImage: string;         // 背景画像パス
};

// 初期データ（3枚）
const SERVICE_CARDS: ServiceCard[] = [
  {
    id: 'ai-dev',
    category: 'AI / DEVELOPMENT',
    categoryLabel: 'AI・開発',
    title: 'AI / DEVELOPMENT',
    description: 'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
    viewLabel: 'VIEW AI / DEVELOPMENT >',
    bgImage: '/images/top/backgroundcard.png',
  },
  {
    id: 'design-branding',
    category: 'DESIGN / BRANDING',
    categoryLabel: 'デザイン・ブランディング',
    title: 'DESIGN / BRANDING',
    description: 'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
    viewLabel: 'VIEW DESIGN / BRANDING >',
    bgImage: '/images/top/backgroundcard.png',
  },
  {
    id: 'ip-creative',
    category: 'IP / CREATIVE',
    categoryLabel: 'IP・クリエイティブ',
    title: 'IP / CREATIVE',
    description: 'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
    viewLabel: 'VIEW IP / CREATIVE >',
    bgImage: '/images/top/backgroundcard.png',
  },
];
```

---

## 9. 実装ステップ

### Phase 1: 静的レイアウト
1. `ServiceSection` コンポーネントを新規作成
2. 左側のstickyレイアウト（ロゴ・ラベル・説明文・メニュー・ボタン）を実装
3. `ServiceCard` コンポーネントを作成（カードスタイル・内容）
4. 右側にカード3枚を横並びで配置
5. 装飾マスク画像（uemask.png / sitamask.png）を配置
6. page.tsx の既存サービスセクションを新コンポーネントに置き換え

### Phase 2: スクロールアニメーション
7. GSAP ScrollTrigger でセクションをpin（画面固定）
8. 縦スクロールに連動してカードコンテナをtranslateXで横スライド
9. スクロール進行率に応じて左メニューのアクティブ項目を切り替え
10. scrub設定で滑らかな連動を実現

### Phase 3: 赤モチーフ連携
11. 既存の赤モチーフ（ParallaxMotifs）がサービスカードの上にも重なるよう位置・z-index調整
12. motifsArea のラッパー範囲をサービスセクションまで拡張するか検討

### Phase 4: 3Dキャラクター演出
13. `ArigatokunRunner` コンポーネント作成
14. GLBモデル読み込み（@react-three/drei の useGLTF）
15. スクロール進行に合わせたX座標移動
16. リグ制御による走行アニメーション（ボーン操作）
17. Canvas配置とレイヤー調整

### Phase 5: 仕上げ
18. overlay.png のカード上配置
19. 全体のz-index調整・微調整
20. パフォーマンス確認（3D描画負荷）
21. 動作確認・デバッグ

---

## 10. 技術的な注意点

### 10.1 GSAP ScrollTrigger pin
- セクションを `pin: true` で固定すると、その分だけページの高さが増える
- カード枚数が増えた場合にスクロール距離も自動で増えるよう設計する
- pin中にページ全体のスクロール位置がずれないよう `pinSpacing: true` を使用

### 10.2 3Dキャラクター
- GLBファイルにアニメーションデータがないため、ボーン（リグ）を直接操作して走行モーションを作成する必要がある
- React Three Fiber の `useFrame` でフレーム毎にボーン角度を更新
- Canvas は `pointerEvents: none` で背面コンテンツのクリックを妨げない
- パフォーマンス考慮: モデルの軽量化、必要に応じてLOD対応

### 10.3 レスポンシブ
- モバイルデザイン未着手のため、PC値基準で暫定実装
- カードサイズは固定値（630x860px）で実装、後日fluid対応可能な構造にしておく

### 10.4 カード枚数の拡張性
- データ配列（SERVICE_CARDS）で管理し、カード追加は配列にpushするだけ
- スクロール距離・メニュー切り替え閾値はカード枚数から自動計算
- 同一カテゴリで複数カードがある場合、メニューのアクティブ判定はカテゴリ単位で行う
