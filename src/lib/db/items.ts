import { prisma } from '@/lib/prisma';

export interface ItemRowData {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  tags: string[];
  itemType: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
  createdAt: Date;
}

export interface DashboardStats {
  totalItems: number;
  totalCollections: number;
  favoriteItems: number;
  favoriteCollections: number;
}

const itemWithTypeAndTags = {
  include: {
    itemType: {
      select: { id: true, name: true, color: true, icon: true },
    },
    tags: {
      include: {
        tag: { select: { name: true } },
      },
    },
  },
} as const;

function mapItem(item: {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  itemType: { id: string; name: string; color: string; icon: string };
  tags: { tag: { name: string } }[];
}): ItemRowData {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    tags: item.tags.map((t) => t.tag.name),
    itemType: item.itemType,
    createdAt: item.createdAt,
  };
}

export async function getPinnedItems(): Promise<ItemRowData[]> {
  const items = await prisma.item.findMany({
    where: { isPinned: true },
    orderBy: { updatedAt: 'desc' },
    ...itemWithTypeAndTags,
  });
  return items.map(mapItem);
}

export async function getRecentItems(limit = 10): Promise<ItemRowData[]> {
  const items = await prisma.item.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    ...itemWithTypeAndTags,
  });
  return items.map(mapItem);
}

export interface ItemTypeWithCount {
  id: string;
  name: string;
  icon: string;
  color: string;
  slug: string;
  count: number;
}

export async function getItemTypesWithCounts(): Promise<ItemTypeWithCount[]> {
  const itemTypes = await prisma.itemType.findMany({
    where: { isSystem: true },
    include: { _count: { select: { items: true } } },
    orderBy: { name: 'asc' },
  });
  return itemTypes.map((t) => ({
    id: t.id,
    name: t.name,
    icon: t.icon,
    color: t.color,
    slug: t.name.toLowerCase() + 's',
    count: t._count.items,
  }));
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [totalItems, totalCollections, favoriteItems, favoriteCollections] = await Promise.all([
    prisma.item.count(),
    prisma.collection.count(),
    prisma.item.count({ where: { isFavorite: true } }),
    prisma.collection.count({ where: { isFavorite: true } }),
  ]);

  return { totalItems, totalCollections, favoriteItems, favoriteCollections };
}
