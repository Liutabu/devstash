'use client';

import { useTransition } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPortalSessionAction } from '@/actions/billing';
import type { SubscriptionStatus } from '@/lib/db/subscription';

function formatDate(d: Date | null): string {
  if (!d) return '—';
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

export function ManageSubscriptionCard({ status }: { status: SubscriptionStatus }) {
  const [isPending, startTransition] = useTransition();

  function handleManage() {
    startTransition(async () => {
      await createPortalSessionAction();
    });
  }

  const planLabel = status.interval === 'year' ? 'Pro — Yearly' : 'Pro — Monthly';
  const renewLine = status.cancelAtPeriodEnd
    ? `Cancels on ${formatDate(status.currentPeriodEnd)} — reactivate via portal to stay Pro`
    : `Renews on ${formatDate(status.currentPeriodEnd)}`;

  return (
    <div className="space-y-4">
      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-yellow-400" />
          <h3 className="text-base font-semibold">{planLabel}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{renewLine}</p>
      </div>

      <form action={handleManage}>
        <Button type="submit" variant="outline" disabled={isPending}>
          {isPending ? 'Redirecting…' : 'Manage subscription'}
        </Button>
      </form>
    </div>
  );
}
