import { prisma } from '@/lib/prisma';

export interface CollectionCardData {
  id: string;
  name: string;
  description: string;
  isFavorite: boolean;
  itemCount: number;
  dominantColor: string;
  icons: string[];
}

export async function getRecentCollections(limit = 6): Promise<CollectionCardData[]> {
  const collections = await prisma.collection.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
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
    const itemCount = col.items.length;

    // Count items per icon/color to find the dominant type
    const typeCounts: Record<string, { count: number; color: string; icon: string }> = {};
    for (const ic of col.items) {
      const { icon, color } = ic.item.itemType;
      if (!typeCounts[icon]) {
        typeCounts[icon] = { count: 0, color, icon };
      }
      typeCounts[icon].count++;
    }

    const sorted = Object.values(typeCounts).sort((a, b) => b.count - a.count);
    const dominantColor = sorted[0]?.color ?? '#6b7280';
    const icons = sorted.map((t) => t.icon);

    return {
      id: col.id,
      name: col.name,
      description: col.description ?? '',
      isFavorite: col.isFavorite,
      itemCount,
      dominantColor,
      icons,
    };
  });
}
