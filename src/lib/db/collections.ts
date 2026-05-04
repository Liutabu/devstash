import { prisma } from '@/lib/prisma';

function computeTypeStats(items: { item: { itemType: { color: string; icon: string } } }[]): {
  dominantColor: string;
  icons: string[];
} {
  const typeCounts: Record<string, { count: number; color: string; icon: string }> = {};
  for (const ic of items) {
    const { icon, color } = ic.item.itemType;
    if (!typeCounts[icon]) typeCounts[icon] = { count: 0, color, icon };
    typeCounts[icon].count++;
  }
  const sorted = Object.values(typeCounts).sort((a, b) => b.count - a.count);
  return {
    dominantColor: sorted[0]?.color ?? '#6b7280',
    icons: sorted.map((t) => t.icon),
  };
}

export interface CollectionCardData {
  id: string;
  name: string;
  description: string;
  isFavorite: boolean;
  itemCount: number;
  dominantColor: string;
  icons: string[];
}

export interface SidebarCollectionData {
  id: string;
  name: string;
  isFavorite: boolean;
  itemCount: number;
  dominantColor: string;
}

export async function getSidebarCollections(userId: string, limit = 8): Promise<SidebarCollectionData[]> {
  const collections = await prisma.collection.findMany({
    take: limit,
    where: { userId },
    orderBy: [{ isFavorite: 'desc' }, { updatedAt: 'desc' }],
    include: {
      items: {
        take: 100,
        include: {
          item: {
            include: {
              itemType: { select: { color: true, icon: true } },
            },
          },
        },
      },
    },
  });

  return collections.map((col) => {
    const { dominantColor } = computeTypeStats(col.items);
    return {
      id: col.id,
      name: col.name,
      isFavorite: col.isFavorite,
      itemCount: col.items.length,
      dominantColor,
    };
  });
}

export async function getRecentCollections(userId: string, limit = 6): Promise<CollectionCardData[]> {
  const collections = await prisma.collection.findMany({
    take: limit,
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        take: 100,
        include: {
          item: {
            include: {
              itemType: {
                select: { icon: true, color: true },
              },
            },
          },
        },
      },
    },
  });

  return collections.map((col) => {
    const { dominantColor, icons } = computeTypeStats(col.items);
    return {
      id: col.id,
      name: col.name,
      description: col.description ?? '',
      isFavorite: col.isFavorite,
      itemCount: col.items.length,
      dominantColor,
      icons,
    };
  });
}
