# レスポンシブ設計ガイド — アリガトサン コーポレートサイト

## 設計思想

**ピクセルパーフェクト Fluid Design** — どの画面サイズでも「崩れない」のではなく「美しい」レイアウトを実現する。

- **基本手法**: `clamp()` によるスムーズスケーリング（320px〜1200px）
- **計算ツール**: https://min-max-calculator.9elements.com/?16,24,320,1200
- **補助手法**: `@include sp / tab / pc` によるレイアウト構造の切り替え
- **原則**: フォント・余白・幅は `fluid()` 優先、レイアウト変更のみメディアクエリ

---

## ビューポート定義

| 名称 | 範囲 | mixin | 用途 |
|---|---|---|---|
| SP（スマートフォン） | 〜767px | `@include sp` | 1カラム・縦積み |
| TAB（タブレット） | 768px〜1023px | `@include tab` | 2カラム・中間調整 |
| PC（デスクトップ） | 1024px〜 | `@include pc` | フルレイアウト |

### Fluid計算範囲
- **最小ビューポート**: 320px（`$fluid-min-viewport`）
- **最大ビューポート**: 1200px（`$fluid-max-viewport`）
- 1200px以上: 最大値でクランプ（PC表示固定）
- 320px以下: 最小値でクランプ（これ以上縮まない）

---

## fluid() mixin の使い方

### 基本形
```scss
@use '@/styles/fluid' as *;

// Figmaの値をそのまま入力
@include fluid(font-size, 14, 24);
// → font-size: clamp(0.875rem, 0.511rem + 1.136vw, 1.5rem);
// → 320px時: 14px、1200px時: 24px、中間: 滑らかにスケール
```

### 計算方法
https://min-max-calculator.9elements.com/ で以下を入力:
- **Min value**: モバイル(320px)時の値
- **Max value**: PC(1200px)時の値
- **Min viewport**: 320
- **Max viewport**: 1200

### 複数プロパティ一括指定
```scss
@include fluid-props((
  font-size: (14, 24),
  line-height: (24, 36),
  margin-bottom: (12, 20)
));
```

---

## 値の決め方ガイドライン

### フォントサイズ（min / max）

| 用途 | PC値(max) | SP値(min) | 比率 |
|---|---|---|---|
| 大見出し（hero等） | 38〜44px | 20〜24px | 約53〜55% |
| セクション見出し | 24〜34px | 14〜18px | 約53〜58% |
| 本文（日本語） | 24〜26px | 14px | 約54〜58% |
| ラベル（英語） | 20px | 14px | 70% |
| 小テキスト | 14〜16px | 12〜14px | 固定またはわずかにスケール |

### スペーシング（margin / padding / gap）

| 用途 | PC値(max) | SP値(min) | 備考 |
|---|---|---|---|
| セクション左padding | 200px | 20px | コンテンツ幅確保のため大幅縮小 |
| セクション間margin | 370〜410px | 120px | 比率約30% |
| セクション上下padding | 60〜120px | 40〜60px | |
| セクション内大余白 | 120〜240px | 40〜60px | |
| セクション内中余白 | 40〜100px | 16〜40px | |
| コンポーネント間gap | 32〜70px | 12〜24px | |
| 小余白 | 16〜24px | 8〜12px | 固定でもOK |

### サイズ（width / height）

| 対象 | PC値(max) | SP値(min) | 備考 |
|---|---|---|---|
| ボタン | 380×72px | 240×52px | 最小タッチターゲット考慮 |
| サムネイル幅 | 300px | 120px | aspect-ratio維持 |
| ロゴスライダー画像 | 865×188px | 300×65px | 比率維持 |
| コンテンツ最大幅 | 1210px | — | `max-width` + `width: 100%` |

---

## セクション別レスポンシブ方針

### Header
**現状**: PCナビ + モバイルハンバーガー 実装済み ✅
**追加作業**: 微調整のみ

### Hero
**PC**: ロゴ中央 + ラベル右寄せ + 右下情報（absolute）
**SP方針**:
- `.heroInfo`: absolute → relativeに変更、セクション下部に配置
- ロゴサイズ: `max-width` でスケール
- ラベル: 中央揃えに変更

```scss
@include sp {
  .heroContent {
    padding-top: 80px;
  }
  .heroInfo {
    position: relative;
    top: auto;
    right: auto;
    text-align: center;
    margin-top: 40px;
  }
}
```

### About
**PC**: 左200px padding + テキスト横並び + ボタン
**SP方針**:
- padding-left: fluid()で自動縮小済み（200px→20px）
- `.aboutLastRow`: flex-direction: columnに切り替え

```scss
@include sp {
  .aboutLastRow {
    flex-direction: column;
    align-items: flex-start;
  }
}
```

### Service（横スクロール）
**PC**: 左右2カラム + GSAP横スクロール
**SP方針**: 横スクロール無効化 → カード縦積み

```scss
@include sp {
  .inner {
    flex-direction: column;
  }
  .left {
    width: 100%;
    padding-left: 20px;
    padding-right: 20px;
  }
  .cardsTrack {
    flex-direction: column;
    gap: 24px;
  }
  .card {
    width: 100%;
    height: auto;
    aspect-ratio: 630 / 860;
  }
}
```

### Works
**PC**: 左右2カラム（テキスト + 画像）
**SP方針**: 1カラム縦積み

```scss
@include sp {
  .item {
    flex-direction: column;
  }
  .itemRight {
    margin-top: 0;
    width: 100%;
  }
  .viewMore, .viewMoreLeft {
    position: relative;
    top: auto;
    right: auto;
    left: auto;
    margin-top: 24px;
  }
}
```

### News
**PC**: 左右2カラム（メニュー + 記事リスト）
**SP方針**: 1カラム縦積み、サムネイル位置変更

```scss
@include sp {
  .inner {
    flex-direction: column;
  }
  .left {
    width: 100%;
  }
  .header {
    margin-bottom: 40px; // SP時は縮小
  }
  .article {
    flex-direction: column;
    gap: 16px;
  }
  .articleThumbnail {
    width: 100%;
  }
}
```

### LogoSlider
**PC/SP共通**: 無限スクロールは全サイズで動作
**SP方針**: サイズのみfluid()で自動縮小（対応済み）

### Message
**PC**: 中央配置テキスト
**SP方針**: fluid()で自動縮小（対応済み）、テキスト折り返し

### Footer
**PC**: 左右2カラム
**SP方針**: 1カラム縦積み

```scss
@include sp {
  .content {
    flex-direction: column;
    gap: 60px;
  }
}
```

---

## 変換済みファイル一覧

以下のファイルは固定px値を`fluid()`に変換済み（PC表示変更なし）:

| ファイル | 変換箇所数 | 主要変換 |
|---|---|---|
| `page.module.scss` | 22箇所 | hero padding/position、about全般 |
| `ServiceSection.module.scss` | 12箇所 | margin-top、font-size、gap |
| `ServiceCard.module.scss` | 10箇所 | content padding、font-size |
| `WorksSection.module.scss` | 16箇所 | padding-left、margin、position |
| `NewsSection.module.scss` | 18箇所 | padding-left、gap、font-size |
| `LogoSlider.module.scss` | 5箇所 | margin-top、width/height |
| `MessageSection.module.scss` | 12箇所 | margin-top、font-size、width |
| `Button.module.scss` | 4箇所 | width、height、font-size |
| `Footer.module.scss` | 16箇所 | padding、gap、font-size |

---

## 未変換・要注意箇所

| ファイル | 箇所 | 理由 |
|---|---|---|
| `ServiceCard` | `width: 32.8vw` / `height: 44.8vw` | vw基準で自動スケール済み。SP時はレイアウト変更で対応 |
| `ServiceSection` | `.left width: 45%` / `.left padding: vw` | vw/%基準で自動スケール済み |
| `ServiceSection` | `.decoTop/-Bottom` | vw基準装飾。レイアウト変更時に再調整 |
| `WorksSection` | `.itemRight margin-top: -60px` | 負のfluid非対応。SP時は0に変更 |
| `ParallaxMotifs` | `top: calc(100vh + 904px)` | GSAP制御の装飾要素。SP時は非表示検討 |
| `Header` | 既にレスポンシブ対応済み | 微調整のみ |
| `RevealText` | 相対単位(em/%)のみ使用 | 変更不要 |

---

## 実装チェックリスト

### Phase 1: fluid()変換 ✅ 完了
- [x] 固定px余白 → fluid()
- [x] 固定pxフォントサイズ → fluid()
- [x] 固定px幅/高さ → fluid()
- [x] ビルドエラーなし確認

### Phase 2: SPレイアウト実装（次ステップ）
- [ ] Hero: heroInfo配置変更
- [ ] About: aboutLastRow縦積み
- [ ] Service: 横スクロール→縦積み + GSAPモバイル分岐
- [ ] Works: 1カラム化 + viewMore配置変更
- [ ] News: 1カラム化 + 記事カード縦積み
- [ ] Footer: 1カラム化
- [ ] ParallaxMotifs: SP時の表示調整

### Phase 3: タブレット調整
- [ ] 2カラムレイアウトの中間状態
- [ ] ServiceCard: 2カラム or カルーセル
- [ ] News: 記事レイアウト調整

### Phase 4: 仕上げ
- [ ] 全ブレークポイントでの表示確認
- [ ] タッチデバイスのホバー処理
- [ ] GSAP ScrollTriggerのモバイル対応
- [ ] パフォーマンス最適化（画像srcset等）
