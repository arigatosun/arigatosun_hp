---
paths:
  - "src/components/**"
  - "src/app/**"
---

# 新規コンポーネント追加ルール

> セクション・UIパーツを新規追加する時の手順。
> SCSS の書き方は `coding-standards.md` / `responsive.md`、トークンは `design-tokens.md`。

---

## ディレクトリ構成（3点セット必須）

新規コンポーネントは以下の3ファイルを必ずワンセットで作る。

```
src/components/<ui|layout|three>/ComponentName/
├── ComponentName.tsx
├── ComponentName.module.scss
└── index.ts
```

- `ui/` … セクション系UI + 再利用される汎用UI
- `layout/` … Header / Footer などサイト共通枠
- `three/` … React Three Fiber 関連

---

## 配置の判断フロー

| 状況 | 置き場所 |
|---|---|
| ヘッダー・フッター・サイト共通枠 | `src/components/layout/` |
| 複数ページから再利用される（ボタン / カード等） | `src/components/ui/` |
| 1セクション専用（HeroSection等） | `src/components/ui/`（セクション粒度で配置） |
| ページ固有の小さいパーツ | そのページの `app/<page>/components/`（必要時のみ） |
| 3D 演出 | `src/components/three/` |

迷ったら **再利用される予定があるか** で判断する。1回しか使わないなら ui/ にセクション粒度で置けばOK。

---

## 命名規則

| 対象 | ケース | 例 |
|---|---|---|
| ディレクトリ・ファイル名 | PascalCase | `MemberSection/MemberSection.tsx` |
| コンポーネント | PascalCase | `export default function MemberSection()` |
| Props 型 | `ComponentNameProps` | `interface MemberSectionProps {}` |
| SCSS Modules クラス | camelCase | `.memberCard`, `.titleEn` |

---

## ファイルテンプレート

### `ComponentName.tsx`（クライアント側演出なし）

```tsx
import styles from './ComponentName.module.scss';

interface ComponentNameProps {
  title: string;
}

export default function ComponentName({ title }: ComponentNameProps) {
  return (
    <section className={styles.root}>
      <h2 className={styles.title}>{title}</h2>
    </section>
  );
}
```

### `ComponentName.tsx`（GSAP / state / ハンドラ使用時）

```tsx
'use client';

import { useEffect, useRef } from 'react';
import styles from './ComponentName.module.scss';

interface ComponentNameProps {
  title: string;
}

export default function ComponentName({ title }: ComponentNameProps) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // GSAP / IntersectionObserver 等
  }, []);

  return (
    <section ref={rootRef} className={styles.root}>
      <h2 className={styles.title}>{title}</h2>
    </section>
  );
}
```

### `ComponentName.module.scss`（先頭2行は固定）

```scss
@use '@/styles/fluid' as *;
@use '@/styles/breakpoints' as *;

.root {
  @include fluid(padding-block, 60, 200);
}

.title {
  @include fluid(font-size, 24, 44);
  color: var(--color-black);
  font-family: var(--font-en);
  font-weight: var(--font-weight-light);
}
```

### `index.ts`（必ず作る）

```ts
export { default } from './ComponentName';
```

これで呼び出し側は `import ComponentName from '@/components/ui/ComponentName';` と書ける。

---

## 'use client' の判断

| 使うもの | `'use client'` 必要? |
|---|---|
| `useState` / `useEffect` / `useRef` | 必要 |
| `onClick` / `onChange` 等のイベントハンドラ | 必要 |
| GSAP / IntersectionObserver / `window` | 必要 |
| Three.js / React Three Fiber | 必要 |
| 純粋に props を表示するだけ | **不要**（サーバーコンポーネント） |

迷ったら不要側に倒す。後から付ける方が安全。

---

## データ・型の置き場

- 配列・オブジェクトのデータは **コンポーネント内に直書きしない**。`src/data/<feature>.ts` を作って import する（後の CMS 差し替え対応）。
- 1コンポーネント専用の Props 型 → 同ファイル内に書く
- 複数コンポーネントで共有する型 → `src/types/<domain>.ts` に切り出す

---

## アンチパターン（やったら直す）

- ❌ `index.ts` を作らずに `import X from './X/X'` と書く → ✅ `index.ts` でリエクスポート
- ❌ `.module.scss` の先頭 `@use` を書き忘れる → ✅ 必ず2行入れる
- ❌ コンポーネント内に色を `#xxxxxx` ベタ書き → ✅ `var(--color-xxx)` 経由
- ❌ コンポーネント内に配列データを直書き → ✅ `src/data/` から import
- ❌ サーバーコンポーネントで済むのに `'use client'` を付ける → ✅ 必要な時だけ宣言
