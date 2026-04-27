import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL ?? '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
});

function makeLimiter(prefix: string, count: number, window: string) {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(count, window as Parameters<typeof Ratelimit.slidingWindow>[1]),
    prefix: `rl:${prefix}`,
  });
}

export const limiters = {
  login: makeLimiter('login', 5, '15 m'),
  register: makeLimiter('register', 3, '1 h'),
  forgotPassword: makeLimiter('forgot', 3, '1 h'),
  resetPassword: makeLimiter('reset', 5, '15 m'),
  resendVerification: makeLimiter('resend', 3, '15 m'),
};

export interface RateLimitResult {
  limited: boolean;
  retryAfterSeconds?: number;
}

export async function checkRateLimit(
  rateLimiter: Ratelimit,
  key: string,
): Promise<RateLimitResult> {
  try {
    const { success, reset } = await rateLimiter.limit(key);
    if (!success) {
      return { limited: true, retryAfterSeconds: Math.ceil((reset - Date.now()) / 1000) };
    }
    return { limited: false };
  } catch {
    return { limited: false };
  }
}

export function getIP(headers: { get: (name: string) => string | null }): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get('x-real-ip') ??
    '127.0.0.1'
  );
}
