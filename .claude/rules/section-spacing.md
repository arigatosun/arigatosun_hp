# セクション間（上下）余白ルール

> セクション単位で実装する時に、隣接セクションとの上下余白が Figma とズレないようにするための単一ソース。
> `.claude/skills/capture-image/SKILL.md` のフェーズ0・フェーズ3から参照する。

---

## なぜ必要か

Figma ではセクションごとに別の「Group」ノードになっている。`capture-image` で1セクションを実装する時に見るのは **そのノード単体** で、セクション間の余白は「ノードとノードの"間"」にあるため単体ノードからは拾えない。

実装側でもこの余白は「上セクションの `padding-bottom`」＋「下セクションの `padding-top`」に分散しており、各セクションを個別に実装するとズレやすい。

> 実例: SERVICE↔WORKS、WORKS↔NEWS でセクション間余白が Figma と不一致になり、後から個別修正が必要になった。

---

## Figma でのセクション間ギャップの測り方

各セクションは Figma 上で1つの Group（フレーム）。`mcp__figma-dev-mode__get_metadata` で `y`・`height` が取れる。

```
セクション間ギャップ ＝ 下セクション.y −（上セクション.y ＋ 上セクション.height）
```

例:
- WORKS「Group 874」: y=3746 / height=2346 → 下端 6092
- NEWS「Group 877」: y=6412
- ギャップ ＝ 6412 − 6092 ＝ **320px**

---

## 実装フロー（capture-image に組み込む）

### フェーズ0（取得時）
対象セクションのノードに加え、**1つ上・1つ下の隣接セクションの Group ノードも `get_metadata` で取得**し、上下それぞれの Figma ギャップ（px）を算出しておく。隣接ノードの node-id が不明なら、親フレームに `get_metadata` を打って一覧から特定する。

### フェーズ3（実装後の検証）
1. `npm run dev` で対象セクションを表示
2. ブラウザ実測で、隣接セクションとの実ギャップを測る
   - 上ギャップ ＝ 対象セクションの最初の可視要素 上端 −（上セクションの最後の可視要素 下端）
   - 下ギャップ ＝ 下セクションの最初の可視要素 上端 −（対象セクションの最後の可視要素 下端）
3. Figma 値とズレていれば調整（下記「調整の指針」）
4. 再実測して一致を確認

---

## 調整の指針

- セクション間ギャップ ＝ 実装上は「上セクションの `padding-bottom`」＋「下セクションの `padding-top`」の合計。どちらで吸収しても見た目は同じ。
- 原則 **今実装しているセクション側の `padding`** で調整する（隣接セクションのファイルは触らない）。
- ギャップはスケーラブル値 → `@include fluid(padding-top, min, max)` の max に Figma 実測ギャップ相当を入れる（`responsive.md` 準拠）。

---

## アンチパターン

- セクション本体のノードだけ見て実装し、上下の隣接セクションとの余白を照合しない
- セクション間ギャップを「だいたいこれくらい」で固定px・概算値で置く
- ズレに気づかず、後からユーザー指摘で都度直す

---

## 参照

- `.claude/skills/capture-image/SKILL.md` — このルールを呼び出すスキル本体
- `.claude/rules/figma-mcp-workflow.md` — `get_metadata` / `get_design_context` の使い方
- `.claude/rules/responsive.md` — fluid() の min/max 算出
- `.claude/rules/pre-commit-checklist.md` — コミット前チェック
