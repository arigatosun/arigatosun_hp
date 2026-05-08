# public/ アセット管理ガイド

## ディレクトリ構成
- `images/sections/<section-name>/` — ページセクション専用画像
- `images/icons/` — 共通アイコン・SVG
- `images/team/` — メンバー写真
- `images/logos/` — ブランドロゴ
- `images/partners/` — パートナー企業ロゴ
- `models/` — 3Dモデル（GLB）

## 命名規則
- すべて lowercase + kebab-case
- 例: `hero-panel-1.png`, `service-bg-card.png`
- 連番だけのファイル名 NG（用途を必ず明記）

## 新規追加時
1. 用途に合うディレクトリに配置（無ければ作成）
2. ファイル名は lowercase + kebab-case
3. コードからは `/images/sections/<section>/<file>` で参照
4. 詳細ルール: `.claude/rules/asset-management.md`
