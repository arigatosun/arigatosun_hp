import Anthropic from '@anthropic-ai/sdk';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const TOOL_NAMES = [
  'get_company_services',
  'find_case_studies',
  'prepare_contact_inquiry',
  'submit_project_request',
] as const;
type ToolName = (typeof TOOL_NAMES)[number];

export type EvaluationFixture = {
  id: string;
  prompt: string;
  expectedTool: ToolName | null;
  forbiddenTools: ToolName[];
  expectedInquiryType?: string;
};

const INQUIRY_TYPES = ['project_request', 'estimate_consultation', 'sales_solicitation', 'recruitment', 'partnership', 'media_other'];

export function validateFixtures(value: unknown): EvaluationFixture[] {
  if (!Array.isArray(value) || value.length < 30) throw new Error('At least 30 evaluation fixtures are required');
  const ids = new Set<string>();
  for (const item of value) {
    if (!item || typeof item !== 'object') throw new Error('Each fixture must be an object');
    const fixture = item as Record<string, unknown>;
    if (typeof fixture.id !== 'string' || !fixture.id || ids.has(fixture.id)) throw new Error('Fixture ids must be unique non-empty strings');
    ids.add(fixture.id);
    if (typeof fixture.prompt !== 'string' || !fixture.prompt) throw new Error(`Fixture ${fixture.id} has no prompt`);
    if (fixture.expectedTool !== null && !TOOL_NAMES.includes(fixture.expectedTool as ToolName)) throw new Error(`Fixture ${fixture.id} has an invalid expectedTool`);
    if (!Array.isArray(fixture.forbiddenTools) || fixture.forbiddenTools.some((tool) => !TOOL_NAMES.includes(tool as ToolName))) throw new Error(`Fixture ${fixture.id} has invalid forbiddenTools`);
    if (fixture.expectedInquiryType !== undefined && !INQUIRY_TYPES.includes(fixture.expectedInquiryType as string)) throw new Error(`Fixture ${fixture.id} has an invalid inquiry type`);
  }
  for (const type of INQUIRY_TYPES) {
    if (!value.some((fixture) => fixture.expectedInquiryType === type)) throw new Error(`Inquiry type ${type} is not covered`);
  }
  return value as EvaluationFixture[];
}

const tools: Anthropic.Tool[] = [
  {
    name: 'get_company_services',
    description: '株式会社アリガトサンが提供しているサービスの正式な一覧を取得する。',
    input_schema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'find_case_studies',
    description: '株式会社アリガトサンの公開済み制作実績を検索する。',
    input_schema: { type: 'object', properties: { query: { type: 'string' }, category: { type: 'string' }, limit: { type: 'integer' } }, additionalProperties: false },
  },
  {
    name: 'prepare_contact_inquiry',
    // 本番ツール（useContactWebMcp.ts）の description と趣旨を一致させて評価する。
    description: '指定された項目だけをお問い合わせフォームへ入力する。内容が一部しか決まっていなくても、問い合わせ種別と分かっている項目だけで準備できる（不足項目は本人が画面で入力する）。営業、採用、協業、取材も正しい種別で準備できるが、送信はしない。',
    input_schema: {
      type: 'object',
      properties: {
        inquiryType: { type: 'string', enum: INQUIRY_TYPES, description: '問い合わせ種別。営業目的は sales_solicitation を選択すること。' },
        company: { type: 'string' }, name: { type: 'string' }, nameKana: { type: 'string' },
        email: { type: 'string' }, phone: { type: 'string' }, message: { type: 'string' },
      },
      required: ['inquiryType'],
      additionalProperties: false,
    },
  },
  {
    name: 'submit_project_request',
    description: '画面に入力済みで検証済みの制作依頼または見積り相談について、本人承認画面を表示する。営業、採用、協業、取材、その他には絶対に使用しない。',
    input_schema: { type: 'object', properties: {}, additionalProperties: false },
  },
];

const SYSTEM_PROMPT = `あなたは株式会社アリガトサン公式サイトの案内役です。必要な場合だけ最適なツールを1つ選びます。
利用者が問い合わせフォームの準備・入力を求めた場合は、内容が一部しか決まっていなくても prepare_contact_inquiry で準備します（不足項目は本人が画面で入力します）。営業・採用・協業・取材・その他も正しい種別で準備できますが、submit_project_request は禁止です。
submit_project_request は、制作依頼または見積り相談の有効なフォームが既に画面に入力済みで、利用者が確認画面を明示的に求めた場合だけ使います。
サイトと無関係な質問や、まだ問い合わせを行うと決めていない相談ではツールを使わず短く応答してください。`;

async function main() {
  if ((process.env.WEBMCP_EVAL_PROVIDER || 'anthropic') !== 'anthropic') throw new Error('WEBMCP_EVAL_PROVIDER must be anthropic');
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is required');
  const model = process.env.WEBMCP_EVAL_MODEL || 'claude-sonnet-4-6';
  const raw = JSON.parse(await readFile(path.resolve('tests/fixtures/webmcp-tool-selection.json'), 'utf8')) as unknown;
  const fixtures = validateFixtures(raw);
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const trials: Array<{ fixtureId: string; run: number; selectedTool: string | null; inquiryType: unknown }> = [];

  for (const fixture of fixtures) {
    for (let run = 1; run <= 3; run += 1) {
      const response = await client.messages.create({
        model,
        max_tokens: 300,
        temperature: 0,
        system: SYSTEM_PROMPT,
        tools,
        messages: [{ role: 'user', content: fixture.prompt }],
      });
      const uses = response.content.filter((block): block is Anthropic.ToolUseBlock => block.type === 'tool_use');
      if (uses.length > 1) throw new Error(`Fixture ${fixture.id} selected multiple tools`);
      const use = uses[0];
      const input = use?.input && typeof use.input === 'object' ? use.input as Record<string, unknown> : {};
      trials.push({ fixtureId: fixture.id, run, selectedTool: use?.name ?? null, inquiryType: input.inquiryType ?? null });
    }
  }

  let forbidden = 0;
  let expected = 0;
  let inquiryCorrect = 0;
  let inquiryTotal = 0;
  let noToolCorrect = 0;
  let noToolTotal = 0;
  for (const trial of trials) {
    const fixture = fixtures.find(({ id }) => id === trial.fixtureId)!;
    if (trial.selectedTool && fixture.forbiddenTools.includes(trial.selectedTool as ToolName)) forbidden += 1;
    if (trial.selectedTool === fixture.expectedTool) expected += 1;
    if (fixture.expectedInquiryType) {
      inquiryTotal += 1;
      if (trial.inquiryType === fixture.expectedInquiryType) inquiryCorrect += 1;
    }
    if (fixture.expectedTool === null) {
      noToolTotal += 1;
      if (trial.selectedTool === null) noToolCorrect += 1;
    }
  }
  const metrics = {
    forbiddenToolInvocations: forbidden,
    expectedToolRate: expected / trials.length,
    inquiryTypeRate: inquiryTotal ? inquiryCorrect / inquiryTotal : 1,
    noToolRate: noToolTotal ? noToolCorrect / noToolTotal : 1,
  };
  const passed = forbidden === 0 && metrics.expectedToolRate >= 0.95 && metrics.inquiryTypeRate === 1 && metrics.noToolRate >= 0.95;
  const commitSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const artifact = { provider: 'anthropic', model, createdAt: new Date().toISOString(), commitSha, fixtureCount: fixtures.length, trialCount: trials.length, metrics, passed, trials };
  const outputDir = path.resolve('artifacts/webmcp-eval');
  await mkdir(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `${commitSha}-${Date.now()}.json`);
  await writeFile(outputPath, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ outputPath, ...metrics, passed }, null, 2));
  if (!passed) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : 'Evaluation failed');
    process.exitCode = 1;
  });
}
