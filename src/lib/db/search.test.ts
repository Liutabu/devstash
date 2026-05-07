import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    item: {
      findMany: vi.fn(),
    },
    collection: {
      findMany: vi.fn(),
    },
  },
}));

const { getSearchData } = await import('./search');
const { prisma } = await import('@/lib/prisma');
const itemFindMany = vi.mocked(prisma.item.findMany);
const collectionFindMany = vi.mocked(prisma.collection.findMany);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getSearchData', () => {
  it('returns items and collections for the given userId', async () => {
    itemFindMany.mockResolvedValue([
      {
        id: 'item-1',
        title: 'My Snippet',
        description: 'A code snippet',
        itemType: { name: 'Snippet', color: '#3b82f6', icon: 'Code' },
      },
    ] as never);
    collectionFindMany.mockResolvedValue([
      { id: 'col-1', name: 'React Patterns', _count: { items: 3 } },
    ] as never);

    const result = await getSearchData('user-1');

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toEqual({
      id: 'item-1',
      title: 'My Snippet',
      description: 'A code snippet',
      itemType: { name: 'Snippet', color: '#3b82f6', icon: 'Code' },
    });
    expect(result.collections).toHaveLength(1);
    expect(result.collections[0]).toEqual({ id: 'col-1', name: 'React Patterns', itemCount: 3 });
  });

  it('scopes items query to the given userId', async () => {
    itemFindMany.mockResolvedValue([] as never);
    collectionFindMany.mockResolvedValue([] as never);

    await getSearchData('user-42');

    expect(itemFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-42' } }),
    );
  });

  it('scopes collections query to the given userId', async () => {
    itemFindMany.mockResolvedValue([] as never);
    collectionFindMany.mockResolvedValue([] as never);

    await getSearchData('user-42');

    expect(collectionFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-42' } }),
    );
  });

  it('maps collection _count.items to itemCount', async () => {
    itemFindMany.mockResolvedValue([] as never);
    collectionFindMany.mockResolvedValue([
      { id: 'col-1', name: 'DevOps', _count: { items: 7 } },
    ] as never);

    const result = await getSearchData('user-1');

    expect(result.collections[0].itemCount).toBe(7);
  });

  it('returns empty arrays when user has no data', async () => {
    itemFindMany.mockResolvedValue([] as never);
    collectionFindMany.mockResolvedValue([] as never);

    const result = await getSearchData('user-empty');

    expect(result.items).toEqual([]);
    expect(result.collections).toEqual([]);
  });
});
