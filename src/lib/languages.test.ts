import { describe, it, expect } from 'vitest';
import { LANGUAGE_OPTIONS, normalizeLanguage, getLanguageLabel } from './languages';

describe('normalizeLanguage', () => {
  it('returns plaintext for null, undefined, and empty string', () => {
    expect(normalizeLanguage(null)).toBe('plaintext');
    expect(normalizeLanguage(undefined)).toBe('plaintext');
    expect(normalizeLanguage('')).toBe('plaintext');
  });

  it('passes through a known Monaco language id', () => {
    expect(normalizeLanguage('typescript')).toBe('typescript');
  });

  it('lowercases and trims before matching', () => {
    expect(normalizeLanguage('  TypeScript ')).toBe('typescript');
  });

  it('resolves aliases to their canonical id', () => {
    expect(normalizeLanguage('ts')).toBe('typescript');
    expect(normalizeLanguage('tsx')).toBe('typescript');
    expect(normalizeLanguage('py')).toBe('python');
    expect(normalizeLanguage('sh')).toBe('bash');
    expect(normalizeLanguage('yml')).toBe('yaml');
    expect(normalizeLanguage('C++')).toBe('cpp');
  });

  it('falls back to plaintext for unknown values', () => {
    expect(normalizeLanguage('brainfuck')).toBe('plaintext');
  });
});

describe('getLanguageLabel', () => {
  it('returns the display label for a known id', () => {
    expect(getLanguageLabel('typescript')).toBe('TypeScript');
  });

  it('returns the label for an alias', () => {
    expect(getLanguageLabel('js')).toBe('JavaScript');
  });

  it('returns Plain Text for unknown and empty values', () => {
    expect(getLanguageLabel('nonsense')).toBe('Plain Text');
    expect(getLanguageLabel(null)).toBe('Plain Text');
  });
});

describe('LANGUAGE_OPTIONS', () => {
  it('has unique values', () => {
    const values = LANGUAGE_OPTIONS.map((o) => o.value);
    expect(new Set(values).size).toBe(values.length);
  });

  it('starts with plaintext', () => {
    expect(LANGUAGE_OPTIONS[0].value).toBe('plaintext');
  });
});
