# Stripe Integration — Phase 2: Integration & UI

> **Branch:** `feature/stripe-phase-2-integration`
> **Reference:** [stripe-integration-plan.md](./stripe-integration-plan.md)
> **Prerequisite:** Phase 1 merged ([stripe-phase-1-core-infrastructure.md](./stripe-phase-1-core-infrastructure.md))
> **Estimated effort:** ~4.5 hours

Builds on the Phase 1 foundation to make billing actually work end-to-end: server actions create Stripe Checkout & Customer Portal sessions, the webhook handler syncs subscription state back into Postgres, write paths enforce free-tier limits, and the Settings page exposes the upgrade / manage UI.

This is the phase that **requires the Stripe CLI** for local webhook forwarding — the manual verification is the bulk of the work.

---

## Goals

1. Server actions for Stripe Checkout and Customer Portal redirects.
2. Webhook handler for the 5 subscription lifecycle events.
3. Enforce free-tier limits on the three write paths (items, collections, uploads).
4. Settings page Subscription section: upgrade card (free) or manage card (pro).
5. UI polish: hide PRO badges for Pro users, gate file/image in CreateItemDialog.
6. Unit tests for billing server actions.
7. Full QA walk against the testing checklist.

---

## Prerequisites

- Phase 1 merged: `getUserLimits()`, `session.user.isPro`, `stripe` client, schema migration all in place
- Stripe CLI installed locally: <https://docs.stripe.com/stripe-cli>
- Webhook endpoint registered in Stripe Dashboard (Test mode) → `STRIPE_WEBHOOK_SECRET` in `.env.local`
- Test card numbers ready: `4242 4242 4242 4242` (success), `4000 0000 0000 0341` (payment failure)

---

## Scope

### 1. Files to create

| File | Purpose |
|---|---|
| `src/actions/billing.ts` | `createCheckoutSessionAction(interval)`, `createPortalSessionAction()`, `getOrCreateCustomer()` helper |
| `src/app/api/stripe/webhook/route.ts` | POST handler verifying signature + switching on 5 event types |
| `src/components/settings/SubscriptionSection.tsx` | Server component dispatching to Upgrade vs Manage card |
| `src/components/settings/UpgradeCard.tsx` | Client component with Monthly/Yearly toggle, submits to checkout action |
| `src/components/settings/ManageSubscriptionCard.tsx` | Shows plan + renewal date, "Manage subscription" button → portal action |
| `src/actions/billing.test.ts` | Unit tests for checkout & portal actions |

See [plan §4.4](./stripe-integration-plan.md#44-srcactionsbillingts-—-server-actions-for-checkout--portal), [§4.5](./stripe-integration-plan.md#45-srcappapistripewebhookrouts-—-webhook-handler), [§4.6–4.8](./stripe-integration-plan.md#46-srccomponentssettingssubscriptionsectiontsx-—-ui-block) for code.

### 2. Files to modify — feature gating

| File | Change | Plan ref |
|---|---|---|
| `src/actions/items.ts` | After auth check in `createItemAction`: call `getUserLimits`, return error if `!canCreateItem`; after type lookup, check `isProType && !canUseProType` | [§5.4](./stripe-integration-plan.md#54-srcactionsitemsts-—-gate-createitemaction) |
| `src/actions/collections.ts` | After auth check in `createCollectionAction`: call `getUserLimits`, return error if `!canCreateCollection` | [§5.5](./stripe-integration-plan.md#55-srcactionscollectionsts-—-gate-createcollectionaction) |
| `src/app/api/upload/route.ts` | After auth check: call `getUserLimits`, return 403 if `!canUseProType` | [§5.6](./stripe-integration-plan.md#56-srcappapiuploadrouts-—-gate-file-uploads) |

### 3. Files to modify — Settings UI

| File | Change | Plan ref |
|---|---|---|
| `src/app/settings/page.tsx` | Add `getSubscriptionStatus` to parallel fetch; render `<SubscriptionSection>` between Editor Preferences and Change Password; handle `?upgrade=success/cancelled/error/no_customer` via `SuccessBanner` / `ErrorBanner` | [§5.7](./stripe-integration-plan.md#57-srcappsettingspagetsx-—-add-subscription-section) |

### 4. Files to modify — Other UI gating

| File | Change | Plan ref |
|---|---|---|
| `src/components/dashboard/Sidebar.tsx` | Extend `SidebarUser` with `isPro?: boolean`; hide PRO badge on files/images entries for Pro users | [§5.8](./stripe-integration-plan.md#58-srccomponentsdashboardsidebartsx-—-hide-pro-badge-for-pro-users) |
| `src/components/items/CreateItemDialog.tsx` | Include file/image in type picker; render disabled + Pro hint for free users with onClick → `router.push('/settings?upgrade=true')` | [§5.9](./stripe-integration-plan.md#59-srccomponentsitemscreateitemdialogtsx-—-gate-fileimage-options) |

The 6 pages using `DashboardShell` already pass `session.user` — `session.user.isPro` flows through automatically thanks to Phase 1.

### 5. Optional polish

- `src/lib/rate-limit.ts` — add `checkoutSession: makeLimiter('checkout', 10, '1 m')`, wire into `createCheckoutSessionAction` ([§5.12](./stripe-integration-plan.md#512-srclibrate-limitts-—-add-checkoutsession-limiter-optional))
- Marketing pricing card ([src/app/(marketing)/_components/PricingSection.tsx](../src/app/(marketing)/_components/PricingSection.tsx)) — signed-in users straight to checkout, signed-out to `/register?upgrade=pro`

---

## Out of Scope

- AI features (not built yet — gated naturally by not existing)
- Export feature (not built yet)
- Custom types (not built yet)
- Email notifications on subscription changes (Stripe sends its own receipts)
- Proration UI / preview of upgrade cost
- Annual → monthly downgrade UX (handled by Customer Portal natively)

---

## Unit Tests (`src/actions/billing.test.ts`)

Per project convention — server actions get tested, components do not. No webhook handler test ([context/ai-interaction.md](../context/ai-interaction.md)).

Mock `auth()` from `@/auth`, `prisma` from `@/lib/prisma`, and the `stripe` instance from `@/lib/stripe`. Use the existing pattern from [src/actions/items.test.ts](../src/actions/items.test.ts).

### `createCheckoutSessionAction(interval)`

- [ ] Unauthenticated → `redirect('/sign-in')`
- [ ] Session without email → `redirect('/sign-in')`
- [ ] Existing `stripeCustomerId` → reuses it, no `stripe.customers.create` call
- [ ] No `stripeCustomerId` → calls `stripe.customers.create` with `{ email, name, metadata: { userId } }`, persists returned id to `User.stripeCustomerId`
- [ ] Calls `stripe.checkout.sessions.create` with correct `price` from `STRIPE_PRICE_IDS[interval]`, `mode: 'subscription'`, `customer: customerId`, both top-level `metadata.userId` and `subscription_data.metadata.userId`
- [ ] `interval: 'monthly'` selects monthly price id
- [ ] `interval: 'yearly'` selects yearly price id
- [ ] `allow_promotion_codes: true` is set
- [ ] Successful session → `redirect(checkout.url)`
- [ ] Stripe returns no `url` → `redirect('/settings?upgrade=error')`

### `createPortalSessionAction()`

- [ ] Unauthenticated → `redirect('/sign-in')`
- [ ] User has no `stripeCustomerId` → `redirect('/settings?upgrade=no_customer')`
- [ ] Calls `stripe.billingPortal.sessions.create` with `customer: stripeCustomerId` + correct `return_url`
- [ ] On success → `redirect(portal.url)`

---

## Manual Verification (Stripe CLI required)

### Setup (once per machine)

```bash
stripe login
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
# Copy printed whsec_... → STRIPE_WEBHOOK_SECRET in .env.local
npm run dev
```

### Happy path — Free → Pro

- [ ] Sign in as a free user (or fresh account). Settings → Subscription shows "Upgrade to Pro" card with Monthly/Yearly toggle
- [ ] Click **Upgrade — Monthly** → Stripe Checkout page loads with $8/mo selected
- [ ] Pay with `4242 4242 4242 4242` (any future expiry, any CVC, any ZIP)
- [ ] Redirected to `/settings?upgrade=success` → success banner visible
- [ ] CLI shows `customer.subscription.created` event forwarded → 200
- [ ] Refresh page → "Pro — renews on DATE" card visible
- [ ] Sidebar PRO badges on Files/Images entries disappear
- [ ] Open CreateItemDialog → File/Image types selectable (not disabled)
- [ ] Drag/drop a small image → upload succeeds (`/api/upload` returns 200)
- [ ] Create an item with type File → succeeds
- [ ] DB check: `User.isPro = true`, `subscriptionPeriodEnd` populated ~1 month out, `subscriptionInterval = 'month'`

### Plan switch — Monthly → Yearly

- [ ] Click "Manage subscription" → Stripe-hosted portal opens
- [ ] Switch plan to Yearly
- [ ] Return to Settings
- [ ] CLI shows `customer.subscription.updated` → 200
- [ ] DB check: `subscriptionInterval = 'year'`, `subscriptionPeriodEnd` ~1 year out

### Cancellation — at period end

- [ ] In portal, click "Cancel subscription"
- [ ] CLI shows `customer.subscription.updated` with `cancel_at_period_end: true` → 200
- [ ] DB check: `subscriptionCancelAtEnd = true`, `isPro` still `true`
- [ ] Settings page shows "Pro until DATE — reactivate via portal"
- [ ] Reactivate via portal → `cancelAtEnd` back to `false`

### Full deletion (use Stripe trigger)

```bash
stripe trigger customer.subscription.deleted
```

- [ ] CLI shows event forwarded → 200
- [ ] DB check: `isPro = false`, `subscriptionStatus = 'canceled'`, `stripeSubscriptionId = null`
- [ ] Settings page reverts to Upgrade card
- [ ] Sidebar PRO badges reappear

### Payment failure

- [ ] Use card `4000 0000 0000 0341` (auth succeeds, charge fails on next renewal)
- [ ] Or trigger directly: `stripe trigger invoice.payment_failed`
- [ ] CLI shows event → 200
- [ ] DB check: `subscriptionStatus = 'past_due'`; `isPro` still `true` (grace period — Stripe will eventually delete the sub if payment never succeeds)

### Webhook security

- [ ] `curl -X POST -d '{}' http://localhost:3000/api/stripe/webhook` → 400 (missing/invalid signature)
- [ ] Unknown event type → returns 200 (Stripe retries non-2xx; safe ack required)

### Free-tier limit enforcement

With `BYPASS_PRO_LIMITS=false` and a free account:

- [ ] Create 50 items via the API/UI → 51st create returns `{ success: false, error: 'Item limit reached...' }`; toast shows
- [ ] Create 3 collections → 4th returns error toast
- [ ] POST to `/api/upload` returns 403 with `error: 'File uploads require Pro.'`
- [ ] In CreateItemDialog, File/Image options appear disabled with "Pro" hint; click → routes to `/settings?upgrade=true`

### `BYPASS_PRO_LIMITS=true`

- [ ] Restart dev server with flag set; free user can create >50 items, >3 collections, upload files

### Auth / session sync

- [ ] Two-tab test: tab A upgrades, tab B refreshes → tab B's session reflects Pro state (proves JWT callback resyncs from DB every request)
- [ ] Sign out + sign back in → `isPro` matches DB

---

## Acceptance Checklist

- [ ] `npm run build` passes
- [ ] `npm run test:run` passes (existing tests + Phase 1 limits + new billing tests)
- [ ] `npm run lint` passes
- [ ] Full happy-path walk above completes without manual SQL fixups
- [ ] All 5 webhook event types handled with verified DB state changes
- [ ] No `getUserLimits()` calls bypassed (every write path enforces)
- [ ] No regressions in existing flows (run through dashboard, items, collections, settings as a normal user with bypass off)
- [ ] `STRIPE_*` secrets only in `.env.local`, never committed
- [ ] Webhook route does **not** appear in `PROTECTED_PREFIXES` ([src/proxy.ts](../src/proxy.ts)) — Stripe must reach it unauthenticated

---

## Commit & Merge

Per [context/ai-interaction.md](../context/ai-interaction.md):

1. Update `context/current-feature.md` with goals + notes at start
2. Branch: `feature/stripe-phase-2-integration`
3. Suggested commit slicing (each builds independently):
   - `feat(billing): add Stripe checkout & portal server actions`
   - `feat(billing): add Stripe webhook handler`
   - `feat(billing): enforce free-tier limits on write paths`
   - `feat(settings): add subscription section`
   - `feat(ui): hide Pro badges & gate item types for Pro users`
4. Ask before committing; do not include "Claude" in any commit message
5. Merge to `main`, delete branch
6. Mark complete in `context/current-feature.md` history
