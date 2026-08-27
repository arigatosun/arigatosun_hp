import { describe, expect, it } from 'vitest';
import { INITIAL_CONTACT_FORM, canAutoSubmitInquiry } from './constants';
import { parseContactForm, validateContact, validateContactField, validateSubmissionContact } from './validation';

describe('contact policy and validation', () => {
  it('allows automatic submission only for requests and estimates', () => {
    expect(canAutoSubmitInquiry('project_request')).toBe(true);
    expect(canAutoSubmitInquiry('estimate_consultation')).toBe(true);
    expect(canAutoSubmitInquiry('sales_solicitation')).toBe(false);
    expect(canAutoSubmitInquiry('recruitment')).toBe(false);
    expect(canAutoSubmitInquiry('partnership')).toBe(false);
    expect(canAutoSubmitInquiry('media_other')).toBe(false);
  });

  it('requires name, email and message', () => {
    expect(validateContact(INITIAL_CONTACT_FORM)).toMatchObject({
      name: expect.any(String), email: expect.any(String), message: expect.any(String),
    });
  });

  it('accepts a complete request', () => {
    expect(validateContact({
      ...INITIAL_CONTACT_FORM,
      inquiryType: 'project_request',
      name: '感謝 太陽', email: 'hello@example.com', message: 'AI開発について相談したいです。',
    })).toEqual({});
  });

  it('validates every field format and length boundary', () => {
    expect(validateContactField('company', 'a'.repeat(201))).toBe('入力内容が長すぎます。');
    expect(validateContactField('inquiryType', 'unknown')).toBeTruthy();
    expect(validateContactField('name', '   ')).toBeTruthy();
    expect(validateContactField('nameKana', 'Arigato')).toBeTruthy();
    expect(validateContactField('nameKana', '')).toBeUndefined();
    expect(validateContactField('email', 'invalid')).toBeTruthy();
    expect(validateContactField('phone', '電話番号')).toBeTruthy();
    expect(validateContactField('phone', '')).toBeUndefined();
    expect(validateContactField('message', '   ')).toBeTruthy();
  });

  it('supports the bounded legacy type without weakening current parsing', () => {
    expect(validateSubmissionContact({
      inquiryType: 'legacy_unspecified', company: '', name: '旧利用者', nameKana: '',
      email: 'legacy@example.com', phone: '', message: '旧フォームからの問い合わせ',
    })).toEqual({});
    expect(parseContactForm(null)).toBeNull();
    expect(parseContactForm([])).toBeNull();
    expect(parseContactForm({ inquiryType: 'invalid' })).toBeNull();
    expect(parseContactForm({ inquiryType: 'project_request', company: 1 })).toBeNull();
    expect(parseContactForm({
      inquiryType: 'project_request', company: ' 会社 ', name: ' 利用者 ', nameKana: '',
      email: ' user@example.com ', phone: '', message: ' 依頼内容 ',
    })).toEqual({
      inquiryType: 'project_request', company: '会社', name: '利用者', nameKana: '',
      email: 'user@example.com', phone: '', message: '依頼内容',
    });
  });
});
