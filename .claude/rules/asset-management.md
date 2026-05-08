---
paths:
  - "public/**"
  - "src/components/**"
  - "src/app/**"
---

# アセット管理ルール（画像・3D 等）

> `public/` 配下の画像・3Dモデル等の配置・命名・参照ルール。
> 注: `public/` の再構成タスク（Wave 2）が進行中。本ルールは**目指すべき新構造**を記述している。

---

## ディレクトリ構成（再構成後の目標形）

```
public/
├── images/
│   ├── sections/
│   │   ├── hero/             # Heroセクション専用
│   │   ├── about/            # Aboutセクション専用
│   │   ├── service/          # Serviceセクション専用
│   │   ├── works/            # Worksセクション専用
│   │   └── news/             # Newsセクション専用
│   ├── icons/                # 共通アイコン（矢印・SNSロゴ・UI記号等）
│   ├── team/                 # メンバー写真
│   ├── logos/                # コーポレート/クライアントロゴ
│   └── partners/             # パートナー企業ロゴ
├── models/                   # 3Dモデル（.glb / .gltf）
└── favicon.ico
```

> セクション横断で再利用される画像 → `icons/` `logos/` `team/` `partners/` のいずれか。
> 1セクションでしか使わない画像 → `sections/<section-name>/`。

---

## 命名規則

**lowercase + kebab-case を厳守**。スペース・大文字・全角・タイポ禁止。

| 対象 | 例 | NG例 |
|---|---|---|
| 単体画像 | `hero-bg.png` | `HeroBG.png` `hero_bg.png` |
| 連番（用途を明示） | `hero-panel-1.png` `hero-panel-2.png` | `image01.png` `IMG_2231.png` |
| アイコン | `arrow-right.svg` `sns-x.svg` | `arrow1.svg` |
| メンバー写真 | `member-tanaka.jpg` | `田中.jpg` `tanaka_san.jpg` |
| 3Dモデル | `arigatokun.glb` `runner-pose.glb` | `model.glb` `final_v3.glb` |

連番は **何を表しているか分かるプレフィックス + 連番** に統一する。

---

## next/image の使い方

```tsx
import Image from 'next/image';

<Image
  src="/images/sections/hero/hero-panel-1.png"
  alt="アリガトくんがメインビジュアルで走っている"
  width={1200}
  height={800}
  priority   // ファーストビューに乗る画像のみ
/>
```

### ルール

- `width` / `height` は**必ず指定**（CLS対策）
- `alt` は**必ず指定**。装飾用なら `alt=""`、意味のある画像は内容を日本語で書く
- ファーストビュー画像は `priority` を付けると LCP 改善
- `priority` の付けすぎ禁止（FV 1〜2枚まで）
- 外部画像を使う時は `next.config.ts` の `images.remotePatterns` に許可ドメインを追加

---

## 3Dモデル（.glb）の扱い

- 配置先は `public/models/`
- ファイルサイズが 1MB を超えたら **Draco 圧縮** を将来検討（現状は未対応）
- React Three Fiber では `useGLTF('/models/arigatokun.glb')` で読み込む
- 重い glb はファーストビューでなければ `Suspense` で遅延読み込み

---

## 追加時のチェックリスト

新しいアセットをコミットする前に確認:

- [ ] ファイル名が lowercase + kebab-case になっている
- [ ] 配置先ディレクトリが用途と合っている（sections / icons / team / logos / models）
- [ ] 画像なら next/image で読み込み、`alt` を書いた
- [ ] 1MB 超の画像は圧縮した（TinyPNG / Squoosh 等）
- [ ] 同じ用途の画像が既に存在しないか確認した（重複回避）

---

## アンチパターン

- ❌ `public/` 直下に画像を置く → ✅ 必ず `images/<カテゴリ>/` に整理
- ❌ `IMG_2231.png` `スクリーンショット.png` 等の意味不明ファイル名 → ✅ 用途が分かる kebab-case
- ❌ `<img src="...">` 直書き → ✅ `next/image` を使う
- ❌ `width` / `height` 未指定の画像 → ✅ 必ず両方指定（CLS 対策）
- ❌ FV でない画像に `priority` を付けまくる → ✅ FV 1〜2 枚に限定
