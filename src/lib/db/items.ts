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

export async function getItemsByType(slug: string): Promise<{ items: ItemRowData[]; typeName: string; typeColor: string } | null> {
  const typeName = slug.slice(0, -1); // "snippets" → "snippet"
  const itemType = await prisma.itemType.findFirst({
    where: { isSystem: true, name: { equals: typeName, mode: 'insensitive' } },
  });
  if (!itemType) return null;

  const items = await prisma.item.findMany({
    where: { itemTypeId: itemType.id },
    orderBy: { createdAt: 'desc' },
    ...itemWithTypeAndTags,
  });

  return { items: items.map(mapItem), typeName: itemType.name, typeColor: itemType.color };
}

export interface ItemDetail {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  contentType: string;
  isFavorite: boolean;
  isPinned: boolean;
  tags: string[];
  itemType: { id: string; name: string; color: string; icon: string };
  collections: { id: string; name: string }[];
  createdAt: Date;
  updatedAt: Date;
}

export async function getItemById(id: string, userId: string): Promise<ItemDetail | null> {
  const item = await prisma.item.findFirst({
    where: { id, userId },
    include: {
      itemType: { select: { id: true, name: true, color: true, icon: true } },
      tags: { include: { tag: { select: { name: true } } } },
      collections: { include: { collection: { select: { id: true, name: true } } } },
    },
  });
  if (!item) return null;
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    url: item.url,
    language: item.language,
    contentType: item.contentType,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    tags: item.tags.map((t) => t.tag.name),
    itemType: item.itemType,
    collections: item.collections.map((ic) => ic.collection),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
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
