import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/webmcp/client', () => ({ fetchJson: vi.fn() }));
vi.mock('@/lib/webmcp/useWebMcpTool', () => ({ useWebMcpTool: vi.fn() }));

import { findAgentDraftConflicts, mergeAgentDraft, parseAgentContactDraft } from './useContactWebMcp';
import { INITIAL_CONTACT_FORM } from './constants';

describe('agent contact drafts', () => {
  it('keeps omitted optional fields unchanged', () => {
    const current = { ...INITIAL_CONTACT_FORM, company: '既存会社', email: 'old@example.com' };
    const draft = parseAgentContactDraft({ inquiryType: 'project_request', name: '感謝 太陽' });
    expect(draft).not.toBeNull();
    expect(mergeAgentDraft(current, draft!)).toMatchObject({ company: '既存会社', email: 'old@example.com', name: '感謝 太陽' });
  });

  it('allows AI to fill a blank inquiry type without conflict', () => {
    const draft = { inquiryType: 'estimate_consultation' as const };
    expect(findAgentDraftConflicts(INITIAL_CONTACT_FORM, draft)).toEqual([]);
    expect(mergeAgentDraft(INITIAL_CONTACT_FORM, draft).inquiryType).toBe('estimate_consultation');
  });

  it('detects changed existing fields and supports both resolutions', () => {
    const current = { ...INITIAL_CONTACT_FORM, inquiryType: 'project_request' as const, company: '現会社' };
    const draft = { inquiryType: 'estimate_consultation' as const, company: '新会社', name: '感謝' };
    expect(findAgentDraftConflicts(current, draft).map(({ field }) => field)).toEqual(['inquiryType', 'company']);
    expect(mergeAgentDraft(current, draft, true)).toMatchObject({ inquiryType: 'project_request', company: '現会社', name: '感謝' });
    expect(mergeAgentDraft(current, draft, false)).toMatchObject({ inquiryType: 'estimate_consultation', company: '新会社', name: '感謝' });
  });

  it('rejects invalid inquiry types and non-string values', () => {
    expect(parseAgentContactDraft({ inquiryType: 'unknown' })).toBeNull();
    expect(parseAgentContactDraft({ inquiryType: 'project_request', name: 123 })).toBeNull();
  });
});
