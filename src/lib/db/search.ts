import { prisma } from '@/lib/prisma';

export interface SearchItem {
  id: string;
  title: string;
  description: string | null;
  itemType: { name: string; color: string; icon: string };
}

export interface SearchCollection {
  id: string;
  name: string;
  itemCount: number;
}

export interface SearchData {
  items: SearchItem[];
  collections: SearchCollection[];
}

export async function getSearchData(userId: string): Promise<SearchData> {
  const [items, collections] = await Promise.all([
    prisma.item.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        description: true,
        itemType: { select: { name: true, color: true, icon: true } },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.collection.findMany({
      where: { userId },
      select: { id: true, name: true, _count: { select: { items: true } } },
      orderBy: { name: 'asc' },
    }),
  ]);

  return {
    items,
    collections: collections.map((c) => ({
      id: c.id,
      name: c.name,
      itemCount: c._count.items,
    })),
  };
}
