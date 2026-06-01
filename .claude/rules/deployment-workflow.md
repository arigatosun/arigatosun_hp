# デプロイ / 変更反映ワークフロー（本番公開後）

> サイトは本番公開済み。変更を安全に本番へ出すための手順。
> 公開後の修正は必ずこの流れで進める。

---

## 前提

- 本番URL: **https://www.arigatosun.com**
- ホスティング: Vercel プロジェクト **`arigatosun-hp-efar`**（team: `arigatosun`）の Production
- **`main` ブランチにマージ＝即・本番反映**。`main` への直接コミットは禁止（必ずブランチ＋PR経由）。
- 正規ホストは **www**（apex `arigatosun.com` は www へ 308 リダイレクト）。
- DNS は既に Vercel 向き（変更不要）。

---

## 変更の進め方（厳守）

1. **最新化**: `git checkout main && git pull && npm install`
   - チームが依存を追加していることがあるため `npm install` を毎回行う（ローカルが古いとビルドが落ちる）
2. **作業ブランチ**: `git checkout -b <type>/<短い名前>`（例: `fix/contact-label`）
3. **実装後に必ず通す**: `npm run lint` / `npm run build`（どちらもエラー0）
4. **commit → push → PR 作成**（push すると Vercel が Preview を自動生成）
5. **PR の Vercel プレビューURL**（例: `arigatosun-hp-efar-xxxxx.vercel.app`）をユーザーに渡し、
   「本番マージ前にここで確認してください」と伝える
6. **ユーザーの「OK」を得てから** `main` にマージ（＝本番反映）
7. **勝手に本番（main）へマージしない**

---

## プレビューの種類（最終ゲートは②）

| 種類 | 用途 | 注意 |
|---|---|---|
| ① ローカル（`npm run dev` / localhost） | 開発中の素早い確認 | env / 依存差で本番とズレうる |
| ② Vercel プレビュー（PR の URL） | **本番反映前の最終確認** | 本番同等のクリーンビルド＋Preview用 env。共有可能 |

→ 本番に出る前の信頼できる確認は **②**。ローカルは補助。

---

## トラブル時のロールバック

Vercel ダッシュボード → `arigatosun-hp-efar` → **Deployments** → 正常な過去デプロイの「⋯」→
**Instant Rollback / Promote to Production**（ワンクリックで前の本番に即復旧）。

---

## 補足

- env（Supabase / Resend / 解析ID 等）は基本 **Production / Preview / Development の全環境**に設定する
  （Production のみだと Preview ビルドが env 不足で失敗する）。
- 旧サイト固有 URL（`/top` `/testimonials` 等）は `next.config.ts` の `redirects()` で `/` へ恒久リダイレクト済み。
- コミット前チェックは `.claude/rules/pre-commit-checklist.md` も併用する。
