import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/limits', () => ({
  getUserLimits: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(),
  limiters: { ai: {} },
}));

vi.mock('@/lib/openai', () => ({
  openai: { responses: { create: vi.fn() } },
  AI_MODEL: 'gpt-5-nano',
}));

import { generateAutoTags } from './ai';
import { auth } from '@/auth';
import { getUserLimits } from '@/lib/limits';
import { checkRateLimit } from '@/lib/rate-limit';
import { openai } from '@/lib/openai';
import { MAX_AI_CONTENT_CHARS } from '@/lib/ai/tags';

const mockAuth = vi.mocked(auth);
const mockGetUserLimits = vi.mocked(getUserLimits);
const mockCheckRateLimit = vi.mocked(checkRateLimit);
const mockCreate = vi.mocked(openai.responses.create);

const PRO_LIMITS = {
  isPro: true,
  itemCount: 0,
  collectionCount: 0,
  canCreateItem: true,
  canCreateCollection: true,
  canUseProType: true,
  canUseAi: true,
};

// The SDK response type is large; tests only care about output_text.
function aiResponse(outputText: string) {
  return { output_text: outputText } as Awaited<ReturnType<typeof openai.responses.create>>;
}

function lastCallInput(): string {
  return (mockCreate.mock.calls[0][0] as { input: string }).input;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue({ user: { id: 'user-1' } } as never);
  mockGetUserLimits.mockResolvedValue(PRO_LIMITS);
  mockCheckRateLimit.mockResolvedValue({ limited: false });
  mockCreate.mockResolvedValue(aiResponse('{"tags":["react","hooks"]}'));
});

describe('generateAutoTags', () => {
  it('returns Unauthorized when there is no session', async () => {
    mockAuth.mockResolvedValue(null as never);

    const result = await generateAutoTags({ title: 'A title', content: '' });

    expect(result).toEqual({ success: false, error: 'Unauthorized' });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('rejects an empty title without calling OpenAI', async () => {
    const result = await generateAutoTags({ title: '   ', content: 'some content' });

    expect(result.success).toBe(false);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('blocks free users and never calls OpenAI', async () => {
    mockGetUserLimits.mockResolvedValue({ ...PRO_LIMITS, isPro: false, canUseAi: false });

    const result = await generateAutoTags({ title: 'A title', content: '' });

    expect(result).toEqual({ success: false, error: 'AI features require Pro.' });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('blocks rate-limited users and never calls OpenAI', async () => {
    mockCheckRateLimit.mockResolvedValue({ limited: true, retryAfterSeconds: 120 });

    const result = await generateAutoTags({ title: 'A title', content: '' });

    expect(result).toEqual({
      success: false,
      error: 'AI request limit reached. Try again later.',
    });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('rate limits per user id', async () => {
    await generateAutoTags({ title: 'A title', content: '' });

    expect(mockCheckRateLimit).toHaveBeenCalledWith(expect.anything(), 'user-1');
  });

  it('returns parsed tags on success', async () => {
    const result = await generateAutoTags({ title: 'useEffect cleanup', content: 'code' });

    expect(result).toEqual({ success: true, data: { tags: ['react', 'hooks'] } });
  });

  it('accepts a bare array response and lowercases tags', async () => {
    mockCreate.mockResolvedValue(aiResponse('["React","Hooks"]'));

    const result = await generateAutoTags({ title: 'A title', content: '' });

    expect(result).toEqual({ success: true, data: { tags: ['react', 'hooks'] } });
  });

  it('sends the model, JSON format and store:false', async () => {
    await generateAutoTags({ title: 'A title', content: '' });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-5-nano',
        text: { format: { type: 'json_object' } },
        store: false,
      }),
    );
  });

  it('truncates content to the character cap before calling OpenAI', async () => {
    const content = 'z'.repeat(MAX_AI_CONTENT_CHARS + 1000);

    await generateAutoTags({ title: 'A title', content });

    const input = lastCallInput();
    expect(input).toContain('z'.repeat(MAX_AI_CONTENT_CHARS));
    expect(input).not.toContain('z'.repeat(MAX_AI_CONTENT_CHARS + 1));
  });

  it('treats null content as empty', async () => {
    const result = await generateAutoTags({
      title: 'A title',
      content: null as unknown as string,
    });

    expect(result.success).toBe(true);
    expect(lastCallInput()).toContain('Content: (none)');
  });

  it('returns a friendly error when the model returns nothing usable', async () => {
    mockCreate.mockResolvedValue(aiResponse(''));

    const result = await generateAutoTags({ title: 'A title', content: '' });

    expect(result).toEqual({
      success: false,
      error: 'No tags could be suggested for this item.',
    });
  });

  it('does not leak SDK errors to the caller', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockCreate.mockRejectedValue(new Error('401 Incorrect API key sk-live-abc123'));

    const result = await generateAutoTags({ title: 'A title', content: '' });

    expect(result).toEqual({
      success: false,
      error: 'Could not generate tags right now. Try again.',
    });
  });
});
