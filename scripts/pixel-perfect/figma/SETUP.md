# Figma Dev Mode MCP Server セットアップガイド

Phase 2 で Figma の正解値を自動取得するための接続設定。
**Phase 1 では使用しないため、後回しでもOK**。

## 前提条件

- Figma 有料プラン（Professional 以上、Dev Mode 利用権限あり）
- Figma デスクトップアプリ（Webブラウザ版では Dev Mode MCP が動かない）

## 手順

### 1. Figma デスクトップアプリで MCP Server を有効化

1. Figmaデスクトップアプリを起動
2. メニュー → Figma → Preferences（macOS）/ ファイル → Preferences（Windows）
3. **「Enable Dev Mode MCP Server」** にチェック
4. アプリを再起動
5. 起動後、ローカルで `http://127.0.0.1:3845/sse` にSSEサーバーが立つ

### 2. Claude Code 側の MCP 設定

プロジェクトルートに `.mcp.json` を作成（git管理対象外推奨）:

```json
{
  "mcpServers": {
    "figma-dev-mode": {
      "type": "sse",
      "url": "http://127.0.0.1:3845/sse"
    }
  }
}
```

または、ユーザー設定（`~/.claude/settings.json`）に追加してもOK。

### 3. 接続確認

Claude Codeで以下のように呼び出す:
```
Figmaで対象フレームを選択した状態で、`get_code` を実行してください
```

正常に接続されていれば、Figmaのフレームから生成された React + Tailwind コードが返ってくる。

## 取得できる主要API

| API | 内容 |
|---|---|
| `get_code` | 選択フレームから React/HTML+CSS コードを生成 |
| `get_variable_defs` | Figma Variables（色、フォント、スペーシング等）を取得 |
| `get_image` | フレームを画像書き出し |
| `get_code_connect_map` | Code Connect で紐付けられた実装ファイルを取得（要事前設定） |

## Phase 1 → Phase 2 の連携

Phase 2 で実装する `scripts/pixel-perfect/figma/fetch.ts` が Figma MCP を呼び出し、
取得した値を `scripts/pixel-perfect/fixtures/<section>.json` に変換する設計。

```
Figma フレーム選択
  ↓
get_code でCSSを取得
  ↓
CSSパース → 数値抽出
  ↓
fixtures/hero.json (FigmaSpec形式)
  ↓
pp:compare でDOM実装と比較
```

## 既知の制限

- **接続が不安定**: Figmaデスクトップをフォアグラウンドにしておく
- **同時リクエスト不可**: 直列化必須
- **生成コードの揺らぎ**: Auto Layout の解釈次第で同じフレームでも結果が変わる
- **SCSS変換は自前**: 出力はTailwindベース、fluid()記法には自動変換されない

## 代替案: Figma REST API（無料プランでも一部可）

Dev Mode MCP が使えない場合は、Figma REST API + Personal Access Token で
ノード情報を取得する方式に切り替え可能。
こちらは Phase 2 のフォールバックとして検討対象。
