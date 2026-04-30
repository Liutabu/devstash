import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    item: {
      findFirst: vi.fn(),
    },
  },
}));

const { getItemById } = await import('./items');
const { prisma } = await import('@/lib/prisma');
const findFirst = vi.mocked(prisma.item.findFirst);

const baseItem = {
  id: 'item-1',
  title: 'My Snippet',
  description: 'A description',
  content: 'console.log("hello")',
  url: null,
  language: 'typescript',
  contentType: 'text' as const,
  isFavorite: false,
  isPinned: true,
  createdAt: new Date('2026-04-01'),
  updatedAt: new Date('2026-04-02'),
  itemType: { id: 'type-1', name: 'Snippet', color: '#3b82f6', icon: 'Code' },
  tags: [
    { tag: { name: 'react' } },
    { tag: { name: 'hooks' } },
  ],
  collections: [
    { collection: { id: 'col-1', name: 'React Patterns' } },
  ],
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('getItemById', () => {
  it('returns null when item is not found', async () => {
    findFirst.mockResolvedValue(null);
    const result = await getItemById('missing-id', 'user-1');
    expect(result).toBeNull();
  });

  it('passes id and userId to Prisma where clause', async () => {
    findFirst.mockResolvedValue(baseItem);
    await getItemById('item-1', 'user-42');
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'item-1', userId: 'user-42' } }),
    );
  });

  it('maps tags from nested relation to flat string array', async () => {
    findFirst.mockResolvedValue(baseItem);
    const result = await getItemById('item-1', 'user-1');
    expect(result?.tags).toEqual(['react', 'hooks']);
  });

  it('maps collections from nested relation to id+name objects', async () => {
    findFirst.mockResolvedValue(baseItem);
    const result = await getItemById('item-1', 'user-1');
    expect(result?.collections).toEqual([{ id: 'col-1', name: 'React Patterns' }]);
  });

  it('returns empty arrays when item has no tags or collections', async () => {
    findFirst.mockResolvedValue({ ...baseItem, tags: [], collections: [] });
    const result = await getItemById('item-1', 'user-1');
    expect(result?.tags).toEqual([]);
    expect(result?.collections).toEqual([]);
  });

  it('maps all scalar fields correctly', async () => {
    findFirst.mockResolvedValue(baseItem);
    const result = await getItemById('item-1', 'user-1');
    expect(result).toMatchObject({
      id: 'item-1',
      title: 'My Snippet',
      description: 'A description',
      content: 'console.log("hello")',
      url: null,
      language: 'typescript',
      contentType: 'text',
      isFavorite: false,
      isPinned: true,
    });
  });
});
