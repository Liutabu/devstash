import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    collection: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

const { getCollectionById, getAllCollections } = await import('./collections');
const { prisma } = await import('@/lib/prisma');
const collectionFindFirst = vi.mocked(prisma.collection.findFirst);
const collectionFindMany = vi.mocked(prisma.collection.findMany);

const snippetType = { color: '#3b82f6', icon: 'Code' };
const promptType = { color: '#8b5cf6', icon: 'Sparkles' };

const baseCollection = {
  id: 'col-1',
  name: 'React Patterns',
  description: 'Useful React stuff',
  isFavorite: true,
  createdAt: new Date('2026-04-01'),
  updatedAt: new Date('2026-04-01'),
  items: [
    { item: { itemType: snippetType } },
    { item: { itemType: snippetType } },
    { item: { itemType: promptType } },
  ],
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('getCollectionById', () => {
  it('returns null when collection is not found', async () => {
    collectionFindFirst.mockResolvedValue(null);
    const result = await getCollectionById('missing', 'user-1');
    expect(result).toBeNull();
  });

  it('passes id and userId to Prisma where clause', async () => {
    collectionFindFirst.mockResolvedValue(baseCollection as never);
    await getCollectionById('col-1', 'user-42');
    expect(collectionFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'col-1', userId: 'user-42' } }),
    );
  });

  it('computes dominantColor as color of the most-common item type', async () => {
    collectionFindFirst.mockResolvedValue(baseCollection as never);
    const result = await getCollectionById('col-1', 'user-1');
    expect(result?.dominantColor).toBe('#3b82f6');
  });

  it('returns icons sorted by type count descending', async () => {
    collectionFindFirst.mockResolvedValue(baseCollection as never);
    const result = await getCollectionById('col-1', 'user-1');
    expect(result?.icons).toEqual(['Code', 'Sparkles']);
  });

  it('defaults dominantColor to gray when collection has no items', async () => {
    collectionFindFirst.mockResolvedValue({ ...baseCollection, items: [] } as never);
    const result = await getCollectionById('col-1', 'user-1');
    expect(result?.dominantColor).toBe('#6b7280');
    expect(result?.icons).toEqual([]);
  });

  it('maps all scalar fields correctly', async () => {
    collectionFindFirst.mockResolvedValue(baseCollection as never);
    const result = await getCollectionById('col-1', 'user-1');
    expect(result).toMatchObject({
      id: 'col-1',
      name: 'React Patterns',
      description: 'Useful React stuff',
      isFavorite: true,
      itemCount: 3,
    });
  });
});

describe('getAllCollections', () => {
  it('scopes query to userId', async () => {
    collectionFindMany.mockResolvedValue([]);
    await getAllCollections('user-42');
    expect(collectionFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-42' } }),
    );
  });

  it('maps collections into CollectionCardData', async () => {
    collectionFindMany.mockResolvedValue([baseCollection] as never);
    const result = await getAllCollections('user-1');
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'col-1',
      name: 'React Patterns',
      isFavorite: true,
      itemCount: 3,
      dominantColor: '#3b82f6',
    });
  });
});
