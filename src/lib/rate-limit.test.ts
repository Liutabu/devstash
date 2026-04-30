import { describe, it, expect } from 'vitest';
import { getIP } from './rate-limit';

describe('getIP', () => {
  it('returns the first IP from x-forwarded-for', () => {
    const headers = { get: (name: string) => name === 'x-forwarded-for' ? '1.2.3.4, 5.6.7.8' : null };
    expect(getIP(headers)).toBe('1.2.3.4');
  });

  it('falls back to x-real-ip', () => {
    const headers = { get: (name: string) => name === 'x-real-ip' ? '9.9.9.9' : null };
    expect(getIP(headers)).toBe('9.9.9.9');
  });

  it('falls back to 127.0.0.1 when no IP headers present', () => {
    const headers = { get: () => null };
    expect(getIP(headers)).toBe('127.0.0.1');
  });

  it('trims whitespace from x-forwarded-for entries', () => {
    const headers = { get: (name: string) => name === 'x-forwarded-for' ? '  10.0.0.1  , 10.0.0.2' : null };
    expect(getIP(headers)).toBe('10.0.0.1');
  });
});
