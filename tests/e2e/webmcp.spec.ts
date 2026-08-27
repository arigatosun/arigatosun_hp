import { expect, test, type Page } from '@playwright/test';

type RegisteredTool = { name: string; execute: (input: Record<string, unknown>) => unknown };

async function installModelContext(page: Page) {
  await page.addInitScript(() => {
    const tools: Record<string, RegisteredTool> = {};
    Object.defineProperty(window, '__webMcpTools', { value: tools, configurable: true });
    Object.defineProperty(document, 'modelContext', {
      configurable: true,
      value: {
        registerTool: async (tool: RegisteredTool, options?: { signal?: AbortSignal }) => {
          tools[tool.name] = tool;
          options?.signal?.addEventListener('abort', () => delete tools[tool.name], { once: true });
        },
      },
    });
  });
}

async function fulfillConfig(page: Page, overrides: Record<string, boolean> = {}) {
  await page.route('**/api/webmcp/config', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    headers: { 'Cache-Control': 'private, no-store, max-age=0' },
    body: JSON.stringify({ enabled: true, readToolsEnabled: true, prepareContactEnabled: true, submitContactEnabled: true, ...overrides }),
  }));
}

async function toolNames(page: Page) {
  return page.evaluate(() => Object.keys((window as unknown as { __webMcpTools: Record<string, unknown> }).__webMcpTools).sort());
}

test('registers four tools on contact and none in admin', async ({ page }) => {
  await installModelContext(page);
  await fulfillConfig(page);
  await page.goto('/contact');
  await expect.poll(() => toolNames(page)).toEqual(['find_case_studies', 'get_company_services', 'prepare_contact_inquiry', 'submit_project_request']);
  await page.route('**/admin', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>Admin</title><main>Admin</main>' }));
  await page.goto('/admin');
  await expect.poll(() => toolNames(page)).toEqual([]);
});

test('does not fetch WebMCP config in an unsupported browser and keeps manual form usable', async ({ page }) => {
  let configRequests = 0;
  page.on('request', (request) => { if (request.url().includes('/api/webmcp/config')) configRequests += 1; });
  await page.route('**/api/contact', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' }));
  await page.goto('/contact');
  // オーナー方針: 問い合わせ種別のUIはサイト上に一切表示しない
  await expect(page.locator('#inquiryType')).toHaveCount(0);
  await expect(page.getByText('自動送信')).toHaveCount(0);
  await page.fill('#name', 'テスト利用者');
  await page.fill('#email', 'test@example.com');
  await page.fill('#message', '営業のご連絡です');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'SEND MESSAGE >' }).click();
  await expect(page.getByText('お問い合わせいただき、誠にありがとうございます。')).toBeVisible({ timeout: 60_000 });
  expect(configRequests).toBe(0);
});

test('requires a user choice for AI conflicts and keeps manual-only inquiries out of auto-submit', async ({ page }) => {
  await installModelContext(page);
  await fulfillConfig(page);
  await page.goto('/contact');
  await page.fill('#company', '現在の会社');
  const result = await page.evaluate(() => {
    const tools = (window as unknown as { __webMcpTools: Record<string, RegisteredTool> }).__webMcpTools;
    return tools.prepare_contact_inquiry.execute({ inquiryType: 'sales_solicitation', company: 'AI提案の会社', name: '営業担当', email: 'sales@example.com', message: 'サービスのご提案です' });
  });
  expect(result).toMatchObject({ status: 'user_choice_required' });
  await expect(page.getByRole('heading', { name: 'AI入力との違いを確認' })).toBeVisible();
  await page.getByRole('button', { name: '現在の入力を残す' }).click();
  await expect(page.locator('#company')).toHaveValue('現在の会社');
  await expect(page.getByRole('status')).toContainText('AIが指定した項目');
  await expect(page.getByRole('heading', { name: '送信内容の最終確認' })).toHaveCount(0);
});

test('uses a fixed snapshot and one idempotency key, with double-click protection and Escape support', async ({ page }) => {
  await installModelContext(page);
  await fulfillConfig(page);
  let approvalKey = '';
  let submitCount = 0;
  await page.route('**/api/webmcp/contact/approval', async (route) => {
    approvalKey = (await route.request().postDataJSON()).idempotencyKey;
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"approvalToken":"token"}' });
  });
  await page.route('**/api/webmcp/contact/submit', async (route) => {
    submitCount += 1;
    const body = await route.request().postDataJSON();
    expect(body.idempotencyKey).toBe(approvalKey);
    expect(body.contact.company).toBe('確認時の会社');
    await new Promise((resolve) => setTimeout(resolve, 100));
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true,"receiptId":"receipt"}' });
  });
  await page.goto('/contact');
  await expect.poll(() => toolNames(page)).toContain('prepare_contact_inquiry');
  await page.evaluate(() => {
    const tools = (window as unknown as { __webMcpTools: Record<string, RegisteredTool> }).__webMcpTools;
    tools.prepare_contact_inquiry.execute({ inquiryType: 'project_request', company: '確認時の会社', name: '依頼者', email: 'request@example.com', message: '開発を依頼します' });
  });
  const dialog = page.getByRole('dialog', { name: '送信内容の最終確認' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await page.evaluate(() => {
    const tools = (window as unknown as { __webMcpTools: Record<string, RegisteredTool> }).__webMcpTools;
    tools.submit_project_request.execute({});
  });
  await page.getByRole('dialog', { name: '送信内容の最終確認' }).getByRole('checkbox').check();
  const submit = page.getByRole('button', { name: '承認して送信' });
  await submit.dblclick();
  await expect(page.getByText('お問い合わせいただき、誠にありがとうございます。')).toBeVisible({ timeout: 60_000 });
  expect(submitCount).toBe(1);
});
