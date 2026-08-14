# Stripe Integration - Phase 2: Webhooks, Feature Gating & UI

> **Reconciled to as-built (2026-08-14).** This document originally described a
> plan; the implementation diverged in several places (webhook path, event set,
> checkout/portal transport, billing UI, and the limits module name). It has
> been rewritten to match the code that actually shipped in `main`
> (`a670be7 feat: stripe phase 2 - integration & UI`). See
> **Divergences from the original plan** at the bottom for the summary.

## Overview

Wire up a Stripe webhook handler to sync subscription status, add feature gating
to server actions and the upload route, build billing UI on the settings page,
and show an upgrade banner after checkout. Requires the Stripe CLI for local
webhook testing.

## Prerequisites

- Phase 1 complete (Stripe SDK, `src/lib/limits.ts` usage utilities, session `isPro`, checkout/portal **server actions**)
- Stripe CLI installed (`brew install stripe/stripe-cli/stripe`)
- Stripe CLI authenticated (`stripe login`)
- Webhook forwarding active: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Copy the webhook signing secret from CLI output to `STRIPE_WEBHOOK_SECRET`
- `APP_URL` set (used to build checkout `success_url` / `cancel_url` and portal `return_url`)

## Requirements

- Handle Stripe webhook events to sync subscription status to the database
- Gate item creation behind free-tier limits (count + Pro-only types)
- Gate collection creation behind free-tier limits
- Gate file/image uploads behind a Pro check
- Add a billing section to the settings page
- Show an upgrade result banner after the checkout redirect

## Implementation

### 1. `src/app/api/stripe/webhook/route.ts`

> **Path note:** the route is `/api/stripe/webhook`, **not** `/api/webhooks/stripe`.

`export const runtime = 'nodejs'`. POST endpoint that:

1. Reads `stripe-signature` header and `STRIPE_WEBHOOK_SECRET`; returns **400** if either is missing
2. Reads the raw body with `req.text()` (App Router provides the raw body by default)
3. Verifies the signature with `stripe.webhooks.constructEvent()`; returns **400** on an invalid signature
4. Handles events in a single inline `switch (event.type)` — **there are no extracted `handleX` functions**
5. Wraps the switch in try/catch; returns **500** `{ error: 'Handler error' }` on a thrown handler error
6. Returns `{ received: true }` on success

#### Webhook Events

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Look up user via `metadata.userId`; set `isPro: true`, store `stripeCustomerId` and `stripeSubscriptionId`. No-op if `userId`/`customerId` missing. |
| `customer.subscription.created` | (Same handler as `updated`.) Sync `isPro` from status + subscription fields. |
| `customer.subscription.updated` | Set `isPro` from status (`active`/`trialing` = true, else false); also persist `subscriptionStatus`, `subscriptionPeriodEnd`, `subscriptionCancelAtEnd`, `subscriptionInterval`. |
| `customer.subscription.deleted` | Set `isPro: false`, `subscriptionStatus: 'canceled'`, `subscriptionCancelAtEnd: false`, clear `stripeSubscriptionId`. |
| `invoice.payment_failed` | Set `subscriptionStatus: 'past_due'` only — **no downgrade** (Stripe retries; downgrade happens on `subscription.deleted`). |

> **There is no `invoice.paid` handler.** Renewals keep users Pro through the
> `customer.subscription.updated` event instead.

Key details:
- `checkout.session.completed` finds the user by `metadata.userId` and uses `prisma.user.update`
- The subscription handlers prefer `sub.metadata.userId` (`prisma.user.update`) and fall back to `prisma.user.updateMany` scoped by `stripeCustomerId` for idempotency
- Customer/subscription fields may be a string or an object — handled with `typeof x === 'string'` checks
- Stripe API `2026-05-27.dahlia` moved `current_period_end` to the subscription **item** level; it is read via `(item as unknown as { current_period_end?: number })` until the SDK types catch up

### 2. `src/actions/items.ts` — `createItemAction`

Imports `getUserLimits, isProType` from `@/lib/limits`. Adds two checks:

1. **Usage limit (before the type lookup):** compute `const limits = await getUserLimits(session.user.id)`; if `!limits.canCreateItem`, return
   `{ success: false, error: 'Item limit reached. Upgrade to Pro for unlimited items.' }`
2. **Pro type (after the type lookup):** if `isProType(itemType.name) && !limits.canUseProType`, return
   `{ success: false, error: 'File and image items require Pro.' }`

### 3. `src/actions/collections.ts` — `createCollectionAction`

Imports `getUserLimits` from `@/lib/limits`. Before creation, if `!limits.canCreateCollection`, return
`{ success: false, error: 'Collection limit reached. Upgrade to Pro for unlimited collections.' }`

### 4. `src/app/api/upload/route.ts`

After the auth check, gate on the shared limits helper (not a raw `isPro` DB read):

```typescript
const limits = await getUserLimits(session.user.id);
if (!limits.canUseProType) {
  return NextResponse.json({ error: 'File uploads require Pro.' }, { status: 403 });
}
```

`canUseProType` already respects real `isPro` **and** the `BYPASS_PRO_LIMITS` dev override.

### 5. Billing UI — `SubscriptionSection` + `UpgradeCard` + `ManageSubscriptionCard`

> Built as three components under `src/components/settings/`, **not** a single
> `billing-settings.tsx`.

- `SubscriptionSection.tsx` — **server** component; `getSubscriptionStatus(userId)` then renders
  `status.isPro ? <ManageSubscriptionCard status={status} /> : <UpgradeCard />` inside a bordered "Subscription" section
- `UpgradeCard.tsx` — client; Monthly/Yearly toggle, dynamic pricing ($8/mo or $6/mo billed $72/yr), feature list; the form's `action` calls the **`createCheckoutSessionAction(interval)` server action** (no `fetch` to an API route)
- `ManageSubscriptionCard.tsx` — client; plan label + renewal / cancel-at-period-end date; "Manage subscription" button submits to the **`createPortalSessionAction()` server action**

Both server actions live in `src/actions/billing.ts` and `redirect()` to Stripe (or back to `/settings?upgrade=...`) — there is **no `/api/stripe/checkout` or `/api/stripe/portal` route**, and no client-side `window.location.href` redirect.

### 6. `src/app/settings/page.tsx`

- Renders `<SubscriptionSection userId={userId} />` between `EditorPreferencesSection` and `ChangePasswordSection`
- Reads `?upgrade=success|cancelled|error|no_customer` and shows a `SuccessBanner` / `ErrorBanner` (reused `src/components/ui/banners.tsx`) — see `UPGRADE_MESSAGES` map

### 7. Upgrade result banner

The checkout server action sets `success_url` to `/settings?upgrade=success` and
`cancel_url` to `/settings?upgrade=cancelled`. The settings page renders a banner
from the `upgrade` param.

> Implemented as a **server-rendered banner**, not a client `toast.success` +
> `window.history.replaceState` cleanup. The param stays in the URL.

## New Files

| File | Purpose |
|------|---------|
| `src/app/api/stripe/webhook/route.ts` | Handle Stripe webhook events |
| `src/actions/billing.ts` | `createCheckoutSessionAction` / `createPortalSessionAction` server actions + `getOrCreateCustomer` helper |
| `src/components/settings/SubscriptionSection.tsx` | Server component dispatching Upgrade vs Manage |
| `src/components/settings/UpgradeCard.tsx` | Upgrade UI (checkout server action) |
| `src/components/settings/ManageSubscriptionCard.tsx` | Manage/portal UI |

## Modified Files

| File | Changes |
|------|---------|
| `src/actions/items.ts` | `canCreateItem` limit check + `isProType && !canUseProType` check in `createItemAction` |
| `src/actions/collections.ts` | `canCreateCollection` check in `createCollectionAction` |
| `src/app/api/upload/route.ts` | `canUseProType` check → 403 before upload |
| `src/app/settings/page.tsx` | Add `SubscriptionSection` + `?upgrade=…` banners |
| `src/lib/stripe.ts` | Lazy `Stripe` init via Proxy so the module loads without `STRIPE_SECRET_KEY` at build time |
| `src/components/dashboard/Sidebar.tsx`, `DashboardShell.tsx` | `isPro?` on `SidebarUser`; hide Files/Images PRO badge when Pro |
| `src/components/items/CreateItemDialog.tsx` | File/Image type buttons dimmed for free users; click routes to `/settings?upgrade=true` |

## Testing

### Stripe CLI Webhook Testing

```bash
# Terminal 1: dev server
npm run dev

# Terminal 2: forward webhooks (note the /api/stripe/webhook path)
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Terminal 3: trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
```

### Manual Testing Checklist

- [ ] **Checkout:** Upgrade from settings, complete with test card `4242 4242 4242 4242`, verify redirect to `/settings?upgrade=success` + success banner
- [ ] **Webhook — checkout.session.completed:** user gets `isPro: true`, `stripeCustomerId` + `stripeSubscriptionId` saved
- [ ] **Webhook — customer.subscription.updated:** `isPro` + `subscriptionStatus`/period/interval synced on renewal
- [ ] **Webhook — customer.subscription.deleted:** user set to `isPro: false`, `stripeSubscriptionId` cleared, status `canceled`
- [ ] **Webhook — invoice.payment_failed:** status becomes `past_due`, user stays Pro
- [ ] **Customer Portal:** Pro user clicks "Manage subscription", redirects to Stripe portal, returns to `/settings`
- [ ] **Gating — Items:** free user blocked at 50 items with the upgrade message
- [ ] **Gating — Collections:** free user blocked at 3 collections with the upgrade message
- [ ] **Gating — File/Image items:** free user cannot create file/image items (error message)
- [ ] **Gating — Upload:** free user gets 403 `File uploads require Pro.`
- [ ] **Pro / bypass:** Pro user (or `BYPASS_PRO_LIMITS=true`) has no limits on items, collections, or uploads
- [ ] **Session sync:** after a webhook updates `isPro`, page reload reflects the new status
- [ ] **Billing UI:** free user sees `UpgradeCard`; Pro user sees `ManageSubscriptionCard`

### Stripe Test Cards

| Card | Scenario |
|------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 3220` | 3D Secure required |

## Divergences from the original plan

The first draft of this spec did not match what was built. Corrected here:

| Topic | Original plan | As built |
|-------|---------------|----------|
| Webhook route | `src/app/api/webhooks/stripe/route.ts` | `src/app/api/stripe/webhook/route.ts` |
| Webhook handlers | Named `handleCheckoutCompleted`, `handleInvoicePaid`, … | Single inline `switch`, no named functions |
| `invoice.paid` | Handled via `handleInvoicePaid` | **Not handled**; renewals covered by `subscription.updated` |
| `subscription.created` | Not mentioned | Handled (shares the `updated` branch) |
| Limits module | `@/lib/usage` (`canCreateItem`, `canCreateCollection`) | `@/lib/limits` (`getUserLimits().canCreateItem` / `.canCreateCollection` / `.canUseProType`) |
| Upload gate | Raw `prisma.user.findUnique … isPro` | `getUserLimits().canUseProType` (respects `BYPASS_PRO_LIMITS`) |
| Checkout / portal | `/api/stripe/checkout` + `/api/stripe/portal` API routes, client `fetch` + `window.location.href` | `createCheckoutSessionAction` / `createPortalSessionAction` **server actions** that `redirect()` |
| Billing UI | Single `billing-settings.tsx` client component | `SubscriptionSection` (server) → `UpgradeCard` / `ManageSubscriptionCard` |
| Post-checkout | `/settings?upgraded=true` → `toast.success` + URL cleanup | `/settings?upgrade=success` → server-rendered `SuccessBanner` |
| Gating messages | "…require a Pro subscription", "…free tier limit of 50 items…" | "File and image items require Pro.", "Item limit reached. Upgrade to Pro for unlimited items." |

## Notes

- The webhook route receives the raw body via `req.text()` — no special Next.js config needed
- `updateMany` in the subscription handlers is idempotent for duplicate event delivery
- Payment failures only mark `past_due` — Stripe retries automatically; downgrade happens only on `subscription.deleted`
- `PricingSection.tsx` on the homepage is not modified in this phase
- Run `npm run build` to verify no type errors after all changes
