import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { TOOL_NAMES, validateFixtures } from '../../../scripts/webmcp/evaluate-tool-selection';

describe('WebMCP tool selection fixtures', () => {
  const fixtures = validateFixtures(JSON.parse(readFileSync('tests/fixtures/webmcp-tool-selection.json', 'utf8')));

  it('contains at least 30 unique, valid fixtures', () => {
    expect(fixtures.length).toBeGreaterThanOrEqual(30);
    expect(new Set(fixtures.map(({ id }) => id)).size).toBe(fixtures.length);
  });

  it('covers every inquiry type and all tools are from the fixed registry', () => {
    expect(new Set(fixtures.map(({ expectedInquiryType }) => expectedInquiryType).filter(Boolean))).toEqual(new Set([
      'project_request', 'estimate_consultation', 'sales_solicitation', 'recruitment', 'partnership', 'media_other',
    ]));
    for (const fixture of fixtures) {
      if (fixture.expectedTool) expect(TOOL_NAMES).toContain(fixture.expectedTool);
      fixture.forbiddenTools.forEach((tool) => expect(TOOL_NAMES).toContain(tool));
    }
  });

  it('forbids auto-submit for every manual-only contact fixture', () => {
    const manual = new Set(['sales_solicitation', 'recruitment', 'partnership', 'media_other']);
    for (const fixture of fixtures.filter(({ expectedInquiryType }) => expectedInquiryType && manual.has(expectedInquiryType))) {
      expect(fixture.forbiddenTools).toContain('submit_project_request');
    }
  });
});
