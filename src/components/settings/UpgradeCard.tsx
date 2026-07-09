'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createCheckoutSessionAction } from '@/actions/billing';
import type { BillingInterval } from '@/lib/stripe';

const FEATURES = [
  'Unlimited items',
  'Unlimited collections',
  'File & image uploads',
  'AI features (coming soon)',
  'Priority support',
];

export function UpgradeCard() {
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const [isPending, startTransition] = useTransition();

  function handleUpgrade() {
    startTransition(async () => {
      await createCheckoutSessionAction(interval);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <h3 className="text-base font-semibold">Upgrade to Pro</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Unlock unlimited items, collections, and uploads.
          </p>
        </div>
      </div>

      {/* Plan toggle */}
      <div className="flex items-center gap-3 text-sm">
        <span className={cn(!interval.startsWith('y') && 'text-foreground', interval.startsWith('y') && 'text-muted-foreground')}>
          Monthly
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={interval === 'yearly'}
          onClick={() => setInterval(interval === 'monthly' ? 'yearly' : 'monthly')}
          className={cn(
            'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
            interval === 'yearly' ? 'bg-primary' : 'bg-input',
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform',
              interval === 'yearly' ? 'translate-x-4' : 'translate-x-0',
            )}
          />
        </button>
        <span className={cn(interval === 'yearly' ? 'text-foreground' : 'text-muted-foreground', 'flex items-center gap-1.5')}>
          Yearly
          <span className="rounded-full bg-green-500/15 border border-green-500/30 px-1.5 py-0.5 text-[10px] font-semibold text-green-400">
            Save 25%
          </span>
        </span>
      </div>

      {/* Pricing */}
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold tracking-tight">
          ${interval === 'monthly' ? '8' : '6'}
        </span>
        <span className="text-sm text-muted-foreground">
          /mo{interval === 'yearly' ? ' billed annually ($72/yr)' : ''}
        </span>
      </div>

      {/* Features */}
      <ul className="space-y-1.5 text-sm">
        {FEATURES.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500 shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <form action={handleUpgrade}>
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'Redirecting…' : `Upgrade — ${interval === 'monthly' ? '$8/mo' : '$72/yr'}`}
        </Button>
      </form>
    </div>
  );
}
