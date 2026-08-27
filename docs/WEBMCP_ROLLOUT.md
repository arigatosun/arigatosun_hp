# WebMCP 導入・公開手順

この文書は実装をステージングから本番へ段階公開するための運用チェックリストです。詳細設計は `WEBMCP_DESIGN.md`、合否基準は `WEBMCP_REQUIREMENTS.md` を参照してください。

## 1. 事前準備

1. Node.js `20.19.0`以上（または`22.13.0`以上）とnpm `10.8.2`以上を使用し、Supabase のバックアップを確認する。
2. `20260827000000`、`20260827000100`、`20260827000200`、`20260827000300` の順に全マイグレーションを適用する。`003` は pg_cron 非対応環境でも警告のみで成功する。
3. Vercel に `.env.example` の WebMCP 環境変数を登録する。署名秘密鍵とsaltはそれぞれ32文字以上の別々の乱数にする。
4. Origin Trial token の対象originと `WEBMCP_ALLOWED_ORIGINS` が、公開先の正確なoriginに一致することを確認する。
5. 初回デプロイ時は `NEXT_PUBLIC_WEBMCP_ENABLED=false`、DBの3フラグもすべて `false` のままにする。
6. `CONTACT_LEGACY_PAYLOAD_UNTIL` は旧フォーム移行の終了日時を明示し、期限後は空にして旧payloadを拒否する。

## 1.1 コード公開前ゲート

release candidate commitに対し、次をすべて成功させます。

```text
npm ci
npm test
npm run test:coverage
npx tsc --noEmit
npm run lint
npm run build
npm run test:e2e
npm audit --omit=dev
```

続いて承認済み環境で`npm run test:webmcp-eval`を実行し、結果artifactのcommit SHAが公開対象と一致することを確認します。Claude Code再レビューでCritical/Highが0件になるまで、DB適用・Vercel設定・公開へ進みません。

## 1.2 DB適用後の検証

- `PUBLIC`、`anon`、`authenticated`からWebMCP RPCを実行できないこと
- `service_role`だけが必要なRPCを実行できること
- stagingの`cron.job`にcleanup jobが1件だけactiveであること
- approval、receipt、auditに氏名・メール・本文が保存されないこと

## 2. ステージング段階公開

次の順で1項目ずつ有効化し、各段階で要件定義書の受入テストを実施します。

1. `NEXT_PUBLIC_WEBMCP_ENABLED=true` で再デプロイする。
2. `webmcp_runtime_config.read_tools=true` にして、サービス取得と実績検索を確認する。
3. `prepare_contact=true` にして、AI入力だけではメールが送信されないこと、同意チェックがAIから変更されないことを確認する。
4. Resend のテスト送信先と監視を確認後、`submit_contact=true` にする。
5. ご依頼・見積りは明示承認後に1通だけ届き、営業・採用・協業・取材等は自動送信を拒否することを確認する。
6. 期限切れ・改ざん・二重送信・レート制限を確認する。

フラグ変更例:

```sql
update public.webmcp_runtime_config set enabled = true, updated_at = now() where key = 'read_tools';
update public.webmcp_runtime_config set enabled = true, updated_at = now() where key = 'prepare_contact';
update public.webmcp_runtime_config set enabled = true, updated_at = now() where key = 'submit_contact';
```

## 3. 本番公開

1. ステージングと同じ環境変数を本番origin用の値で設定する。
2. master switchを有効にしてデプロイする。DBフラグはまだ無効のままにする。
3. 読み取り、入力準備、自動送信の順にDBフラグを有効化する。
4. Resend の管理者宛受信、エラー率、429件数、`webmcp_audit_logs` の結果を監視する。ログに氏名・メール・本文がないことも確認する。

## 4. 緊急停止と復旧

自動送信だけを即時停止する場合:

```sql
update public.webmcp_runtime_config set enabled = false, updated_at = now() where key = 'submit_contact';
```

全ツールを停止する場合は3フラグをすべて `false` にします。通常フォームは継続して利用できます。クライアントへのコード配信も止める場合は、`NEXT_PUBLIC_WEBMCP_ENABLED=false` に戻して再デプロイします。復旧時は、原因修正とステージング再試験後に読み取りから順に再開します。
