# Figma Dev Mode MCP ワークフロー

> Figma の実測値を直接取得して `capture-image` スキルの精度を上げるための単一ソース。
> `.claude/skills/capture-image/SKILL.md` のフェーズ0からここを参照する。

---

## 前提

- `.mcp.json` に `figma-dev-mode` (SSE `http://127.0.0.1:3845/sse`) が登録済み
- Figma デスクトップアプリで **Preferences > Enable Dev Mode MCP Server** をオンにしている必要がある
- サーバー未起動時は `mcp__figma-dev-mode__*` 呼び出しが接続エラーになる → 画像フォールバック（後述）

---

## URL から nodeId を抽出する

Figma URL は次のいずれかの形式：

| 形式 | 例 | 抽出方法 |
|---|---|---|
| 通常 | `https://figma.com/design/<fileKey>/<fileName>?node-id=1-2` | `node-id=1-2` → `1:2` |
| ブランチ | `https://figma.com/design/<fileKey>/branch/<branchKey>/<fileName>` | branchKey を fileKey として扱う |

`-` を `:` に変換するのを忘れない。

---

## フェーズ0: Figma 情報の自動取得

`capture-image` が発動した時、ユーザーが **Figma URL を提示している** 場合に実行する。
画像だけで URL が無い場合はフェーズ0をスキップし、従来通り画像から推定する（その際 URL をもらえるかユーザーに一度だけ確認）。

### 取得順（基本3点セット）

1. **`mcp__figma-dev-mode__get_design_context`**
   - 最も重要。スクリーンショット + 参考コード + メタが一度に返る
   - `artifactType`: 単体セクションなら `COMPONENT_WITHIN_A_WEB_PAGE_OR_APP_SCREEN`、ページ全体なら `WEB_PAGE_OR_APP_SCREEN`
   - `clientFrameworks: "react,next.js"`, `clientLanguages: "typescript,scss"` を必ず付ける
   - `taskType: "CREATE_ARTIFACT"` （新規実装時）

2. **`mcp__figma-dev-mode__get_variable_defs`**
   - そのノードが参照している Figma 変数（色 / フォント / 寸法トークン）一覧
   - `design-tokens.md` に既存トークンと突き合わせ、足りない色があれば `_variables.scss` 追加候補としてフェーズ1の⑤に注記

3. **`mcp__figma-dev-mode__get_screenshot`**
   - 純粋なビジュアル確認用。`contentsOnly: false` がデフォルト（キャンバスで見える通り）
   - get_design_context が大きすぎてスクショだけ欲しい時にも使う

### 構造把握の補助

- 取得済みノードの内部構造を XML で俯瞰したい時のみ `mcp__figma-dev-mode__get_metadata` を使う
- 通常は `get_design_context` で十分。先に metadata を叩く必要は基本ない

---

## フェーズ0で埋める情報

取得した実測値を `capture-image` の **フェーズ1テンプレート④寸法表** の max列に反映する：

| プロパティ | 取得元 |
|---|---|
| width / height / padding / margin / gap | get_design_context のレイヤー寸法 |
| font-size / font-weight / line-height / letter-spacing | get_design_context のテキストスタイル |
| color / background | get_variable_defs → 既存CSS変数にマップ |
| border-radius / border-width | get_design_context の枠情報 |

min 値は `.claude/rules/responsive.md` の算出テーブルに従う（ここは自動取得できない、ルール適用で決める）。

---

## 細部まで実測する（厳守）

寸法・余白だけでなく、**細かい部分も `get_design_context` で個別に実測して厳密に反映する**。推測・近似で済ませると齟齬が出る。

### テキストの改行（最重要）

- テキストノードの `get_design_context` が返す **複数の `<p>` は、デザイナーが入れた明示的な改行**。これを必ず再現する。
- 複数行のコピーを **1本の文字列で持たない**。データは `string[]`（セグメント配列）で保持し、セグメント区切りに `<br>` を入れる。
- テキストボックスの **幅（Figma 実測値）を `max-width` 等で固定**し、セグメント内の自然改行位置も Figma と一致させる。

### 要素ごとに個別取得する

- `letter-spacing` / `font-size` / `font-weight` / `line-height` は **要素ごとに1つずつ取得**する。
- 見た目が似た要素でも値が異なる前提で確認する（「同じだろう」と決め打ちしない）。実例: 3つの本文で字間が 3.84 / 4.48 / 4px とすべて別だった。
- 要素ごとに違う字間などは、データ側に持たせて `em` 単位で渡す（フォントサイズに追従させる）。

> 指摘を待たずに、最初からこの粒度で MCP を確認すること。

---

## エラー時のフォールバック

| エラー | 対応 |
|---|---|
| MCP接続失敗（127.0.0.1:3845 unreachable） | ユーザーに「Figmaデスクトップアプリで Dev Mode MCP Server を有効にしてください」と一度だけ案内し、画像ベースのフローに切り替える |
| nodeId 不正 | URL の `node-id=` パラメータを再確認、無ければユーザーに正しい URL を要求 |
| `get_design_context` が大きすぎて切れた | `forceCode: true` で再試行、または子ノードに分解して個別取得 |

---

## アンチパターン

- `get_metadata` を毎回先に叩く（不要、`get_design_context` 1発で済む）
- 取得した Figma の生コード（HTML/CSS）をそのままコピペ実装する（プロジェクトの fluid()/CSS変数/コンポーネント規約と合わないので NG）
- 変数を `get_variable_defs` で取らず、ハードコードされた色値を直接使う（既存 `--color-*` にマップする手間を惜しまない）
- 複数行テキストを1文字列で実装し、Figma の明示的改行（`<p>` 区切り）を落とす
- 似た要素の letter-spacing / font を「同じだろう」と決め打ちし、要素ごとの個別取得を省く

---

## 参照

- `.claude/skills/capture-image/SKILL.md` — このルールを呼び出すスキル本体
- `.claude/rules/design-tokens.md` — 取得した色/フォントをマップする先
- `.claude/rules/responsive.md` — min値算出テーブル
- `.mcp.json` — MCP サーバー登録
