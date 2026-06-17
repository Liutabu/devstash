# Stripe Subscription Integration Plan — DevStash Pro

> **Pricing:** $8/month (monthly), $72/year (≈$6/month yearly — 25% savings)
> **Target:** Single Pro tier, no team/seat billing, no metered usage.

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Feature Gating Strategy](#2-feature-gating-strategy)
3. [Stripe Dashboard Setup](#3-stripe-dashboard-setup)
4. [Files to Create](#4-files-to-create)
5. [Files to Modify](#5-files-to-modify)
6. [Testing Checklist](#6-testing-checklist)
7. [Implementation Order](#7-implementation-order)

---

## 1. Current State Analysis

### User Model (already Stripe-ready)

`prisma/schema.prisma:20-41` — the `User` model already contains the three fields needed for Stripe integration:

```prisma
isPro                Boolean   @default(false)
stripeCustomerId     String?   @unique
stripeSubscriptionId String?   @unique
```

No migration is required to add billing fields. We **will** need a migration to track subscription state (renewal date, cancel-at-period-end) — see [Files to Modify §5.1](#51-prismaschemaprisma).

### NextAuth Configuration

- `src/auth.ts:13-23` — JWT session strategy, `session()` callback already exists and copies `token.sub` to `session.user.id`.
- `src/auth.config.ts` — edge-safe split (no Prisma adapter); used by middleware (`src/proxy.ts`).
- `src/types/next-auth.d.ts` — session type currently only adds `id`.
- **There is no `jwt()` callback yet.** This is where we'll plug in the database read that syncs `isPro` per the strategy in `context/research/stripe-integration-research.md`.

### Session / User Data Access Pattern

Every server route follows the same shape (e.g. `src/actions/items.ts:57-59`, `src/app/api/upload/route.ts:31-35`):

```typescript
const session = await auth();
if (!session?.user?.id) return { success: false, error: 'Unauthorized' };
// or for API routes:
if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
```

Once we extend the `Session` type, all of these gain a typed `session.user.isPro` without further code changes.

### Existing Subscription / Payment Code

**None.** `.env.example:32-37` already lists the five Stripe env vars (secret, publishable, webhook secret, monthly price, yearly price). The marketing pricing card at `src/app/(marketing)/_components/PricingSection.tsx` links to `/register` — there is **no** "Upgrade" CTA anywhere on the authenticated side yet.

A grep for `isPro|stripeCustomerId|stripeSubscriptionId` confirms zero references in `src/` except the unused `mockUser` constant in `src/lib/mock-data.ts:20`.

---

## 2. Feature Gating Strategy

### Free Tier Limits (from `context/project-overview.md`)

| Resource | Free limit | Pro |
|---|---|---|
| Items | 50 total | Unlimited |
| Collections | 3 | Unlimited |
| Item types | `snippet`, `prompt`, `command`, `note`, `link` (no `file`, `image`) | All types |
| File & image uploads | ❌ | ✅ |
| AI features | ❌ | ✅ (not yet built) |
| Export | ❌ | ✅ (not yet built) |
| Custom types | ❌ | ✅ (not yet built) |

> ⚠️ The CLAUDE.md notes: **"During development, all users will have access to Pro features for testing purposes."** Gating should be **enforced** server-side but **bypassable** by a `BYPASS_PRO_LIMITS=true` env flag during dev. See §4.4.

### Where Limits Need to Be Enforced

| Action | File | Function | Current state |
|---|---|---|---|
| Create item | [src/actions/items.ts:57](src/actions/items.ts#L57) | `createItemAction` | No limit check |
| Create collection | [src/actions/collections.ts:19](src/actions/collections.ts#L19) | `createCollectionAction` | No limit check |
| Upload file/image | [src/app/api/upload/route.ts:31](src/app/api/upload/route.ts#L31) | `POST /api/upload` | No Pro check |
| Pick `file`/`image` type when creating | [src/components/items/CreateItemDialog.tsx] | Already excludes per UI history | UI-only — server still accepts (see [src/actions/items.ts:64-71](src/actions/items.ts#L64-L71)) |

`src/lib/db/items.ts:414-423` (`getDashboardStats`) already counts items + collections per user, but uses 4 separate queries. For the gate check we want one consolidated helper that returns both counts in a single round-trip alongside `isPro`.

### Item / Collection Counts (where already computed)

- `getDashboardStats(userId)` — `src/lib/db/items.ts:414` — totals items + collections for the user.
- `getProfileData(userId)` — `src/lib/db/profile.ts:34` — totals plus per-type breakdown.

Both can stay; we add a lightweight `getUserLimits(userId)` helper specifically for write-path gating.

### Pro-only Item Types

`Sidebar` currently shows a static `PRO` badge on Files / Images entries ([src/components/dashboard/Sidebar.tsx:70-74](src/components/dashboard/Sidebar.tsx#L70)) regardless of plan. After the integration, that badge should disappear for Pro users.

### Settings Page Structure

`src/app/settings/page.tsx` is the natural home for the subscription UI:

```
Settings
├─ Editor Preferences        (existing)
├─ Subscription              ← NEW
├─ Change Password           (existing, email users only)
└─ Danger Zone               (existing)
```

The page already fetches `getProfileData(userId)` in parallel. We just add `getSubscriptionStatus(userId)` to the same `Promise.all`.

---

## 3. Stripe Dashboard Setup

### 3.1 Products & Prices

1. **Create a Product** — "DevStash Pro"
2. **Create two recurring Prices** on that product:
   - **Monthly**: $8.00 USD, billed monthly. Copy the `price_…` ID → `STRIPE_PRICE_ID_MONTHLY`.
   - **Yearly**: $72.00 USD, billed yearly. Copy the `price_…` ID → `STRIPE_PRICE_ID_YEARLY`.
3. Use **Test mode** for development. The publishable + secret key pair from Developers → API keys.

### 3.2 Customer Portal Configuration

Go to **Settings → Billing → Customer portal** (Test mode):

- **Business name**: DevStash
- **Customer information**: allow updating email + billing address.
- **Payment methods**: allow update.
- **Invoice history**: enabled.
- **Cancellations**: enable "Cancel subscriptions" with mode = **At end of billing period** (so Pro stays usable until period ends).
- **Subscription updates**: enable plan switching between Monthly ↔ Yearly. Enable **Prorate** for upgrades.

### 3.3 Webhook Endpoint

After deploying (or via Stripe CLI for local dev — see §6):

- URL: `https://<your-domain>/api/stripe/webhook`
- **Events to listen for**:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
- Copy the **Signing secret** (`whsec_…`) → `STRIPE_WEBHOOK_SECRET`.

### 3.4 Environment Variables

All five entries already exist in [.env.example:32-37](.env.example#L32). Fill in `.env.local`:

```bash
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID_MONTHLY="price_..."
STRIPE_PRICE_ID_YEARLY="price_..."

# Optional dev override — when set, server-side limit checks pass through
BYPASS_PRO_LIMITS="true"
```

Add `BYPASS_PRO_LIMITS` to `.env.example` with a comment.

---

## 4. Files to Create

### 4.1 `src/lib/stripe.ts` — Stripe client singleton

```typescript
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover', // pin to current Stripe API version
  typescript: true,
});

export const STRIPE_PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY!,
  yearly: process.env.STRIPE_PRICE_ID_YEARLY!,
} as const;

export type BillingInterval = keyof typeof STRIPE_PRICE_IDS;
```

Install dependency: `npm install stripe`

### 4.2 `src/lib/limits.ts` — Free-tier constants & gating helper

```typescript
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
```

> **Why one helper, not three?** Because every write path needs `isPro` + the count for that resource. Keeping it in one query avoids N+1 patterns and lets the UI display "47/50 items used" cheaply.

### 4.3 `src/lib/db/subscription.ts` — DB lookups for the settings UI

```typescript
import { prisma } from '@/lib/prisma';

export interface SubscriptionStatus {
  isPro: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  // Populated after first webhook event lands:
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
      subscriptionStatus: true,        // see schema migration §5.1
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
```

### 4.4 `src/actions/billing.ts` — Server actions for checkout & portal

```typescript
'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { stripe, STRIPE_PRICE_IDS, type BillingInterval } from '@/lib/stripe';

async function getOrCreateCustomer(userId: string, email: string, name: string | null) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });
  if (user?.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripe.customers.create({
    email,
    name: name ?? undefined,
    metadata: { userId },
  });
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });
  return customer.id;
}

export async function createCheckoutSessionAction(interval: BillingInterval) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) redirect('/sign-in');

  const customerId = await getOrCreateCustomer(
    session.user.id,
    session.user.email,
    session.user.name ?? null,
  );

  const checkout = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: STRIPE_PRICE_IDS[interval], quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${process.env.APP_URL}/settings?upgrade=success`,
    cancel_url: `${process.env.APP_URL}/settings?upgrade=cancelled`,
    metadata: { userId: session.user.id },
    subscription_data: {
      metadata: { userId: session.user.id },
    },
  });

  if (!checkout.url) {
    redirect('/settings?upgrade=error');
  }
  redirect(checkout.url);
}

export async function createPortalSessionAction() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });
  if (!user?.stripeCustomerId) redirect('/settings?upgrade=no_customer');

  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.APP_URL}/settings`,
  });
  redirect(portal.url);
}
```

> Follows the project's existing server-action convention: `await auth()` first, redirect-on-error for form submissions (`profile.ts` pattern), `{ success, data, error }` only for actions called from client components that need to render messages.

### 4.5 `src/app/api/stripe/webhook/route.ts` — Webhook handler

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs'; // Buffer + raw body — not edge

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Invalid signature';
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const cs = event.data.object as Stripe.Checkout.Session;
        const userId = cs.metadata?.userId;
        const customerId = cs.customer as string;
        const subscriptionId = cs.subscription as string;
        if (!userId) break;
        await prisma.user.update({
          where: { id: userId },
          data: {
            isPro: true,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
          },
        });
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;
        const item = sub.items.data[0];
        const interval = item?.price.recurring?.interval ?? null;
        const isActive = sub.status === 'active' || sub.status === 'trialing';

        await prisma.user.update({
          where: { id: userId },
          data: {
            isPro: isActive,
            stripeSubscriptionId: sub.id,
            subscriptionStatus: sub.status,
            subscriptionPeriodEnd: new Date(sub.current_period_end * 1000),
            subscriptionCancelAtEnd: sub.cancel_at_period_end,
            subscriptionInterval: interval,
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;
        await prisma.user.update({
          where: { id: userId },
          data: {
            isPro: false,
            subscriptionStatus: 'canceled',
            subscriptionCancelAtEnd: false,
            stripeSubscriptionId: null,
          },
        });
        break;
      }

      case 'invoice.payment_failed': {
        const inv = event.data.object as Stripe.Invoice;
        const customerId = inv.customer as string;
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { subscriptionStatus: 'past_due' },
        });
        break;
      }
    }
  } catch (err) {
    console.error('[stripe webhook] handler error', err);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
```

> **Important:** Next.js 16 App Router does **not** strip the body of POST routes — we can call `req.text()` directly. No `bodyParser: false` config needed (that was Pages Router).

### 4.6 `src/components/settings/SubscriptionSection.tsx` — UI block

A server component that renders one of three states:

- **No subscription / Free user** → "Upgrade to Pro" with Monthly/Yearly toggle and CheckoutForm
- **Active subscription** → plan name, renewal date, "Manage subscription" button (portal)
- **Cancelled at end of period** → "Pro until DATE — Reactivate" button (portal)

```typescript
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
```

### 4.7 `src/components/settings/UpgradeCard.tsx` — Monthly/yearly picker

`'use client'` component that mirrors the marketing PricingSection toggle ([src/app/(marketing)/_components/PricingSection.tsx](src/app/(marketing)/_components/PricingSection.tsx)) but submits to `createCheckoutSessionAction`. Reuse styling tokens from that file for consistency.

### 4.8 `src/components/settings/ManageSubscriptionCard.tsx`

Displays plan, renewal date, cancel-at-period-end status; the single button submits a `<form action={createPortalSessionAction}>` — same pattern used by `signOutAction` ([src/components/dashboard/Sidebar.tsx:183-191](src/components/dashboard/Sidebar.tsx#L183)).

### 4.9 Unit tests

- `src/lib/limits.test.ts` — verify `canCreateItem` / `canCreateCollection` thresholds, BYPASS env flag, `isProType` helper.
- `src/actions/billing.test.ts` — mock `stripe.checkout.sessions.create`, assert URL params and metadata. Mock `auth()` from the existing `@/auth` mock pattern in `src/actions/items.test.ts`.

> Per project convention ([context/ai-interaction.md](context/ai-interaction.md)), no tests for the webhook handler itself — but test any utility helpers we extract.

---

## 5. Files to Modify

### 5.1 `prisma/schema.prisma` — Add subscription state fields

Add these fields to `User`:

```prisma
subscriptionStatus      String?   // 'active' | 'past_due' | 'canceled' | 'trialing' | ...
subscriptionPeriodEnd   DateTime?
subscriptionCancelAtEnd Boolean   @default(false)
subscriptionInterval    String?   // 'month' | 'year'
```

Then: `npx prisma migrate dev --name add_subscription_state` (per [CLAUDE.md](CLAUDE.md) — **never** `db push`).

### 5.2 `src/types/next-auth.d.ts` — Expose `isPro` on session

```typescript
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      isPro: boolean;
    } & DefaultSession['user'];
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    isPro?: boolean;
  }
}
```

### 5.3 `src/auth.ts` — Add JWT callback that always syncs `isPro`

Per the strategy note in `context/research/stripe-integration-research.md` lines 47-68 — the only reliable cross-tab + cross-webhook sync mechanism. The extra query is a single `findUnique` on `User.id` (indexed PK), measured at ~2–4ms on Neon serverless.

```typescript
callbacks: {
  async jwt({ token, user }) {
    if (user) token.sub = user.id;
    if (token.sub) {
      const dbUser = await prisma.user.findUnique({
        where: { id: token.sub },
        select: { isPro: true },
      });
      token.isPro = dbUser?.isPro ?? false;
    }
    return token;
  },
  session({ session, token }) {
    if (token.sub) session.user.id = token.sub;
    session.user.isPro = token.isPro ?? false;
    return session;
  },
},
```

> Replace the existing `callbacks: { session(...) }` block at [src/auth.ts:16-23](src/auth.ts#L16). The `jwt` callback must live in `auth.ts` (not `auth.config.ts`) because it needs the Prisma client, which is not edge-compatible — same reason the `Credentials.authorize` body lives here.

### 5.4 `src/actions/items.ts` — Gate `createItemAction`

After the auth check (line 59), before the type lookup:

```typescript
import { getUserLimits, isProType } from '@/lib/limits';

const limits = await getUserLimits(session.user.id);
if (!limits.canCreateItem) {
  return { success: false, error: 'Item limit reached. Upgrade to Pro for unlimited items.' };
}

// After itemType is loaded, before createItem():
if (isProType(itemType.name) && !limits.canUseProType) {
  return { success: false, error: 'File and image items require Pro.' };
}
```

### 5.5 `src/actions/collections.ts` — Gate `createCollectionAction`

After auth check (line 23):

```typescript
import { getUserLimits } from '@/lib/limits';

const limits = await getUserLimits(session.user.id);
if (!limits.canCreateCollection) {
  return { success: false, error: 'Collection limit reached. Upgrade to Pro for unlimited collections.' };
}
```

### 5.6 `src/app/api/upload/route.ts` — Gate file uploads

After the existing auth check (line 33):

```typescript
import { getUserLimits } from '@/lib/limits';

const limits = await getUserLimits(session.user.id);
if (!limits.canUseProType) {
  return NextResponse.json({ error: 'File uploads require Pro.' }, { status: 403 });
}
```

### 5.7 `src/app/settings/page.tsx` — Add Subscription section

Add to the parallel fetch and render between Editor Preferences and Change Password:

```typescript
const [itemTypes, sidebarCollections, userCollections, searchData, editorPreferences, profile, params] = await Promise.all([
  // ...existing...
]);

// In JSX:
<EditorPreferencesSection />
<SubscriptionSection userId={userId} />
{profile.hasPassword && (
  <ChangePasswordSection errorMsg={errorMsg} passwordChanged={passwordChanged} />
)}
```

Also handle the new `?upgrade=` query params at the top of the file (`success`, `cancelled`, `error`, `no_customer`) using the existing `SuccessBanner` / `ErrorBanner` components at `src/components/ui/banners.tsx`.

### 5.8 `src/components/dashboard/Sidebar.tsx` — Hide PRO badge for Pro users

`Sidebar` is already client-rendered with a `user` prop ([src/components/dashboard/Sidebar.tsx:14-25](src/components/dashboard/Sidebar.tsx#L14)). Extend the `SidebarUser` interface to include `isPro?: boolean`, thread it from `DashboardShell`, and gate the badge:

```typescript
{!user.isPro && (type.slug === 'files' || type.slug === 'images') && (
  <span className={cn(badgeVariants({ variant: 'secondary' }), 'px-1.5 text-[10px] font-semibold tracking-wide')}>
    PRO
  </span>
)}
```

Each of the six `DashboardShell`-using pages already passes `session.user` — once §5.2 lands, `session.user.isPro` is automatically available, no per-page changes needed.

### 5.9 `src/components/items/CreateItemDialog.tsx` — Gate file/image options

Currently the spec says file/image are excluded from the type picker. After the integration, they should appear but be disabled (with a small "Pro" hint) for free users. Thread `isPro` via `DashboardShell`/`session.user`.

> If the existing exclusion is hard-coded, switch it to "render but disable + onClick → router.push('/settings?upgrade=true')".

### 5.10 `.env.example` — Document `BYPASS_PRO_LIMITS`

Add after the Stripe block:

```bash
# Dev-only: set to "true" to bypass free-tier limits and enable Pro features
# without an active subscription. NEVER set to "true" in production.
BYPASS_PRO_LIMITS="false"
```

### 5.11 `src/proxy.ts` — No changes required

`/settings` is already in the protected matcher; the new routes (`/api/stripe/webhook`) are outside `PROTECTED_PREFIXES` (intentional — Stripe must reach it unauthenticated).

### 5.12 `src/lib/rate-limit.ts` — Add `checkoutSession` limiter (optional)

The checkout server action triggers a Stripe API call. Add a conservative 10/minute limiter to avoid abuse:

```typescript
checkoutSession: makeLimiter('checkout', 10, '1 m'),
```

Wire it into `createCheckoutSessionAction` after the auth check. Webhook route does **not** need rate limiting (Stripe signature already enforces authenticity).

---

## 6. Testing Checklist

### Local webhook setup (one-time)

```bash
# Install Stripe CLI: https://docs.stripe.com/stripe-cli
stripe login
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
# Copy the whsec_... it prints into STRIPE_WEBHOOK_SECRET in .env.local
```

### Happy path

- [ ] Free user sees "47/50 items used" or similar usage stat on Settings
- [ ] Free user clicking "Upgrade — Monthly" hits Stripe Checkout with `price_..._MONTHLY` selected
- [ ] After completing test checkout (card `4242 4242 4242 4242`), `customer.subscription.created` webhook fires → `User.isPro = true`, `subscriptionPeriodEnd` populated
- [ ] Settings page re-renders showing "Pro — renews on DATE"
- [ ] Sidebar PRO badges disappear after refresh
- [ ] File upload now succeeds; previously-blocked creation works
- [ ] Switching to Yearly via Customer Portal triggers `customer.subscription.updated` → `subscriptionInterval` flips to `'year'`

### Edge cases

- [ ] Free user at 50 items: `createItemAction` returns `{ success: false, error: 'Item limit reached...' }`; toast displays in `CreateItemDialog`
- [ ] Free user at 3 collections: same for `createCollectionAction`
- [ ] Free user POSTs to `/api/upload`: returns 403
- [ ] Cancellation via portal → webhook sets `subscriptionCancelAtEnd: true` but `isPro` stays `true` until period end
- [ ] After period end, `customer.subscription.deleted` webhook fires → `isPro: false`, `subscriptionStatus: 'canceled'`
- [ ] Payment failure (card `4000 0000 0000 0341`) → `invoice.payment_failed` webhook → `subscriptionStatus: 'past_due'`; user still has Pro access until subscription is actually deleted
- [ ] Webhook with bad signature returns 400 (test: `curl -X POST -d '{}' http://localhost:3000/api/stripe/webhook`)
- [ ] Webhook with unknown event type returns 200 (Stripe re-tries on non-2xx; we ack unknown events)

### Auth + session

- [ ] After successful checkout, refreshing any page (not the same tab) picks up `isPro = true` (proves the JWT callback resyncs from DB)
- [ ] Test in two tabs: tab A upgrades, tab B refreshes — tab B's session reflects Pro state
- [ ] Sign out + sign back in: `isPro` correctly reflects DB state

### `BYPASS_PRO_LIMITS=true` (dev)

- [ ] With flag set, free user can create unlimited items and collections
- [ ] With flag unset (or `false`), limits apply normally

### Unit tests

- [ ] `src/lib/limits.test.ts` passes (`canCreateItem` boundary at 49/50/51)
- [ ] `src/actions/billing.test.ts` passes
- [ ] Existing `npm run test:run` still passes
- [ ] `npm run build` passes

---

## 7. Implementation Order

Sized so each step is independently committable and shippable.

| # | Step | Estimated effort |
|---|---|---|
| 1 | **Prisma migration** for subscription state fields (§5.1) + run `prisma migrate dev` | 10 min |
| 2 | **Install `stripe` package** + create `src/lib/stripe.ts` (§4.1) + add `BYPASS_PRO_LIMITS` to `.env.example` (§5.10) | 10 min |
| 3 | **NextAuth changes**: extend session type (§5.2), add `jwt` callback (§5.3). Verify `session.user.isPro` flows through with manual SQL flip on demo user. | 20 min |
| 4 | **Limits helper** `src/lib/limits.ts` (§4.2) + unit tests | 30 min |
| 5 | **Gate write paths**: items (§5.4), collections (§5.5), upload (§5.6). Confirm error toasts. | 30 min |
| 6 | **Sidebar / dialog UI** for Pro state (§5.8, §5.9) | 30 min |
| 7 | **Billing actions** `src/actions/billing.ts` (§4.4) + unit tests | 45 min |
| 8 | **Subscription DB helper** (§4.3) + Settings UI sections (§4.6–4.8 + §5.7). Manual end-to-end test of checkout via Stripe CLI. | 1.5 hr |
| 9 | **Webhook route** (§4.5). Test all five event types with `stripe trigger ...`. | 1 hr |
| 10 | **Polish**: optional rate-limiting on checkout (§5.12), banners for `?upgrade=` query params, copy review | 30 min |
| 11 | **QA pass**: walk the entire Testing Checklist above | 1 hr |

**Estimated total: ~6 hours of focused work**, end to end.

---

## Notes for the Implementer

- **Per [CLAUDE.md](CLAUDE.md):** never `prisma db push`. Always migrate.
- **Per [context/ai-interaction.md](context/ai-interaction.md):** create the `feature/stripe-integration` branch first, document this in `context/current-feature.md`, write tests for new server actions, and don't auto-commit.
- **Do not include "Claude" in commit messages** — explicitly noted in CLAUDE.md.
- The marketing pricing card ([src/app/(marketing)/_components/PricingSection.tsx](src/app/(marketing)/_components/PricingSection.tsx)) currently routes both CTAs to `/register`. After this work, the Pro card should route signed-in users straight to checkout, signed-out users to `/register?upgrade=pro` so the upgrade intent survives sign-up.
- Stripe's API version pinning (`apiVersion: '2025-09-30.clover'` in §4.1) should be revisited when implementing; bump to whatever the SDK version's default suggests.
