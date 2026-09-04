import { describe, it, expect } from 'vitest';
import {
  buildAutoTagInput,
  parseTagSuggestions,
  truncateForAi,
  MAX_AI_CONTENT_CHARS,
  MAX_AI_TAGS,
} from './tags';

describe('truncateForAi', () => {
  it('leaves content under the cap unchanged', () => {
    expect(truncateForAi('short content')).toBe('short content');
  });

  it('truncates content over the cap', () => {
    const long = 'x'.repeat(MAX_AI_CONTENT_CHARS + 500);
    const result = truncateForAi(long);
    expect(result).toHaveLength(MAX_AI_CONTENT_CHARS + 1); // + ellipsis
    expect(result.endsWith('…')).toBe(true);
  });
});

describe('buildAutoTagInput', () => {
  it('includes the title and content inside the item markers', () => {
    const input = buildAutoTagInput('My Snippet', 'console.log(1)');
    expect(input).toContain('Title: My Snippet');
    expect(input).toContain('Content:\nconsole.log(1)');
    expect(input).toContain('<item>');
    expect(input).toContain('</item>');
  });

  it('marks empty content explicitly', () => {
    expect(buildAutoTagInput('Just a title', '')).toContain('Content: (none)');
  });

  it('mentions JSON — the API rejects json_object format otherwise', () => {
    expect(buildAutoTagInput('A title', '').toLowerCase()).toContain('json');
  });

  it('truncates long content', () => {
    const input = buildAutoTagInput('Title', 'y'.repeat(MAX_AI_CONTENT_CHARS + 100));
    expect(input).not.toContain('y'.repeat(MAX_AI_CONTENT_CHARS + 1));
    expect(input).toContain('y'.repeat(MAX_AI_CONTENT_CHARS));
  });
});

describe('parseTagSuggestions', () => {
  it('parses the { tags: [...] } shape', () => {
    expect(parseTagSuggestions('{"tags":["react","hooks"]}')).toEqual(['react', 'hooks']);
  });

  it('parses a bare array', () => {
    expect(parseTagSuggestions('["react","hooks"]')).toEqual(['react', 'hooks']);
  });

  it('lowercases tags', () => {
    expect(parseTagSuggestions('{"tags":["React","TypeScript"]}')).toEqual(['react', 'typescript']);
  });

  it('trims and de-duplicates', () => {
    expect(parseTagSuggestions('{"tags":[" react ","React","react"]}')).toEqual(['react']);
  });

  it(`caps at ${MAX_AI_TAGS} tags`, () => {
    const many = JSON.stringify({ tags: ['a1', 'b2', 'c3', 'd4', 'e5', 'f6', 'g7'] });
    expect(parseTagSuggestions(many)).toHaveLength(MAX_AI_TAGS);
  });

  it('drops non-string entries', () => {
    expect(parseTagSuggestions('{"tags":["react",42,null,{"a":1}]}')).toEqual(['react']);
  });

  it('rejects tags that are too long or contain markup', () => {
    const raw = JSON.stringify({ tags: ['x'.repeat(40), '<script>alert(1)</script>', 'ok-tag'] });
    expect(parseTagSuggestions(raw)).toEqual(['ok-tag']);
  });

  it('returns an empty array for invalid JSON', () => {
    expect(parseTagSuggestions('not json at all')).toEqual([]);
  });

  it('returns an empty array for null, undefined and blank input', () => {
    expect(parseTagSuggestions(null)).toEqual([]);
    expect(parseTagSuggestions(undefined)).toEqual([]);
    expect(parseTagSuggestions('   ')).toEqual([]);
  });

  it('returns an empty array when the JSON has no tags array', () => {
    expect(parseTagSuggestions('{"result":"nope"}')).toEqual([]);
  });
});
