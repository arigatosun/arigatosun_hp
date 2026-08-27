// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AgentDraftReviewDialog from './AgentDraftReviewDialog';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() { this.open = true; };
  HTMLDialogElement.prototype.close = function close() { this.open = false; };
});

afterEach(() => cleanup());

describe('AgentDraftReviewDialog', () => {
  const conflicts = [{ field: 'company' as const, currentValue: '現在の会社', proposedValue: 'AI提案の会社' }];

  it('shows current and proposed values without treating either as HTML', async () => {
    render(<AgentDraftReviewDialog conflicts={[...conflicts, { field: 'message', currentValue: '<b>現在</b>', proposedValue: '<script>提案</script>' }]} onResolve={vi.fn()} />);
    expect(await screen.findByText('現在の会社')).toBeVisible();
    expect(screen.getByText('AI提案の会社')).toBeVisible();
    expect(screen.getByText('<b>現在</b>')).toBeVisible();
    expect(document.querySelector('script')).toBeNull();
  });

  it('returns the selected conflict resolution', async () => {
    const onResolve = vi.fn();
    render(<AgentDraftReviewDialog conflicts={conflicts} onResolve={onResolve} />);
    await userEvent.click(await screen.findByRole('button', { name: '現在の入力を残す' }));
    expect(onResolve).toHaveBeenCalledWith('preserve');
  });
});
