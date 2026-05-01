import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    item: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    itemType: {
      findFirst: vi.fn(),
    },
  },
}));

const { getItemById, getItemsByType } = await import('./items');
const { prisma } = await import('@/lib/prisma');
const findFirst = vi.mocked(prisma.item.findFirst);
const findMany = vi.mocked(prisma.item.findMany);
const itemTypeFindFirst = vi.mocked(prisma.itemType.findFirst);

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

const baseItemType = {
  id: 'type-snippet',
  name: 'Snippet',
  color: '#3b82f6',
  icon: 'Code',
  isSystem: true,
};

const baseRowItem = {
  id: 'item-1',
  title: 'My Snippet',
  description: null,
  isFavorite: false,
  isPinned: false,
  createdAt: new Date('2026-04-01'),
  itemType: { id: 'type-snippet', name: 'Snippet', color: '#3b82f6', icon: 'Code' },
  tags: [],
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

describe('getItemsByType', () => {
  it('returns null when item type is not found', async () => {
    itemTypeFindFirst.mockResolvedValue(null);
    const result = await getItemsByType('snippets', 'user-1');
    expect(result).toBeNull();
  });

  it('strips trailing s from slug when querying item type', async () => {
    itemTypeFindFirst.mockResolvedValue(baseItemType);
    findMany.mockResolvedValue([]);
    await getItemsByType('snippets', 'user-1');
    expect(itemTypeFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ name: expect.objectContaining({ equals: 'snippet' }) }),
      }),
    );
  });

  it('returns typeId, typeName, and typeColor from the item type', async () => {
    itemTypeFindFirst.mockResolvedValue(baseItemType);
    findMany.mockResolvedValue([]);
    const result = await getItemsByType('snippets', 'user-1');
    expect(result).toMatchObject({
      typeId: 'type-snippet',
      typeName: 'Snippet',
      typeColor: '#3b82f6',
    });
  });

  it('scopes item query to the resolved typeId and userId', async () => {
    itemTypeFindFirst.mockResolvedValue(baseItemType);
    findMany.mockResolvedValue([]);
    await getItemsByType('snippets', 'user-42');
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { itemTypeId: 'type-snippet', userId: 'user-42' },
      }),
    );
  });

  it('maps returned items into the result', async () => {
    itemTypeFindFirst.mockResolvedValue(baseItemType);
    findMany.mockResolvedValue([baseRowItem]);
    const result = await getItemsByType('snippets', 'user-1');
    expect(result?.items).toHaveLength(1);
    expect(result?.items[0]).toMatchObject({ id: 'item-1', title: 'My Snippet' });
  });
});
