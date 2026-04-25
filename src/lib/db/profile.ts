import { prisma } from '@/lib/prisma';

export interface ItemTypeCount {
  name: string;
  icon: string;
  color: string;
  count: number;
}

export interface ProfileData {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt: Date;
  hasPassword: boolean;
  totalItems: number;
  totalCollections: number;
  itemTypeCounts: ItemTypeCount[];
}

export async function getProfileData(userId: string): Promise<ProfileData | null> {
  const [user, totalItems, totalCollections, itemTypes, itemsByType] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, image: true, createdAt: true, password: true },
    }),
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.itemType.findMany({
      where: { isSystem: true },
      select: { id: true, name: true, icon: true, color: true },
      orderBy: { name: 'asc' },
    }),
    prisma.item.groupBy({
      by: ['itemTypeId'],
      where: { userId },
      _count: { _all: true },
    }),
  ]);

  if (!user) return null;

  const countByTypeId = new Map(itemsByType.map((g) => [g.itemTypeId, g._count._all]));

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    createdAt: user.createdAt,
    hasPassword: !!user.password,
    totalItems,
    totalCollections,
    itemTypeCounts: itemTypes.map((t) => ({
      name: t.name,
      icon: t.icon,
      color: t.color,
      count: countByTypeId.get(t.id) ?? 0,
    })),
  };
}
