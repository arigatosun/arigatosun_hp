# WebMCP 本番公開前レビュー 改修設計書

| 項目 | 内容 |
|---|---|
| 文書版 | 1.2 |
| 作成日 | 2026-08-27 |
| ステータス | 実装反映済み・本番公開ゲート未実施 |
| 対象ブランチ | `codex/webmcp-integration` |
| 上位文書 | `WEBMCP_REQUIREMENTS.md`、`WEBMCP_DESIGN.md` |
| 入力 | Claude Code 本番公開前コードレビュー結果 |

## 1. 目的

本書は、本番公開前コードレビューで確認された Critical、High、Medium、Low の指摘を解消し、`WEBMCP_REQUIREMENTS.md` の AC-01〜AC-19 を満たすための改修設計を定義する。

本改修が完了し、単体・結合・E2E・AIツール選択評価・ステージング実地確認・再レビューが完了するまで、以下は実施しない。

- 本番 Supabase へのマイグレーション適用
- 本番 Vercel への WebMCP 環境変数設定
- 本番 Origin Trial token の配信
- WebMCP runtime flag の有効化
- 本番公開

### 1.1 実装反映状況

2026-08-27 時点で、本書のアプリケーションコード、マイグレーション、決定的テスト、E2E、AI評価runnerを対象ブランチへ反映した。本番DB適用、Vercel環境変数設定、Origin Trial、実メール、live AI評価、staging実地確認、Claude Code再レビューは未実施であり、公開許可を意味しない。

セキュリティ中核のcoverage対象は `vitest.config.ts` で明示し、statement/branch/function/lineの全指標に80%のrelease thresholdを設定する。

### 1.2 ローカル検証結果

| 検証 | 2026-08-27 結果 |
|---|---|
| Vitest | 18 files / 60 tests 成功 |
| Coverage | statements 91.4%、branches 86.43%、functions 97.05%、lines 91.4% |
| TypeScript | `npx tsc --noEmit` 成功 |
| ESLint | error / warning 0 |
| Next.js production build | Next.js 16.3.3で54ページ生成成功。ローカルは実データへ接続しない公開Supabase placeholderを使用 |
| Playwright | desktop 4件、mobile 4件、合計8件成功 |
| Production dependency audit | `npm audit --omit=dev` 0件 |

`happy-dom`をproduction dependencyに残した構成でproduction buildが成功しており、L-1のbuild evidenceとする。開発依存には`tsx`が固定する`esbuild`由来のlow 1件が残るが、production dependency auditは0件である。上流`tsx`が修正版を許容後に更新する。

## 2. 改修の基本原則

1. 通常フォームの可用性を WebMCP より優先する。
2. WebMCP 自動送信は、依存サービス障害時に必ず fail-closed とする。
3. AI はフォーム入力案を提示できるが、既存入力の上書き、プライバシー同意、最終承認を行えない。
4. 利用者が確認した固定スナップショットと、サーバーが承認・送信する payload を一致させる。
5. DB、監査ログ、分析イベントへ PII と問い合わせ本文を保存しない。
6. 仕様と実装の差を残さず、本書を反映して既存設計書も更新する。
7. セキュリティ中核は自動テストで再現可能にする。

### 2.1 v1.1 で反映した修正設計レビュー

- R-1：strict Origin / Sec-Fetch-Site を WebMCP approval/submit に限定し、通常フォームは存在時だけ不一致を拒否する。
- R-2：cron migration は選択適用ではなく、全環境で適用して pg_cron 非対応時に安全に no-op とする。
- R-3：approval/receipt の列、制約、legacy 値を表で確定する。
- R-4：WebMCP read/config API の Cache-Control を表で確定する。
- R-5：component test だけ `jsdom` を使用する方法を確定する。
- R-6：AI 評価のモデル、実行回数、閾値、CI と release gate の境界を確定する。

## 3. スコープ

### 3.1 対象

- 通常問い合わせ API の可用性と後方互換
- Supabase RPC、RLS、権限、保持処理
- AI 入力ドラフトと競合確認 UI
- 自動送信確認ダイアログ
- 承認スナップショット、token、idempotency
- Resend の送信順序
- HTTP 境界、origin、Permissions-Policy
- 監査ログ、分析イベント、運用エラー
- 読み取りツールの検索・出力制限
- 単体、コンポーネント、結合、E2E、AI 評価
- 要件・設計・公開手順の同期

### 3.2 対象外

- 本番 DB への適用
- Vercel Production への設定・デプロイ
- 実メール送信
- Origin Trial の本番申請・token 発行
- 既存サイト全体の依存パッケージ脆弱性更新

## 4. レビュー指摘の処置方針

| ID | 判定 | 処置 |
|---|---|---|
| C-1 | 妥当・公開ブロッカー | 通常フォームに DB/secret 非依存の fallback を追加 |
| H-1 | 妥当・公開ブロッカー | RPC を `PUBLIC`、`anon`、`authenticated` から明示 revoke |
| H-2 | 妥当・公開ブロッカー | AI 入力を `pendingAgentDraft` に保持し、競合確認後に反映 |
| H-3 | 妥当・公開ブロッカー | native `<dialog>` と focus/Esc/復元/通知を実装 |
| H-4 | 妥当・公開ブロッカー | 確認開始時の immutable snapshot を送信に使用 |
| H-5 | 妥当 | 管理者通知成功後にのみ自動返信を送る |
| H-6 | 妥当・公開ブロッカー | セキュリティ中核、API、UI、E2E、AI 評価を追加 |
| M-1 | 妥当・公開ブロッカー | `Permissions-Policy: tools=(self)` に修正 |
| M-2 | 妥当 | retention と pg_cron 登録を別 migration に分離 |
| M-3 | 妥当 | 拒否・障害を allowlist code で監査 |
| M-4 | 妥当 | canonical origin は `SITE_URL`、env は追加 origin のみに使用 |
| M-5 | 妥当 | 問い合わせ種別の初期値を未選択にする |
| M-6 | 妥当 | AI 入力バナー、scroll、focus を実装 |
| M-7 | 妥当 | 期限付き legacy payload 互換を実装 |
| M-8 | 妥当 | 確認 UI に全送信項目を表示 |
| M-9 | 妥当 | 実装完了後に既存設計書を同期 |
| L-1 | 誤検知 | `happy-dom` は `@tiptap/html` の本番 server build に必要。削除しない |
| L-2 | 妥当 | 手動 Idempotency-Key を検証し最大 200 文字に制限 |
| L-3 | 妥当 | NFKC、既定 3、カテゴリ・詳細ラベル検索を実装 |
| L-4 | 妥当 | tool output を serialized 1,500 文字以内に制限 |
| L-5 | 妥当 | WebMCP 非対応ブラウザでは config API を呼ばない |
| L-6 | 妥当 | 停止時に手動フォームへの案内を返す |
| L-7 | 妥当 | SCSS を fluid・CSS token・z-index token に修正 |
| L-8 | 妥当 | coverage provider と coverage script を追加 |
| L-9 | 妥当 | Content-Type、body size、Origin、Sec-Fetch-Site を検証 |

## 5. 修正後アーキテクチャ

### 5.1 可用性境界

```text
通常フォーム
  ├─ 入力・同意・spam検査
  ├─ DB rate/idempotencyを試行
  │    ├─ 成功: durable制御
  │    └─ 設定不足/障害: process-local fallback
  └─ 管理者メール送信を継続

WebMCP自動送信
  ├─ runtime flag
  ├─ strict HTTP/origin検査
  ├─ DB rate limit
  ├─ DB approval + HMAC token
  ├─ DB atomic claim + durable idempotency
  └─ どれか失敗: 送信せず手動フォームへ誘導
```

通常フォームは可用性を優先する。WebMCP 自動送信は重複・不正送信防止を優先し、Supabase、secret、RPC のいずれかが利用できない場合は送信しない。

### 5.2 クライアント状態

```ts
type ContactUiState = {
  form: ContactFormState;
  preparedByAgent: boolean;
  pendingAgentDraft: AgentContactDraft | null;
  draftConflicts: ContactFieldConflict[];
  confirmationSnapshot: ConfirmableContact | null;
  confirmationRevision: number | null;
  formRevision: number;
  submissionState: 'idle' | 'approving' | 'submitting' | 'failed';
};
```

`form`、`pendingAgentDraft`、`confirmationSnapshot` は別オブジェクトとし、参照を共有しない。

## 6. 通常フォームの fail-open 設計

### 6.1 新規サーバーヘルパー

`src/lib/contact/rate-limit.ts`

- `checkManualContactRate(request): Promise<'allowed' | 'limited'>`
- DB 利用可能時は共有 RPC を使用する。
- `CONTACT_IP_SALT` がない、Supabase credential がない、RPC 不存在、timeout、DB error の場合は process-local fixed window へ切り替える。
- process-local fallback では raw IP を Map key としてメモリ上だけで使用し、ログ・DBへ出力しない。
- fallback 発生時は PII を含まない `MANUAL_RATE_FALLBACK` を warning として記録する。
- fallback の Map は最大件数と TTL cleanup を持ち、無制限に増加させない。

`src/lib/contact/idempotency.ts`

- `claimManualSubmission(key, payloadHash, consent): Promise<ManualClaimResult>`
- durable DB claim を優先する。
- DB が利用不能な場合は process-local Map で同一 key の多重処理を抑止する。
- fallback は「複数 instance 間の厳密保証なし」を明記し、通常フォームの可用性を優先する。
- fallback 状態は 15 分で破棄する。

### 6.2 secret の分離

- IP hash は `CONTACT_IP_SALT` を使用する。
- `WEBMCP_SESSION_SALT` を IP hash に流用しない。
- `CONTACT_IP_SALT` が未設定の場合、通常フォームは DB rate limit を使わず process-local fallback へ移る。
- WebMCP 自動送信は必要 secret 未設定時に fail-closed とする。

### 6.3 手動 API 処理順

1. Content-Type と body size を検査。`Origin` / `Sec-Fetch-Site` は存在する場合だけ検査し、不一致なら拒否する。欠落だけでは拒否しない。
2. JSON parse。
3. honeypot と最低入力時間を検査。
4. current payload または期限内 legacy payload として parse。
5. 問い合わせ種別、入力値、同意を検査。
6. `Idempotency-Key` を検査。未指定なら server で UUID を発行、指定時は 1〜200 文字の安全な文字だけ許可。
7. DB rate limit を試し、利用不能なら local fallback。
8. DB idempotency claim を試し、利用不能なら local fallback。
9. 管理者通知を送信。
10. 管理者通知成功後、自動返信を送信。
11. receipt を `sent` へ更新。更新失敗時も管理者通知受付済みの事実を warning 監査する。
12. 成功を返す。

DB fallback の発生だけを理由に通常フォームを 500 にしない。Resend 管理者通知の失敗は 500 とする。

## 7. 旧クライアント互換設計

デプロイを跨いで旧フォームを開いた利用者の入力を保護するため、1リリース限定の互換処理を設ける。

### 7.1 判定条件

以下をすべて満たす payload だけを legacy として受け付ける。

- `inquiryType`、`privacyConsent`、`privacyPolicyVersion` がすべて未指定
- 旧6項目がすべて string
- honeypot と `_t` が旧仕様に適合
- `CONTACT_LEGACY_PAYLOAD_UNTIL` が設定され、現在時刻が期限内

### 7.2 取扱い

- 内部種別を `legacy_unspecified` とする。
- WebMCP、自動送信、UI の選択肢へ含めない。
- 管理者メールに「旧フォーム互換受付」と表示する。
- receipt の policy version は `pre-webmcp-legacy` とする。
- `LEGACY_CONTACT_ACCEPTED` を PII なしで監査する。
- 互換期限後は 400 とし、ページ再読込を案内する。

互換期限と削除予定日を `WEBMCP_ROLLOUT.md` に明記する。

## 8. 問い合わせ種別設計

UI state は以下とする。

```ts
type ContactFormState = {
  inquiryType: InquiryType | '';
  // other fields
};
```

- 初期値は `''`。
- select の先頭に `選択してください` を置く。
- 空値は client/server の両方で validation error。
- `inquiryType: ''` は未入力 field として扱い、AI draft が有効な問い合わせ種別を提案・反映できる。
- WebMCP tool input は引き続き有効な `InquiryType` を必須とする。
- server domain では current type と legacy type を分離し、`legacy_unspecified` が自動送信判定へ渡らない型構造にする。

## 9. AI 入力ドラフト・競合確認設計

### 9.1 prepare tool の処理

1. tool input を schema と domain validation で検査。
2. 現在のフォームを読み取る。
3. AI が省略した任意項目は「変更なし」とし、空文字で既存値を消さない。
4. 現在値が非空、かつ AI 案と正規化後の値が異なる field を conflict とする。
5. AI 案を `pendingAgentDraft` に保存する。ここでは `form` を変更しない。
6. conflict がなければ、空欄だけへ反映する。
7. conflict があれば `needs_user_confirmation` を返し、競合確認 UI を表示する。

### 9.2 競合確認 UI

各 conflict に以下を表示する。

- field label
- 現在の値
- AI の提案値

操作:

- `現在の入力を保持して空欄だけ反映`（既定・推奨）
- `AIの提案で置き換える`
- `キャンセル`

本文、メール、電話等の値は UI のみに表示し、ログや分析イベントへ渡さない。

### 9.3 AI 入力状態の表示

反映後はフォーム上部に次を表示する。

> AI が入力を補助した内容です。送信前にすべての項目を確認してください。

- 色だけに依存しないテキストとアイコンを使用する。
- `role="status"` または `aria-live="polite"` で通知する。
- form container へ `scrollIntoView({block: 'start'})` する。
- 最初に反映した field、または最初の validation error へ focus する。
- `preparedByAgent` は利用者が全項目を編集しても送信完了までは保持する。

### 9.4 確認中の tool 再実行

`confirmationSnapshot` が存在する間、`prepare_contact_inquiry` と `submit_project_request` の execute は state を変更しない。

```json
{
  "status": "confirmation_in_progress",
  "message": "利用者が確認中です。確認完了またはキャンセル後に再実行してください。"
}
```

## 10. 自動送信確認ダイアログ設計

### 10.1 native dialog

`ContactConfirmationDialog` は `<dialog>` と `showModal()` を使用する。

- open 時に `showModal()`。
- `cancel` event で Esc を処理。
- native modal により背景を inert 化し、focus を dialog 内に閉じる。
- open 前の active element を保持し、close 後に focus を復元する。
- 初期 focus は見出しまたは `戻って修正` ボタンへ置く。
- `aria-labelledby`、`aria-describedby` を設定する。
- 送信領域に `aria-busy`、状態文言に `aria-live="polite"` を設定する。
- error は `role="alert"`。

### 10.2 immutable snapshot

ダイアログを開く処理は現在の form を clone し、`confirmationSnapshot` と `formRevision` を同時に固定する。

```ts
openConfirmation(structuredClone(validatedContact), formRevision);
```

- ダイアログ表示と approval/submit request は `formData` ではなく snapshot を使用する。
- snapshot object は変更しない。
- dialog open 中に form revision が変わった場合は dialog を閉じ、`内容が変更されたため再確認してください` と通知する。
- tool 再実行は 9.4 のとおり拒否する。
- approval API で snapshot hash を作成し、submit API で同じ hash を再検証する。

### 10.3 表示項目

- 問い合わせ種別
- 会社名・部署名
- 氏名
- ヨミガナ
- メールアドレス
- 電話番号
- 問い合わせ本文
- プライバシーポリシー版とリンク

任意項目が空の場合は `未入力` と表示する。

### 10.4 同意

- 同意 checkbox は利用者の DOM 操作だけで変更する。
- tool schema と tool execute に同意 setter を渡さない。
- policy version を checkbox label の近くに表示する。
- snapshot 生成後に同意が外れた場合、承認ボタンを無効化する。

## 11. 承認・idempotency 設計

### 11.1 承認開始

- `idempotencyKey` は利用者が承認ボタンを押した時に client で一度だけ生成する。
- approval request と submit request の両方へ同じ key を渡す。
- approval record に raw key ではなく `idempotency_key_hash`、`privacy_policy_version`、`privacy_consented_at` を保存する。
- token claims は approval ID、payload hash、session hash、idempotency key hash、expiresAt を含む。
- PII は token/DB へ保存しない。

### 11.2 claim

RPC は単一 transaction 内で次を行う。

1. idempotency receipt を insert。競合時は既存 status を返す。
2. approval ID、payload hash、session hash、idempotency key、期限、pending status を条件付き更新。
3. 条件不一致なら新規 receipt insert を取り消す。
4. 成功時だけ `claimed`。

### 11.3 receipt

`contact_submission_receipts` に以下を持たせる。

- internal idempotency key
- `public_receipt_id` UUID
- source
- payload hash
- privacy policy version
- consented at
- status: `processing | sent | failed`
- created/completed timestamps

API の成功レスポンスは `public_receipt_id` だけを返し、payload hash や内部 key を返さない。

## 12. Resend 送信設計

`sendContactEmails()` を逐次処理へ変更する。

1. 管理者通知を送信。
2. rejected または response error の場合は throw。自動返信は送らない。
3. 管理者通知成功後、自動返信を送信。
4. 自動返信だけ失敗した場合は受付成功を維持し、`AUTO_REPLY_FAILED` を監査する。
5. Resend response、宛先、本文、token をログへ出さない。

これにより、会社側で受付が成立していないのに利用者へ「受付完了」が届く状態を防ぐ。

## 13. HTTP・origin 境界設計

### 13.1 共通 JSON helper

`src/lib/http/read-json.ts` を追加する。

- `Content-Type` が `application/json` または `application/*+json` であること。
- `Content-Length` が上限を超える場合は本文を読まず 413。
- 本文を text として読み、UTF-8 byte length を再検査。
- WebMCP contact API は最大 64 KiB。
- WebMCP API の Cache-Control は 13.4 の表に従う。
- JSON parse 失敗は 400。

### 13.2 origin

- canonical origin は `src/lib/site.ts` の `SITE_URL` から生成する。
- `WEBMCP_ALLOWED_ORIGINS` は staging 等の追加 origin 専用とする。
- origin は完全一致で比較し、suffix 比較をしない。
- CORS allow header は追加しない。

API ごとの検査:

| API | `Origin` 欠落 | `Origin` 不一致 | `Sec-Fetch-Site` 欠落 | `Sec-Fetch-Site` 不一致 |
|---|---|---|---|---|
| `/api/webmcp/contact/approval` | production は 403 | 403 | production は 403 | `same-origin` 以外 403 |
| `/api/webmcp/contact/submit` | production は 403 | 403 | production は 403 | `same-origin` 以外 403 |
| `/api/contact` | 許可 | 403 | 許可 | `same-origin` 以外 403 |

通常フォームは古いブラウザ、プライバシーツール、header stripping proxy によるヘッダー欠落だけでは拒否しない。一方、ヘッダーが存在して不一致の場合は CSRF の疑いとして拒否する。WebMCP approval/submit はセキュリティ境界であるため production では両ヘッダーを必須とする。

test/非ブラウザ smoke は production code に例外を追加せず、test helper が正しいヘッダーを付与する。

### 13.3 Permissions Policy

```http
Permissions-Policy: tools=(self)
```

`model-context=(self)` は削除する。header test で `tools=(self)` の完全一致を検証する。

### 13.4 Cache-Control

runtime flag の停止を即時反映し、kill switch が CDN/browser cache に阻害されないよう、WebMCP API は初期リリースですべて `no-store` とする。

| API | Cache-Control | 理由 |
|---|---|---|
| `GET /api/webmcp/config` | `private, no-store, max-age=0` | runtime flag の即時反映 |
| `GET /api/webmcp/services` | `private, no-store, max-age=0` | read flag 停止を即時反映 |
| `POST /api/webmcp/case-studies` | `private, no-store, max-age=0` | query response と read flag の即時反映 |
| `POST /api/webmcp/contact/approval` | `private, no-store, max-age=0` | token/承認レスポンスを保存しない |
| `POST /api/webmcp/contact/submit` | `private, no-store, max-age=0` | 送信結果を保存しない |

将来 services data を CDN cache する場合は、runtime flag 判定を cache 外へ分離してから別設計で導入する。

## 14. Supabase migration 設計

### 14.1 migration 構成

未適用のため既存 migration を修正し、次の順にする。

1. `20260827000000_webmcp_runtime_config.sql`
2. `20260827000100_webmcp_contact_security.sql`
3. `20260827000200_webmcp_retention.sql`
   - index
   - cleanup function
   - pg_cron 非依存
4. `20260827000300_webmcp_retention_cron.sql`
   - 全環境で通常どおり適用する
   - `pg_cron` extension の作成と unschedule/schedule を `DO` block 内で試行する
   - extension 不在、権限不足、cron schema 不在、schedule 失敗は `NOTICE/WARNING` を残して no-op 成功とする
   - cron object の参照は dynamic SQL とし、pg_cron 不在時の parse/resolve failure を避ける

Supabase CLI の `db reset`、`db push`、CI は 000〜003 を常に順番に全適用する。環境ごとの migration 選択適用を運用前提にしない。本番・staging では適用後に `cron.job` を検査し、job が存在しない場合は公開ブロッカーとして扱う。

003 の構造:

```sql
do $$
begin
  begin
    execute 'create extension if not exists pg_cron';
  exception when others then
      raise notice 'pg_cron unavailable; retention cron was not scheduled: %', sqlstate;
      return;
  end;

  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    raise notice 'pg_cron unavailable; retention cron was not scheduled';
    return;
  end if;

  begin
    -- cron.job / cron.schedule への操作は dynamic SQL で実行する。
    execute '<unschedule existing job>';
    execute '<schedule cleanup job>';
  exception when others then
    raise warning 'retention cron registration skipped: %', sqlstate;
  end;
end $$;
```

### 14.2 列・制約

#### `webmcp_contact_approvals`

| column | type | 制約・用途 |
|---|---|---|
| `id` | uuid | PK、`default gen_random_uuid()` |
| `payload_hash` | text | not null、64文字 |
| `session_hash` | text | not null、64文字 |
| `ip_hash` | text | not null、64文字、raw IPは保存しない |
| `idempotency_key_hash` | text | not null、64文字、unique。raw keyは保存しない |
| `inquiry_type` | text | not null、`project_request` / `estimate_consultation` のみ |
| `privacy_policy_version` | text | not null、1〜64文字 |
| `privacy_consented_at` | timestamptz | not null |
| `status` | text | not null、`pending` / `consumed` / `expired` |
| `expires_at` | timestamptz | not null |
| `consumed_at` | timestamptz | nullable |
| `created_at` | timestamptz | not null、default now() |

`idempotency_key_hash` の unique 制約により、同じ idempotency key を別 approval に再結合できない。新しい承認を開始する場合は client が新しい key を生成する。

#### `contact_submission_receipts`

| column | type | 制約・用途 |
|---|---|---|
| `idempotency_key` | text | PK、1〜200文字。内部利用だけ |
| `public_receipt_id` | uuid | not null、unique、default gen_random_uuid() |
| `source` | text | not null、`manual_form` / `webmcp` / `legacy_manual` |
| `payload_hash` | text | not null、64文字 |
| `privacy_policy_version` | text | not null、1〜64文字 |
| `privacy_consented_at` | timestamptz | not null |
| `status` | text | not null、`processing` / `sent` / `failed` |
| `created_at` | timestamptz | not null、default now() |
| `completed_at` | timestamptz | nullable |

legacy 互換受付は `source='legacy_manual'`、`privacy_policy_version='pre-webmcp-legacy'` とする。旧画面で checkbox が必須だったことを前提に、server 受付時刻を `privacy_consented_at` として記録する。これは current payload の明示同意と区別して監査する。

#### RPC引数と整合

- approval 作成時に server が raw idempotency key を SHA-256 し、approval へ hash だけを保存する。
- claim RPC は raw key、key hash、approval ID、payload hash、session hash を受け取る。
- RPC は raw key から receipt を作り、approval の `idempotency_key_hash` と引数 hash が一致する場合だけ consume する。
- `legacy_manual` は WebMCP approval/claim RPC を通らず、manual claim だけを使用する。

### 14.3 RPC 権限

全 security definer function に対して次を実行する。

```sql
revoke all on function public.<function>(...) from public;
revoke execute on function public.<function>(...) from anon, authenticated;
grant execute on function public.<function>(...) to service_role;
```

対象:

- rate gate
- WebMCP approval claim
- manual submission claim
- cleanup function

### 14.4 migration 検証 SQL

適用後に staging で以下を確認する。

```sql
select routine_name, grantee, privilege_type
from information_schema.routine_privileges
where routine_schema = 'public'
  and routine_name like '%contact%';
```

期待値は `service_role` の EXECUTE のみ。anon key からの RPC 呼び出しは 401/403 になることを結合テストする。

全環境で 000〜003 が成功することを確認する。本番・staging では追加で次を確認する。

```sql
select jobname, schedule, command, active
from cron.job
where jobname = 'cleanup-webmcp-data';
```

### 14.5 保持期間

- approval: pending/expired は 24 時間、consumed は監査要件に合わせ 90 日
- receipt: 90 日
- audit log: 90 日
- rate bucket: 24 時間以内

PII は保存しない。保持期間を `WEBMCP_DESIGN.md` と一致させる。

## 15. 監査・エラー設計

### 15.1 allowlist code

```ts
type WebMcpAuditResult =
  | 'APPROVAL_CREATED'
  | 'CONTACT_SENT'
  | 'AUTO_REPLY_FAILED'
  | 'INVALID_TOKEN'
  | 'EXPIRED_TOKEN'
  | 'PAYLOAD_MISMATCH'
  | 'SESSION_MISMATCH'
  | 'IDEMPOTENCY_MISMATCH'
  | 'APPROVAL_CONSUMED'
  | 'TYPE_NOT_ALLOWED'
  | 'RATE_LIMITED'
  | 'ORIGIN_REJECTED'
  | 'RUNTIME_DISABLED'
  | 'MANUAL_RATE_FALLBACK'
  | 'MANUAL_IDEMPOTENCY_FALLBACK'
  | 'LEGACY_CONTACT_ACCEPTED'
  | 'DB_ERROR'
  | 'EMAIL_ERROR';
```

### 15.2 記録項目

- request ID
- event/tool name
- result code
- inquiry type
- payload hash（必要な更新系だけ）
- session hash（必要な更新系だけ）
- DB/SDK error code または error class name
- timestamp

氏名、会社名、メール、電話、本文、raw IP、token、Resend response は記録しない。

### 15.3 監査失敗

- 拒否・送信イベントの監査 insert は best effort とする。
- 監査 insert 失敗だけでセキュリティ判定を変えない。
- app log には operation と縮約 error code だけを出す。

## 16. 読み取りツール改修

### 16.1 非対応ブラウザ

`WebMcpProvider` と `useContactWebMcp` は次を満たす場合だけ config API を呼ぶ。

```ts
process.env.NEXT_PUBLIC_WEBMCP_ENABLED === 'true' &&
'modelContext' in document &&
Boolean(document.modelContext)
```

Safari、Firefox 等では fetch、登録、console warning を発生させない。

### 16.2 実績検索

- query は `normalize('NFKC')`、trim、lowercase。
- 検索対象は client、title、term、categories、details.label、details.value。
- limit 未指定は 3、最小 1、最大 5。
- 0 件時は空配列と短い説明。
- HTML として解釈しない。

### 16.3 1,500 文字制限

共通 `limitToolOutput()` を追加する。

- JSON serialize 後の文字数を 1,500 以下にする。
- services は description を安全に要約する。
- case studies は result 単位で末尾から減らし、途中の JSON を切断しない。
- truncation 時は `truncated: true` と一覧 URL を返す。
- PII を含めない。

## 17. 停止・復旧 UX

自動送信が無効、設定不備、DB 障害の場合、tool/API は次の構造を返す。

```json
{
  "status": "manual_required",
  "code": "AUTOMATION_UNAVAILABLE",
  "message": "自動送信は現在利用できません。内容を確認し、お問い合わせフォームの送信ボタンから送信してください。",
  "contactUrl": "/contact"
}
```

入力済み form state は維持する。利用者は再入力せず通常送信へ切り替えられる。

## 18. SCSS・UI規約

ダイアログとバナーはリポジトリ規約に従う。

- scalable 値は `@include fluid()`。
- 8px を超える固定 padding/margin/width/height を書かない。
- overlay 色は CSS variable を追加または既存 token を使用。
- z-index は既存 token、なければ global token として `--z-modal` を定義。
- 320/375/768/1024/1200px と 200% zoom で欠落しない。
- 2カラム要素には `@include sp` で縦積みを定義。

## 19. テスト設計

### 19.1 テスト基盤

追加:

- `@vitest/coverage-v8`
- React component test に必要な Node 20 対応版 `jsdom`
- `@testing-library/react`
- `@testing-library/user-event`
- `@testing-library/jest-dom`

script:

```json
{
  "test": "vitest run",
  "test:coverage": "vitest run --coverage",
  "test:e2e": "playwright test",
  "test:webmcp-eval": "tsx scripts/webmcp/evaluate-tool-selection.ts"
}
```

domain/security/application の新規コードは statement/branch/function/line 80% 以上を必須とする。

`vitest.config.ts` の global default は現状どおり `environment: 'node'` とする。component test ファイルだけ、先頭に次の directive を付けて `jsdom` へ切り替える。

```ts
// @vitest-environment jsdom
```

これにより server/domain test が意図せず DOM environment で動作することを防ぐ。component test 共通 setup で `@testing-library/jest-dom/vitest` を読み込む。

### 19.2 単体テスト

- HMAC token 正常系
- 1 byte 改ざん
- signature 長不一致
- 期限切れ
- secret 不一致
- malformed token/claims
- payload/session/idempotency hash 不一致
- inquiry type allowlist 全種別
- blank inquiry type
- legacy payload 期限内/期限外
- manual DB fallback
- local rate limit と Map cleanup
- idempotency key 長さ・文字種
- NFKC 検索、default 3、max 5、0 件
- output 1,500 文字上限
- audit object に PII key/value がないこと

時刻と UUID は注入可能にし、fake timer で決定的に検証する。

### 19.3 コンポーネントテスト

- prepare で既存値を上書きしない
- conflict UI の3操作
- AI 入力バナー
- scroll/focus
- dialog の全項目表示
- Esc close
- focus trap と focus restore
- consent はユーザー操作だけで変更
- dialog 中の tool 再実行を拒否
- snapshot 後の form change で再確認
- aria-live、aria-busy、alert

### 19.4 Route Handler 結合テスト

Supabase と Resend を interface 越しに mock する。

- manual: Supabase credential 未設定でも fallback で管理者通知へ進む
- manual: RPC 不存在、timeout、DB 5xx でも fallback
- auto: 同じ障害では送信せず manual_required
- sales/recruitment/partnership/media_other 拒否
- invalid/expired/modified approval 拒否
- same idempotency sent はメール再送せず成功
- processing/failed は自動再送しない
- 管理者通知失敗時に自動返信を呼ばない
- 自動返信だけ失敗時は受付成功
- invalid origin/fetch-site/content-type/body size
- manual API は Origin/Sec-Fetch-Site 欠落を許可し、存在する不正値だけ拒否する
- WebMCP approval/submit は production 相当で両ヘッダー欠落を拒否する
- rejection audit code
- PII 非記録

### 19.5 SQL/RPC テスト

staging またはローカル Supabase で以下を検証する。

- anon/authenticated の table access 拒否
- anon/authenticated の RPC execute 拒否
- service_role の execute 成功
- approval 単回消費
- 同時 claim は1件だけ成功
- idempotency conflict
- invalid approval 時の receipt rollback
- rate counter の原子性
- cleanup の保持期間
- pg_cron 非対応・権限不足環境でも migration 000〜003 がすべて成功し、003 だけ no-op になる
- pg_cron 対応 staging では cleanup job が1件だけ active になる

### 19.6 E2E

Playwright で `document.modelContext` の test double を `addInitScript` し、ブラウザネイティブ機能に依存しない CI シナリオを作る。Origin Trial 対応 Chrome の native smoke は staging の人手試験として別に行う。

CI E2E:

- `/contact` で4ツールが登録される
- `/admin` で0件
- unsupported 状態で config fetch なし、通常フォーム送信可能
- AI draft、競合、バナー、確認、同意、承認
- manual-only 種別
- 二重クリック
- kill switch から手動送信への切替
- keyboard、Esc、mobile viewport

### 19.7 AI ツール選択評価

- 30件以上の fixture を `tests/fixtures/webmcp-tool-selection.json` に保存。
- service question、case study、依頼、見積り、営業、採用、協業、取材、曖昧相談、無関係質問を含める。
- 各 fixture に expected tool、forbidden tools、expected inquiry type を定義。
- 自動評価 provider は既存依存の Anthropic SDK を使用し、`WEBMCP_EVAL_PROVIDER=anthropic` とする。
- model は `WEBMCP_EVAL_MODEL=claude-sonnet-4-6` を初期値として固定する。release ごとに実際に使用した provider、model ID、実行日時、commit SHA を結果へ記録する。
- temperature は 0、tool definitions と system prompt は version 管理した固定値を使用する。
- 各 fixture を3回、合計90試行以上実行する。

合格条件:

| 指標 | 閾値 |
|---|---|
| forbidden tool invocation | 全試行で 0 件 |
| 営業・採用・協業・取材・その他で `submit_project_request` 選択 | 全試行で 0 件 |
| contact fixture の inquiry type | prepare を呼んだ全試行で正解（誤種別 0 件）。ツールを呼ばない保留は安全側の挙動として expected tool 選択率で管理する |
| expected tool 選択率 | 全試行の 95% 以上 |
| no-tool fixture で不要な tool を選ばない率 | 95% 以上 |
| API error / parse不能 | 0 件。発生時は評価 run 自体を無効とし再実行 |

運用:

- 通常 PR CI では有料・非決定的な live LLM 評価を実行しない。
- PR CI は fixture schema、件数、全 inquiry type の網羅、runner の unit test を決定的に検証する。
- `npm run test:webmcp-eval` は release candidate commit に対する手動 release gate として、API key を持つ承認済み環境で実行する。
- 結果 JSON を CI/release artifact として保存し、commit SHA と結び付ける。問い合わせ PII は fixture と結果へ含めない。
- model を変更する場合は基準値を流用せず、変更後 model で全90試行を再実行する。
- staging の native browser agent では、manual-only と無関係質問を中心とした高リスク fixture を人手で再実行し、forbidden tool invocation 0 件を確認する。

## 20. ファイル変更計画

### 20.1 新規

- `src/lib/contact/rate-limit.ts`
- `src/lib/contact/idempotency.ts`
- `src/lib/contact/legacy.ts`
- `src/lib/http/read-json.ts`
- `src/lib/webmcp/audit.ts`
- `src/lib/webmcp/output-limit.ts`
- `src/components/contact/AgentDraftReviewDialog/*`
- approval/API/component/integration tests
- Playwright config と E2E tests
- AI evaluation fixture/runner
- `20260827000300_webmcp_retention_cron.sql`

### 20.2 主な更新

- `src/app/(site)/contact/page.tsx`
- `src/components/contact/ContactConfirmationDialog/*`
- `src/lib/contact/useContactWebMcp.ts`
- `src/lib/contact/types.ts`
- `src/lib/contact/constants.ts`
- `src/lib/contact/validation.ts`
- `src/lib/contact/email.ts`
- `src/app/api/contact/route.ts`
- `src/app/api/webmcp/contact/approval/route.ts`
- `src/app/api/webmcp/contact/submit/route.ts`
- read tool routes/provider
- Supabase migration 001/002
- `next.config.ts`
- `.env.example`
- test/package configuration
- `WEBMCP_DESIGN.md`
- `WEBMCP_ROLLOUT.md`

## 21. 実装順序

### Phase 1: 回帰・DB権限

1. manual fallback
2. secret 分離
3. idempotency validation
4. RPC revoke
5. retention/cron migration 分離
6. sequential email

### Phase 2: UI安全性

1. blank inquiry type
2. pending agent draft
3. conflict UI
4. AI banner、scroll、focus
5. native dialog
6. immutable snapshot
7. 全項目表示

### Phase 3: HTTP・監査・読み取り

1. HTTP JSON helper
2. origin/fetch-site
3. Permissions-Policy
4. rejection audit
5. unsupported browser no-fetch
6. search/output limit

### Phase 4: テスト・文書

1. unit/component/integration
2. SQL tests
3. E2E
4. 30件 AI evaluation
5. coverage 80%
6. design/rollout 同期
7. Claude Code 再レビュー

## 22. 受入条件

### 22.1 レビュー指摘

- C-1、H-1〜H-6、M-1〜M-9、L-2〜L-9 が解消されている。
- L-1 は誤検知の理由と build evidence を設計書に記録している。

### 22.2 決定的な自動検証

```text
npm test
npm run test:coverage
npx tsc --noEmit
npm run lint
npm run build
npm run test:e2e
```

すべて成功すること。

### 22.2.1 Release AI 評価

release candidate commit で次を承認済み環境から実行する。

```text
npm run test:webmcp-eval
```

19.7 の全閾値を満たし、結果 artifact の commit SHA が公開対象 commit と一致すること。live model 評価は通常 PR CI の決定的テストとは分離するが、本番公開の必須 release gate とする。

### 22.3 AC

AC-01〜AC-19 を Pass または、実環境が必要な項目は staging で Pass とする。`未検証`、`条件付き Pass`、`Fail` が1件でも残る場合は本番公開しない。

### 22.4 人手確認

- staging migration 適用
- anon/authenticated RPC 拒否
- Chrome Origin Trial で4ツール
- `/admin` で0ツール
- Safari/Firefox 通常表示
- Resend 管理者通知1通
- kill switch と手動 fallback
- 320/375/768/1024/1200px、200% zoom、keyboard、screen reader
- プライバシーポリシー責任者承認

## 23. 要件・指摘トレーサビリティ

| 対象 | 本書 |
|---|---|
| AC-01、AC-03 | 16、19.6 |
| AC-02、AC-14 | 5、6、17、19.4〜19.6 |
| AC-04、AC-05 | 16、19.2、19.4 |
| AC-06、AC-07 | 9、10、19.3 |
| AC-08 承認後1件送信 | 10〜12、19.2〜19.5 |
| AC-09 manual-only強制 | 8、11、19.2〜19.4 |
| AC-10 編集時の承認無効化 | 10.2、19.3〜19.4 |
| AC-11 不正・期限切れ・使用済み承認拒否 | 11、19.2、19.4〜19.5 |
| AC-19 管理者通知受付後の成功 | 12、19.4 |
| AC-12 | 6、14、19.5 |
| AC-13 | 15、19 |
| AC-15、AC-16 | 19 |
| AC-17 | 13.3 |
| AC-18 | 17、22.4 |
| C-1 | 5、6 |
| H-1 | 14.3〜14.4 |
| H-2、M-6 | 9 |
| H-3、H-4、M-8 | 10 |
| H-5 | 12 |
| H-6 | 19 |
| M-1、M-4、L-9 | 13 |
| M-2 | 14.1 |
| M-3 | 15 |
| M-5、M-7 | 7、8 |
| M-9 | 20〜22 |
| L-2 | 6.3 |
| L-3〜L-6 | 16〜17 |
| L-7 | 18 |
| L-8 | 19.1 |
| R-1 | 6.3、13.2、19.4 |
| R-2 | 14.1、14.4、19.5 |
| R-3 | 14.2 |
| R-4 | 13.4 |
| R-5 | 19.1、19.3 |
| R-6 | 19.7、22.2.1 |

## 24. 公開判定

本書の実装完了だけでは公開可としない。以下の順に判定する。

1. 全自動検証成功
2. Claude Code 再レビューで Critical/High 0 件
3. Medium のうち要件違反 0 件
4. staging migration・RLS/RPC 実地確認
5. staging WebMCP/Resend/E2E 成功
6. 責任者によるプライバシー文言承認
7. `WEBMCP_ROLLOUT.md` に従った段階公開承認

いずれかを満たさない場合、本番公開作業へ進まない。
