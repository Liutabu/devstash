'use client';

import { useState, useTransition } from 'react';
import { Check, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createCheckoutSessionAction } from '@/actions/billing';
import type { BillingInterval } from '@/lib/stripe';

const FREE_FEATURES: { text: string; included: boolean }[] = [
  { text: '50 items', included: true },
  { text: '3 collections', included: true },
  { text: 'All item types (text & links)', included: true },
  { text: 'Full-text search', included: true },
  { text: 'File & image uploads', included: false },
  { text: 'AI features', included: false },
];

const PRO_FEATURES: { text: string; soon?: boolean }[] = [
  { text: 'Unlimited items' },
  { text: 'Unlimited collections' },
  { text: 'File & image uploads' },
  { text: 'Priority support' },
  { text: 'AI tagging & summaries', soon: true },
  { text: 'Explain code & optimize prompts', soon: true },
  { text: 'Export data (JSON / ZIP)', soon: true },
];

export function UpgradePlans() {
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const [isPending, startTransition] = useTransition();
  const yearly = interval === 'yearly';

  function handleUpgrade() {
    startTransition(async () => {
      await createCheckoutSessionAction(interval);
    });
  }

  return (
    <div className="space-y-10">
      {/* Heading + interval toggle */}
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Upgrade to Pro
          </h1>
          <p className="text-sm text-muted-foreground">
            Unlimited items, collections, and uploads. Cancel any time.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 text-sm">
          <span className={yearly ? 'text-muted-foreground' : 'text-foreground'}>Monthly</span>
          <button
            type="button"
            role="switch"
            aria-checked={yearly}
            aria-label="Toggle yearly billing"
            onClick={() => setInterval(yearly ? 'monthly' : 'yearly')}
            className={cn(
              'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
              yearly ? 'bg-primary' : 'bg-input',
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform',
                yearly ? 'translate-x-4' : 'translate-x-0',
              )}
            />
          </button>
          <span className={cn('flex items-center gap-1.5', yearly ? 'text-foreground' : 'text-muted-foreground')}>
            Yearly
            <span className="rounded-full border border-green-500/30 bg-green-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-green-400">
              Save 25%
            </span>
          </span>
        </div>
      </div>

      {/* Plans */}
      <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Free */}
        <div className="rounded-xl border border-border bg-card p-8">
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Free
          </div>
          <div className="mb-2 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold tracking-tight">$0</span>
            <span className="text-sm text-muted-foreground">/month</span>
          </div>
          <p className="mb-7 text-sm text-muted-foreground">
            Everything you need to get started.
          </p>
          <ul className="mb-7 flex flex-col gap-3">
            {FREE_FEATURES.map(({ text, included }) => (
              <li
                key={text}
                className={cn(
                  'flex items-center gap-2.5 text-sm',
                  included ? 'text-foreground' : 'text-muted-foreground/60',
                )}
              >
                {included ? (
                  <Check className="h-3.5 w-3.5 shrink-0 text-green-500" />
                ) : (
                  <X className="h-3.5 w-3.5 shrink-0" />
                )}
                {text}
              </li>
            ))}
          </ul>
          <Button variant="outline" className="w-full" disabled>
            Current plan
          </Button>
        </div>

        {/* Pro */}
        <div className="relative rounded-xl border border-primary bg-card p-8 ring-1 ring-primary/40">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-4 py-1 text-[11px] font-bold tracking-wide text-primary-foreground">
            Most Popular
          </div>
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Pro
          </div>
          <div className="mb-2 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold tracking-tight">{yearly ? '$6' : '$8'}</span>
            <span className="text-sm text-muted-foreground">
              {yearly ? '/month, billed $72/yr' : '/month'}
            </span>
          </div>
          <p className="mb-7 text-sm text-muted-foreground">
            Unlimited everything, with AI features on the way.
          </p>
          <ul className="mb-7 flex flex-col gap-3">
            {PRO_FEATURES.map(({ text, soon }) => (
              <li key={text} className="flex items-center gap-2.5 text-sm text-foreground">
                <Check
                  className={cn('h-3.5 w-3.5 shrink-0', soon ? 'text-muted-foreground/50' : 'text-green-500')}
                />
                <span className={cn(soon && 'text-muted-foreground')}>{text}</span>
                {soon && (
                  <span className="rounded-full border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Soon
                  </span>
                )}
              </li>
            ))}
          </ul>
          <form action={handleUpgrade}>
            <Button type="submit" disabled={isPending} className="w-full">
              <Sparkles className="h-4 w-4" />
              {isPending ? 'Redirecting…' : `Upgrade — ${yearly ? '$72/yr' : '$8/mo'}`}
            </Button>
          </form>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Secure checkout powered by Stripe. Manage or cancel your subscription any time from Settings.
      </p>
    </div>
  );
}
