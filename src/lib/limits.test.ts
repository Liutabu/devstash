import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    item: { count: vi.fn() },
    collection: { count: vi.fn() },
  },
}));

import { getUserLimits, isProType, FREE_LIMITS } from './limits';
import { prisma } from '@/lib/prisma';

const mockFindUnique = vi.mocked(prisma.user.findUnique);
const mockItemCount = vi.mocked(prisma.item.count);
const mockCollectionCount = vi.mocked(prisma.collection.count);

const ORIGINAL_BYPASS = process.env.BYPASS_PRO_LIMITS;

beforeEach(() => {
  vi.resetAllMocks();
  delete process.env.BYPASS_PRO_LIMITS;
});

afterEach(() => {
  if (ORIGINAL_BYPASS === undefined) {
    delete process.env.BYPASS_PRO_LIMITS;
  } else {
    process.env.BYPASS_PRO_LIMITS = ORIGINAL_BYPASS;
  }
});

function mockUserState({
  isPro,
  itemCount,
  collectionCount,
}: {
  isPro: boolean | null;
  itemCount: number;
  collectionCount: number;
}) {
  mockFindUnique.mockResolvedValue(isPro === null ? null : ({ isPro } as never));
  mockItemCount.mockResolvedValue(itemCount as never);
  mockCollectionCount.mockResolvedValue(collectionCount as never);
}

describe('isProType', () => {
  it('returns true for "file" (lowercase)', () => {
    expect(isProType('file')).toBe(true);
  });

  it('returns true for "image" (lowercase)', () => {
    expect(isProType('image')).toBe(true);
  });

  it('returns true for "File" (case-insensitive)', () => {
    expect(isProType('File')).toBe(true);
  });

  it('returns true for "IMAGE" (case-insensitive)', () => {
    expect(isProType('IMAGE')).toBe(true);
  });

  it('returns false for non-Pro types', () => {
    expect(isProType('snippet')).toBe(false);
    expect(isProType('prompt')).toBe(false);
    expect(isProType('command')).toBe(false);
    expect(isProType('note')).toBe(false);
    expect(isProType('link')).toBe(false);
  });

  it('returns false for unknown strings', () => {
    expect(isProType('unknown')).toBe(false);
    expect(isProType('')).toBe(false);
  });
});

describe('getUserLimits — Free user', () => {
  it('canCreateItem true at boundary 49', async () => {
    mockUserState({ isPro: false, itemCount: 49, collectionCount: 0 });
    const limits = await getUserLimits('user-1');
    expect(limits.canCreateItem).toBe(true);
    expect(limits.itemCount).toBe(49);
  });

  it('canCreateItem false at boundary 50', async () => {
    mockUserState({ isPro: false, itemCount: 50, collectionCount: 0 });
    const limits = await getUserLimits('user-1');
    expect(limits.canCreateItem).toBe(false);
  });

  it('canCreateItem false above limit (51)', async () => {
    mockUserState({ isPro: false, itemCount: 51, collectionCount: 0 });
    const limits = await getUserLimits('user-1');
    expect(limits.canCreateItem).toBe(false);
  });

  it('canCreateCollection true at boundary 2', async () => {
    mockUserState({ isPro: false, itemCount: 0, collectionCount: 2 });
    const limits = await getUserLimits('user-1');
    expect(limits.canCreateCollection).toBe(true);
  });

  it('canCreateCollection false at boundary 3', async () => {
    mockUserState({ isPro: false, itemCount: 0, collectionCount: 3 });
    const limits = await getUserLimits('user-1');
    expect(limits.canCreateCollection).toBe(false);
  });

  it('canUseProType is false for free user regardless of counts', async () => {
    mockUserState({ isPro: false, itemCount: 0, collectionCount: 0 });
    const limits = await getUserLimits('user-1');
    expect(limits.canUseProType).toBe(false);
  });

  it('canUseAi is false for free user', async () => {
    mockUserState({ isPro: false, itemCount: 0, collectionCount: 0 });
    const limits = await getUserLimits('user-1');
    expect(limits.canUseAi).toBe(false);
  });

  it('missing user → isPro false, normal limit checks apply', async () => {
    mockUserState({ isPro: null, itemCount: 49, collectionCount: 2 });
    const limits = await getUserLimits('user-1');
    expect(limits.isPro).toBe(false);
    expect(limits.canCreateItem).toBe(true);
    expect(limits.canCreateCollection).toBe(true);
    expect(limits.canUseProType).toBe(false);
  });
});

describe('getUserLimits — Pro user', () => {
  it('canCreateItem true at 1000 items', async () => {
    mockUserState({ isPro: true, itemCount: 1000, collectionCount: 0 });
    const limits = await getUserLimits('user-1');
    expect(limits.isPro).toBe(true);
    expect(limits.canCreateItem).toBe(true);
  });

  it('canCreateCollection true at 100 collections', async () => {
    mockUserState({ isPro: true, itemCount: 0, collectionCount: 100 });
    const limits = await getUserLimits('user-1');
    expect(limits.canCreateCollection).toBe(true);
  });

  it('canUseProType true for Pro user', async () => {
    mockUserState({ isPro: true, itemCount: 0, collectionCount: 0 });
    const limits = await getUserLimits('user-1');
    expect(limits.canUseProType).toBe(true);
  });

  it('canUseAi true for Pro user', async () => {
    mockUserState({ isPro: true, itemCount: 0, collectionCount: 0 });
    const limits = await getUserLimits('user-1');
    expect(limits.canUseAi).toBe(true);
  });
});

describe('getUserLimits — BYPASS_PRO_LIMITS dev flag', () => {
  it('bypass=true + free user at item limit → canCreateItem true', async () => {
    process.env.BYPASS_PRO_LIMITS = 'true';
    mockUserState({ isPro: false, itemCount: FREE_LIMITS.items, collectionCount: 0 });
    const limits = await getUserLimits('user-1');
    expect(limits.canCreateItem).toBe(true);
  });

  it('bypass=true + free user at collection limit → canCreateCollection true', async () => {
    process.env.BYPASS_PRO_LIMITS = 'true';
    mockUserState({ isPro: false, itemCount: 0, collectionCount: FREE_LIMITS.collections });
    const limits = await getUserLimits('user-1');
    expect(limits.canCreateCollection).toBe(true);
  });

  it('bypass=true + free user → canUseProType true', async () => {
    process.env.BYPASS_PRO_LIMITS = 'true';
    mockUserState({ isPro: false, itemCount: 0, collectionCount: 0 });
    const limits = await getUserLimits('user-1');
    expect(limits.canUseProType).toBe(true);
  });

  it('bypass=true + free user → canUseAi true', async () => {
    process.env.BYPASS_PRO_LIMITS = 'true';
    mockUserState({ isPro: false, itemCount: 0, collectionCount: 0 });
    const limits = await getUserLimits('user-1');
    expect(limits.canUseAi).toBe(true);
  });

  it('bypass=false enforces limits normally', async () => {
    process.env.BYPASS_PRO_LIMITS = 'false';
    mockUserState({ isPro: false, itemCount: FREE_LIMITS.items, collectionCount: 0 });
    const limits = await getUserLimits('user-1');
    expect(limits.canCreateItem).toBe(false);
    expect(limits.canUseProType).toBe(false);
  });

  it('bypass unset enforces limits normally', async () => {
    mockUserState({ isPro: false, itemCount: FREE_LIMITS.items, collectionCount: 0 });
    const limits = await getUserLimits('user-1');
    expect(limits.canCreateItem).toBe(false);
    expect(limits.canUseProType).toBe(false);
  });

  it('bypass=true does not affect the real isPro value returned to the caller', async () => {
    process.env.BYPASS_PRO_LIMITS = 'true';
    mockUserState({ isPro: false, itemCount: 0, collectionCount: 0 });
    const limits = await getUserLimits('user-1');
    expect(limits.isPro).toBe(false);
  });
});

describe('getUserLimits — parallel query execution', () => {
  it('runs all three Prisma queries via Promise.all', async () => {
    const promiseAllSpy = vi.spyOn(Promise, 'all');
    mockUserState({ isPro: false, itemCount: 0, collectionCount: 0 });

    await getUserLimits('user-1');

    expect(promiseAllSpy).toHaveBeenCalledTimes(1);
    const passed = promiseAllSpy.mock.calls[0][0] as unknown[];
    expect(passed).toHaveLength(3);
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: { isPro: true },
    });
    expect(mockItemCount).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
    expect(mockCollectionCount).toHaveBeenCalledWith({ where: { userId: 'user-1' } });

    promiseAllSpy.mockRestore();
  });
});
