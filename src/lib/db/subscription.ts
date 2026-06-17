import { prisma } from '@/lib/prisma';

export interface SubscriptionStatus {
  isPro: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  interval: 'month' | 'year' | null;
}

export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isPro: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      subscriptionStatus: true,
      subscriptionPeriodEnd: true,
      subscriptionCancelAtEnd: true,
      subscriptionInterval: true,
    },
  });
  return {
    isPro: user?.isPro ?? false,
    stripeCustomerId: user?.stripeCustomerId ?? null,
    stripeSubscriptionId: user?.stripeSubscriptionId ?? null,
    currentPeriodEnd: user?.subscriptionPeriodEnd ?? null,
    cancelAtPeriodEnd: user?.subscriptionCancelAtEnd ?? false,
    interval: (user?.subscriptionInterval as 'month' | 'year' | null) ?? null,
  };
}
