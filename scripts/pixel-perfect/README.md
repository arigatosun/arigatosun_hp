# Pixel Perfect PoC — 決定論的差分Lintツール

Figma完成デザインと実装のズレを自動検出するPoC。
**現状の手動「8px下に」「4px右に」ループを支援するツール**であり、自動修正は行わない（人間レビュー前提）。

## ゴールとスコープ

### ゴール
- 「どこが」「何px」ズレているかを **決定論的（再現性95%以上）** に検出する
- 差分のあるDOM要素を、対応する **SCSSモジュールファイル + 行番号** まで逆引きする
- 結果を表形式で出力し、人間がEdit指示を出しやすくする

### スコープ外（やらない）
- スクリーンショット同士のピクセル比較（Vision/pixelmatchによる曖昧マッチ）
- LLMによる自動コード修正
- 自動コミット・自動Push
- 3Dキャンバス（R3F）内部の比較
- 疑似要素（::before/::after）の比較

これらは「妥協案C（決定論的差分Lint）」のスコープから明示的に除外します。
理由はレビュアーの指摘通り、再現性とコストが釣り合わないため。

---

## アーキテクチャ

```
┌──────────────────────┐
│ 1. Capture Agent     │  Playwright で http://localhost:3000 にアクセス
│   (capture/)         │  → 全要素の bounding rect + computed style + className
│                      │  → Adobe Fonts ロード待機 + GSAP/R3F 停止フック
│                      │  → JSON 出力 (output/snapshot-{section}.json)
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ 2. Figma Source      │  Figma Dev Mode MCP 経由で正解値取得
│   (figma/)           │  または手動で用意した fixtures/{section}.json
│                      │  → 正規化された JSON 出力
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ 3. Comparator        │  両JSONを要素単位で突き合わせ
│   (compare/)         │  → 数値プロパティの差分を検出（width/height/padding等）
│                      │  → 差分閾値以上のものをリストアップ
│                      │  → SCSSファイルパス + 行番号を付加
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ 4. Reporter          │  表形式 + Markdown レポート出力
│                      │  → output/diff-{section}-{timestamp}.md
│                      │  → コンソールにも色付き表示
└──────────────────────┘
```

---

## ロードマップ

### Phase 1: MVP（決定論的差分Lint）← 今ここ
- [x] PoC計画書（このREADME）
- [ ] 依存関係セットアップ
- [ ] Capture Agent（Playwright + DOMダンプ）
- [ ] CSS Modules ハッシュ→元ファイル逆引き
- [ ] Comparator（手動フィクスチャ比較）
- [ ] Heroセクションで動作確認

### Phase 2: Figma Dev Mode MCP連携
- [ ] Figma MCP接続セットアップ
- [ ] `get_code` レスポンスから数値抽出
- [ ] SCSS規約への自動変換層
- [ ] フィクスチャ自動生成

### Phase 3: 適用範囲拡大（条件付き）
- [ ] 全セクションへの展開
- [ ] CIゲート化
- [ ] 「同じパターン10回以上」の半自動修正提案

### Phase 4（凍結）
- pixelmatch / Claude Vision による視覚差分は **当面見送り**
- 必要になったらCI回帰テスト用途のみで導入

---

## 使い方（Phase 1 完成後）

```bash
# 1. 開発サーバー起動
npm run dev

# 2. PoC実行
npm run pp:capture -- --section hero --url http://localhost:3000
npm run pp:compare -- --section hero
```

出力例:
```
✗ .heroLogoImage (page.module.scss:42)
    width:    実装 575px → Figma 580px (差分 +5px)
    margin-top: 実装 252px → Figma 248px (差分 -4px)

✓ .heroLabelsArea (page.module.scss:53) — 差分なし
```

---

## 技術選定

| 用途 | 採用技術 | 理由 |
|---|---|---|
| ブラウザ自動化 | Playwright | フォントロード待機・SSR/CSRどちらも対応 |
| DOM情報取得 | `page.evaluate()` | バンドル不要で十分 |
| CSS Modules逆引き | `localIdentName` 固定 | 開発モードのみ、本番影響なし |
| Figma正解値 | Dev Mode MCP | 有料プランあり、最も決定論的 |
| 出力 | Markdown + JSON | LLMにそのまま渡せる形式 |
| スクリプト言語 | TypeScript (`tsx`) | プロジェクトと統一 |

## 設計上の決定事項

### ① CSS Modules逆引き戦略
Next.js Turbopack の CSS ソースマップは2025年時点で不安定。
そのため `localIdentName` を `[path][name]__[local]` 形式に固定する方式を採用。
**開発モード限定** で `next.config.js` に注入し、本番ビルドには影響を与えない。

### ② フォントロード待機
Adobe Fonts (Typekit) は非同期ロードのため、必ず以下を待機:
1. `page.waitForLoadState('networkidle')`
2. `page.evaluate(() => document.fonts.ready)`
3. 追加 500ms のセーフティバッファ

### ③ アニメーション停止
GSAP/ScrollTriggerは比較前に `gsap.globalTimeline.pause()` で停止。
React Three Fiberの`<canvas>`は座標除外マスクで対応。
将来的にはコード側に `data-pp-skip` 属性を仕込む予定。

### ④ 差分閾値
- 寸法: ±2px 以下は無視（ブラウザレンダリング誤差）
- letter-spacing: ±0.1px 以下は無視
- 色: 完全一致のみ（後段で対応）

---

## 注意事項

### やらないこと
- 自動コミット・自動Push（**禁止**）
- LLMによる「8px下げる」の自動判断（**判断は必ず人間**）
- 本番ビルドへの設定変更（dev限定の最小侵襲）
- セキュリティ・パフォーマンスへの影響（このツールは開発時専用）

### 失敗時のロールバック
PoC失敗・破棄時は以下を削除すれば元に戻る:
- `scripts/pixel-perfect/` ディレクトリ全体
- `package.json` の `pp:*` スクリプトと関連 devDependencies
- `next.config.js` の Phase 1 マーカーで囲まれたブロック
