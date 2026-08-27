import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock('resend', () => ({
  Resend: class {
    emails = { send: mocks.send };
  },
}));

import { sendContactEmails } from './email';

const contact = {
  inquiryType: 'project_request' as const,
  company: '株式会社テスト',
  name: '感謝 太陽',
  nameKana: 'カンシャ タイヨウ',
  email: 'user@example.com',
  phone: '03-0000-0000',
  message: '相談内容',
};

describe('sendContactEmails', () => {
  beforeEach(() => {
    vi.stubEnv('RESEND_API_KEY', 're_test');
    mocks.send.mockReset();
  });
  afterEach(() => vi.unstubAllEnvs());

  it('sends the admin notification before the auto reply', async () => {
    mocks.send.mockResolvedValueOnce({ data: {}, error: null }).mockResolvedValueOnce({ data: {}, error: null });
    await expect(sendContactEmails(contact, 'webmcp')).resolves.toEqual({ autoReplySent: true });
    expect(mocks.send).toHaveBeenCalledTimes(2);
    expect(mocks.send.mock.calls[0][0].to).toEqual(['info@arigatosun.com']);
    expect(mocks.send.mock.calls[1][0].to).toEqual(['user@example.com']);
  });

  it('never sends an auto reply when the admin notification fails', async () => {
    mocks.send.mockResolvedValueOnce({ data: null, error: { message: 'failed' } });
    await expect(sendContactEmails(contact, 'manual_form')).rejects.toThrow('Admin notification failed');
    expect(mocks.send).toHaveBeenCalledTimes(1);
  });

  it('reports auto reply failure after successful admin notification', async () => {
    mocks.send.mockResolvedValueOnce({ data: {}, error: null }).mockResolvedValueOnce({ data: null, error: { message: 'failed' } });
    await expect(sendContactEmails(contact, 'manual_form')).resolves.toEqual({ autoReplySent: false });
  });

  it('handles a thrown auto-reply error after a successful legacy notification', async () => {
    mocks.send.mockResolvedValueOnce({ data: {}, error: null }).mockRejectedValueOnce(new Error('network'));
    await expect(sendContactEmails({ ...contact, company: '', nameKana: '', phone: '', message: '<script>unsafe</script>' }, 'legacy_manual'))
      .resolves.toEqual({ autoReplySent: false });
    expect(mocks.send.mock.calls[0][0].html).toContain('&lt;script&gt;unsafe&lt;/script&gt;');
  });

  it('fails before sending when the API key is absent', async () => {
    vi.stubEnv('RESEND_API_KEY', '');
    await expect(sendContactEmails(contact, 'manual_form')).rejects.toThrow('RESEND_API_KEY');
    expect(mocks.send).not.toHaveBeenCalled();
  });
});
