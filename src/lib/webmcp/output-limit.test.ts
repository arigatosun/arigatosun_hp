import { describe, expect, it } from 'vitest';
import { fitToolArrayResponse } from './output-limit';

describe('fitToolArrayResponse', () => {
  it('never exceeds the serialized 1,500 character limit', () => {
    const response = fitToolArrayResponse('results', Array.from({ length: 10 }, (_, id) => ({ id, text: 'あ'.repeat(1000) })));
    expect(JSON.stringify(response).length).toBeLessThanOrEqual(1500);
    expect(response.truncated).toBe(true);
  });

  it('keeps all short items', () => {
    const response = fitToolArrayResponse('services', [{ id: 1 }, { id: 2 }]);
    expect(response).toMatchObject({ count: 2, truncated: false });
  });
});
