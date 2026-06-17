import { prisma } from '@/lib/prisma';

export const FREE_LIMITS = {
  items: 50,
  collections: 3,
} as const;

export interface UserLimits {
  isPro: boolean;
  itemCount: number;
  collectionCount: number;
  canCreateItem: boolean;
  canCreateCollection: boolean;
  canUseProType: boolean;
}

const PRO_TYPE_SLUGS = new Set(['file', 'image']);

export function isProType(itemTypeName: string): boolean {
  return PRO_TYPE_SLUGS.has(itemTypeName.toLowerCase());
}

export async function getUserLimits(userId: string): Promise<UserLimits> {
  const [user, itemCount, collectionCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { isPro: true } }),
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
  ]);

  const isPro = user?.isPro ?? false;
  const bypass = process.env.BYPASS_PRO_LIMITS === 'true';
  const effectivePro = isPro || bypass;

  return {
    isPro,
    itemCount,
    collectionCount,
    canCreateItem: effectivePro || itemCount < FREE_LIMITS.items,
    canCreateCollection: effectivePro || collectionCount < FREE_LIMITS.collections,
    canUseProType: effectivePro,
  };
}
