import { prisma } from '@/lib/prisma';

export interface UserCollectionOption {
  id: string;
  name: string;
}

export async function getUserCollections(userId: string): Promise<UserCollectionOption[]> {
  return prisma.collection.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
}

export interface CollectionDetail {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function createCollection(
  userId: string,
  data: { name: string; description?: string | null },
): Promise<CollectionDetail> {
  return prisma.collection.create({
    data: {
      userId,
      name: data.name,
      description: data.description ?? null,
    },
    select: {
      id: true,
      name: true,
      description: true,
      isFavorite: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

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

export async function getAllCollections(userId: string): Promise<CollectionCardData[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: [{ isFavorite: 'desc' }, { name: 'asc' }],
    include: {
      items: {
        take: 100,
        include: {
          item: {
            include: {
              itemType: { select: { icon: true, color: true } },
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

export interface CollectionWithMetadata {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  dominantColor: string;
  icons: string[];
  itemCount: number;
}

export async function getCollectionById(id: string, userId: string): Promise<CollectionWithMetadata | null> {
  const col = await prisma.collection.findFirst({
    where: { id, userId },
    include: {
      items: {
        take: 100,
        include: {
          item: {
            include: {
              itemType: { select: { icon: true, color: true } },
            },
          },
        },
      },
    },
  });

  if (!col) return null;

  const { dominantColor, icons } = computeTypeStats(col.items);
  return {
    id: col.id,
    name: col.name,
    description: col.description,
    isFavorite: col.isFavorite,
    dominantColor,
    icons,
    itemCount: col.items.length,
  };
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
