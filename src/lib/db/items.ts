import { prisma } from '@/lib/prisma';
import { deleteFromR2 } from '@/lib/r2';
import { ITEMS_PER_PAGE, COLLECTIONS_PER_PAGE } from '@/lib/constants';

export interface ItemRowData {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  contentType: string;
  isFavorite: boolean;
  isPinned: boolean;
  fileName: string | null;
  fileSize: number | null;
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
  content: string | null;
  url: string | null;
  contentType: string;
  isFavorite: boolean;
  isPinned: boolean;
  fileName: string | null;
  fileSize: number | null;
  createdAt: Date;
  itemType: { id: string; name: string; color: string; icon: string };
  tags: { tag: { name: string } }[];
}): ItemRowData {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    url: item.url,
    contentType: item.contentType,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    fileName: item.fileName,
    fileSize: item.fileSize,
    tags: item.tags.map((t) => t.tag.name),
    itemType: item.itemType,
    createdAt: item.createdAt,
  };
}

export async function getFavoriteItems(userId: string): Promise<ItemRowData[]> {
  const items = await prisma.item.findMany({
    where: { isFavorite: true, userId },
    orderBy: { updatedAt: 'desc' },
    ...itemWithTypeAndTags,
  });
  return items.map(mapItem);
}

export async function getPinnedItems(userId: string): Promise<ItemRowData[]> {
  const items = await prisma.item.findMany({
    take: 50,
    where: { isPinned: true, userId },
    orderBy: { updatedAt: 'desc' },
    ...itemWithTypeAndTags,
  });
  return items.map(mapItem);
}

export async function getItemsByCollectionId(
  collectionId: string,
  userId: string,
  page = 1,
): Promise<{ items: ItemRowData[]; total: number }> {
  const skip = (page - 1) * COLLECTIONS_PER_PAGE;
  const where = { userId, collections: { some: { collectionId } } };
  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: COLLECTIONS_PER_PAGE,
      ...itemWithTypeAndTags,
    }),
    prisma.item.count({ where }),
  ]);
  return { items: items.map(mapItem), total };
}

export async function getRecentItems(userId: string, limit = 10): Promise<ItemRowData[]> {
  const items = await prisma.item.findMany({
    take: limit,
    where: { userId },
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

export async function getItemTypesWithCounts(userId: string): Promise<ItemTypeWithCount[]> {
  const itemTypes = await prisma.itemType.findMany({
    where: { isSystem: true },
    include: { _count: { select: { items: { where: { userId } } } } },
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

export interface ItemsByTypeResult {
  items: ItemRowData[];
  total: number;
  typeName: string;
  typeColor: string;
  typeId: string;
}

export async function getItemsByType(slug: string, userId: string, page = 1): Promise<ItemsByTypeResult | null> {
  const typeName = slug.slice(0, -1); // "snippets" → "snippet"
  const itemType = await prisma.itemType.findFirst({
    where: { isSystem: true, name: { equals: typeName, mode: 'insensitive' } },
  });
  if (!itemType) return null;

  const where = { itemTypeId: itemType.id, userId };
  const skip = (page - 1) * ITEMS_PER_PAGE;
  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: ITEMS_PER_PAGE,
      ...itemWithTypeAndTags,
    }),
    prisma.item.count({ where }),
  ]);

  return { items: items.map(mapItem), total, typeName: itemType.name, typeColor: itemType.color, typeId: itemType.id };
}

export interface ItemDetail {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
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
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
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

function mapItemDetail(item: {
  id: string; title: string; description: string | null; content: string | null;
  url: string | null; fileUrl: string | null; fileName: string | null; fileSize: number | null;
  language: string | null; contentType: string; isFavorite: boolean; isPinned: boolean;
  createdAt: Date; updatedAt: Date;
  itemType: { id: string; name: string; color: string; icon: string };
  tags: { tag: { name: string } }[];
  collections: { collection: { id: string; name: string } }[];
}): ItemDetail {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    url: item.url,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
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

export async function updateItem(
  id: string,
  userId: string,
  data: {
    title: string;
    description?: string | null;
    content?: string | null;
    url?: string | null;
    language?: string | null;
    tags: string[];
    collectionIds?: string[];
  },
): Promise<ItemDetail | null> {
  const existing = await prisma.item.findFirst({ where: { id, userId } });
  if (!existing) return null;

  const validCollectionIds = data.collectionIds?.length
    ? (await prisma.collection.findMany({
        where: { id: { in: data.collectionIds }, userId },
        select: { id: true },
      })).map((c) => c.id)
    : [];

  const item = await prisma.item.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description ?? null,
      content: data.content ?? null,
      url: data.url ?? null,
      language: data.language ?? null,
      tags: {
        deleteMany: {},
        create: data.tags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      },
      collections: {
        deleteMany: {},
        create: validCollectionIds.map((collectionId) => ({ collectionId })),
      },
    },
    include: {
      itemType: { select: { id: true, name: true, color: true, icon: true } },
      tags: { include: { tag: { select: { name: true } } } },
      collections: { include: { collection: { select: { id: true, name: true } } } },
    },
  });

  return mapItemDetail(item);
}

export async function createItem(
  userId: string,
  data: {
    title: string;
    description?: string | null;
    content?: string | null;
    url?: string | null;
    fileUrl?: string | null;
    fileName?: string | null;
    fileSize?: number | null;
    language?: string | null;
    tags: string[];
    itemTypeId: string;
    contentType: 'text' | 'url' | 'file';
    collectionIds?: string[];
  },
): Promise<ItemDetail> {
  const validCollectionIds = data.collectionIds?.length
    ? (await prisma.collection.findMany({
        where: { id: { in: data.collectionIds }, userId },
        select: { id: true },
      })).map((c) => c.id)
    : [];

  const item = await prisma.item.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      content: data.content ?? null,
      url: data.url ?? null,
      fileUrl: data.fileUrl ?? null,
      fileName: data.fileName ?? null,
      fileSize: data.fileSize ?? null,
      language: data.language ?? null,
      contentType: data.contentType,
      userId,
      itemTypeId: data.itemTypeId,
      tags: {
        create: data.tags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      },
      collections: {
        create: validCollectionIds.map((collectionId) => ({ collectionId })),
      },
    },
    include: {
      itemType: { select: { id: true, name: true, color: true, icon: true } },
      tags: { include: { tag: { select: { name: true } } } },
      collections: { include: { collection: { select: { id: true, name: true } } } },
    },
  });

  return mapItemDetail(item);
}

export async function toggleItemPin(id: string, userId: string): Promise<boolean | null> {
  const existing = await prisma.item.findFirst({ where: { id, userId }, select: { id: true, isPinned: true } });
  if (!existing) return null;
  const updated = await prisma.item.update({
    where: { id },
    data: { isPinned: !existing.isPinned },
    select: { isPinned: true },
  });
  return updated.isPinned;
}

export async function toggleItemFavorite(id: string, userId: string): Promise<boolean | null> {
  const existing = await prisma.item.findFirst({ where: { id, userId }, select: { id: true, isFavorite: true } });
  if (!existing) return null;
  const updated = await prisma.item.update({
    where: { id },
    data: { isFavorite: !existing.isFavorite },
    select: { isFavorite: true },
  });
  return updated.isFavorite;
}

export async function deleteItem(id: string, userId: string): Promise<boolean> {
  const existing = await prisma.item.findFirst({ where: { id, userId } });
  if (!existing) return false;
  await prisma.item.delete({ where: { id } });
  if (existing.fileUrl) {
    await deleteFromR2(existing.fileUrl).catch(() => {});
  }
  return true;
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [totalItems, totalCollections, favoriteItems, favoriteCollections] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.item.count({ where: { isFavorite: true, userId } }),
    prisma.collection.count({ where: { isFavorite: true, userId } }),
  ]);

  return { totalItems, totalCollections, favoriteItems, favoriteCollections };
}
