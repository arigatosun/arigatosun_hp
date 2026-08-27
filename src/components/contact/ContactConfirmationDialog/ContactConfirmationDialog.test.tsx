// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mocks = vi.hoisted(() => ({ fetchJson: vi.fn(), push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock('@/lib/webmcp/client', () => ({
  createWebMcpSessionId: () => 'session-id',
  fetchJson: mocks.fetchJson,
}));

import ContactConfirmationDialog from './ContactConfirmationDialog';

const contact = {
  inquiryType: 'project_request' as const,
  company: '株式会社テスト',
  name: '感謝 太陽',
  nameKana: 'カンシャ タイヨウ',
  email: 'user@example.com',
  phone: '03-0000-0000',
  message: 'AI開発について相談します。',
};

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() { this.open = true; };
  HTMLDialogElement.prototype.close = function close() { this.open = false; };
});

afterEach(() => cleanup());

describe('ContactConfirmationDialog', () => {
  beforeEach(() => {
    mocks.fetchJson.mockReset();
    mocks.push.mockReset();
  });

  it('shows every field from the immutable contact snapshot', async () => {
    render(<ContactConfirmationDialog open contact={contact} privacyConsent onPrivacyConsentChange={vi.fn()} onClose={vi.fn()} />);
    expect(await screen.findByRole('dialog')).toBeVisible();
    for (const value of ['制作・開発のご依頼', '株式会社テスト', '感謝 太陽', 'カンシャ タイヨウ', 'user@example.com', '03-0000-0000', 'AI開発について相談します。']) {
      expect(screen.getByText(value)).toBeVisible();
    }
    expect(screen.getByRole('heading', { name: '送信内容の最終確認' })).toHaveFocus();
  });

  it('uses one idempotency key for both approval and submit', async () => {
    mocks.fetchJson.mockResolvedValueOnce({ approvalToken: 'approval-token' }).mockResolvedValueOnce({ success: true });
    render(<ContactConfirmationDialog open contact={contact} privacyConsent onPrivacyConsentChange={vi.fn()} onClose={vi.fn()} />);
    await userEvent.click(await screen.findByRole('button', { name: '承認して送信' }));
    await waitFor(() => expect(mocks.fetchJson).toHaveBeenCalledTimes(2));
    const approvalBody = JSON.parse(mocks.fetchJson.mock.calls[0][1].body as string);
    const submitBody = JSON.parse(mocks.fetchJson.mock.calls[1][1].body as string);
    expect(approvalBody.idempotencyKey).toBeTruthy();
    expect(submitBody.idempotencyKey).toBe(approvalBody.idempotencyKey);
    expect(submitBody.contact).toEqual(contact);
    expect(mocks.push).toHaveBeenCalledWith('/contact/thanks');
  });

  it('does not close with Escape while sending', async () => {
    let resolveApproval: ((value: unknown) => void) | undefined;
    mocks.fetchJson.mockImplementationOnce(() => new Promise((resolve) => { resolveApproval = resolve; }));
    const onClose = vi.fn();
    render(<ContactConfirmationDialog open contact={contact} privacyConsent onPrivacyConsentChange={vi.fn()} onClose={onClose} />);
    await userEvent.click(await screen.findByRole('button', { name: '承認して送信' }));
    await userEvent.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();
    resolveApproval?.({ approvalToken: 'approval-token' });
  });

  it('restores focus when the dialog is unmounted by its parent', async () => {
    const trigger = document.createElement('button');
    trigger.textContent = '確認を開く';
    document.body.appendChild(trigger);
    trigger.focus();
    const view = render(<ContactConfirmationDialog open contact={contact} privacyConsent onPrivacyConsentChange={vi.fn()} onClose={vi.fn()} />);
    await screen.findByRole('dialog');
    view.unmount();
    expect(trigger).toHaveFocus();
    trigger.remove();
  });
});
