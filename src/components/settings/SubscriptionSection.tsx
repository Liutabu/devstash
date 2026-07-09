import { getSubscriptionStatus } from '@/lib/db/subscription';
import { UpgradeCard } from './UpgradeCard';
import { ManageSubscriptionCard } from './ManageSubscriptionCard';

export async function SubscriptionSection({ userId }: { userId: string }) {
  const status = await getSubscriptionStatus(userId);

  return (
    <section className="rounded-lg border border-border bg-card p-6 space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Subscription
      </h2>
      {status.isPro ? <ManageSubscriptionCard status={status} /> : <UpgradeCard />}
    </section>
  );
}
