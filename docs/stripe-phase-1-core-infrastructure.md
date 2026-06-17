# Stripe Integration — Phase 1: Core Infrastructure

> **Branch:** `feature/stripe-phase-1-core`
> **Reference:** [stripe-integration-plan.md](./stripe-integration-plan.md)
> **Estimated effort:** ~1.5 hours

Lays the foundation for billing without touching any user-facing flow. After Phase 1 ships, the app behaves identically to today — but Stripe is wired in, `isPro` flows through the session, and the limits helper is in place ready to be called.

---

## Goals

1. Configure Stripe Dashboard (products, prices, customer portal, webhook secret — manual steps).
2. Install the Stripe SDK and create a singleton client.
3. Migrate the Prisma schema to store subscription state.
4. Extend the NextAuth session so `session.user.isPro` is available everywhere.
5. Build the `getUserLimits()` helper with the `BYPASS_PRO_LIMITS` dev override.
6. Cover the limits module with unit tests.

Phase 1 is gated on completion of Stripe Dashboard setup — without `STRIPE_PRICE_ID_MONTHLY/YEARLY` in `.env.local`, the limits helper still works but checkout cannot be tested until Phase 2.

---

## Out of Scope

- Checkout & portal server actions → Phase 2
- Webhook handler → Phase 2
- Any UI changes (Settings page, Sidebar, CreateItemDialog) → Phase 2
- Calling `getUserLimits()` from any write path → Phase 2

---

## Scope

### 1. Stripe Dashboard (manual, one-time)

Per [plan §3](./stripe-integration-plan.md#3-stripe-dashboard-setup):

- Create Product "DevStash Pro" in **Test mode**
- Create Monthly price ($8/mo) → `STRIPE_PRICE_ID_MONTHLY`
- Create Yearly price ($72/yr) → `STRIPE_PRICE_ID_YEARLY`
- Configure Customer Portal: cancellations at period end, plan switching enabled, prorate upgrades
- Copy API keys → `STRIPE_SECRET_KEY` + `STRIPE_PUBLISHABLE_KEY`
- Webhook signing secret deferred to Phase 2 (no endpoint yet)

### 2. Prisma migration

Add to `User` in [prisma/schema.prisma](../prisma/schema.prisma):

```prisma
subscriptionStatus      String?
subscriptionPeriodEnd   DateTime?
subscriptionCancelAtEnd Boolean   @default(false)
subscriptionInterval    String?
```

Run: `npx prisma migrate dev --name add_subscription_state`

### 3. Files to create

| File | Purpose |
|---|---|
| `src/lib/stripe.ts` | Stripe client singleton + `STRIPE_PRICE_IDS` map + `BillingInterval` type |
| `src/lib/limits.ts` | `FREE_LIMITS`, `getUserLimits(userId)`, `isProType()`, `BYPASS_PRO_LIMITS` handling |
| `src/lib/db/subscription.ts` | `getSubscriptionStatus(userId)` reader (used by Phase 2 Settings UI) |
| `src/lib/limits.test.ts` | Unit tests for the limits module |

See [plan §4.1](./stripe-integration-plan.md#41-srclibstripets-—-stripe-client-singleton), [§4.2](./stripe-integration-plan.md#42-srcliblimitsts-—-free-tier-constants--gating-helper), [§4.3](./stripe-integration-plan.md#43-srclibdbsubscriptionts-—-db-lookups-for-the-settings-ui) for exact code.

### 4. Files to modify

| File | Change |
|---|---|
| `src/types/next-auth.d.ts` | Add `isPro: boolean` to `Session.user` and `JWT.isPro` |
| `src/auth.ts` | Add `jwt` callback that always re-reads `isPro` from DB; update `session` callback to copy `token.isPro` |
| `.env.example` | Document `BYPASS_PRO_LIMITS` (default `"false"`) |
| `package.json` | `npm install stripe` |

See [plan §5.1](./stripe-integration-plan.md#51-prismaschemaprisma), [§5.2](./stripe-integration-plan.md#52-srctypesnext-authdts-—-expose-ispro-on-session), [§5.3](./stripe-integration-plan.md#53-srcauthts-—-add-jwt-callback-that-always-syncs-ispro), [§5.10](./stripe-integration-plan.md#510-envexample-—-document-bypass_pro_limits).

---

## Unit Tests (`src/lib/limits.test.ts`)

Per project convention ([context/ai-interaction.md](../context/ai-interaction.md)) — test the utility, not React components.

Mock Prisma per-test using the `vi.mock('@/lib/prisma')` pattern from [src/actions/items.test.ts](../src/actions/items.test.ts).

### `isProType()`

- [ ] Returns `true` for `"file"` / `"image"` / `"File"` / `"IMAGE"` (case-insensitive)
- [ ] Returns `false` for `"snippet"`, `"prompt"`, `"command"`, `"note"`, `"link"`
- [ ] Returns `false` for unknown strings

### `getUserLimits()` — Free user

- [ ] Boundary at items: `itemCount = 49` → `canCreateItem: true`
- [ ] Boundary at items: `itemCount = 50` → `canCreateItem: false`
- [ ] Boundary at items: `itemCount = 51` → `canCreateItem: false`
- [ ] Boundary at collections: `collectionCount = 2` → `canCreateCollection: true`
- [ ] Boundary at collections: `collectionCount = 3` → `canCreateCollection: false`
- [ ] `canUseProType: false` regardless of counts
- [ ] Missing user (`findUnique` → null) → `isPro: false`, normal limit checks apply

### `getUserLimits()` — Pro user

- [ ] `isPro: true`, `itemCount: 1000` → `canCreateItem: true`
- [ ] `isPro: true`, `collectionCount: 100` → `canCreateCollection: true`
- [ ] `isPro: true` → `canUseProType: true`

### `getUserLimits()` — `BYPASS_PRO_LIMITS` dev flag

- [ ] `BYPASS_PRO_LIMITS=true` + free user at 50 items → `canCreateItem: true`
- [ ] `BYPASS_PRO_LIMITS=true` + free user at 3 collections → `canCreateCollection: true`
- [ ] `BYPASS_PRO_LIMITS=true` + free user → `canUseProType: true`
- [ ] `BYPASS_PRO_LIMITS=false` enforces limits normally
- [ ] `BYPASS_PRO_LIMITS` unset enforces limits normally
- [ ] `isPro` returned to caller is the **real** DB value (not affected by bypass) — UI uses the real flag for badge display

### Edge cases

- [ ] All three Prisma queries (`user.findUnique`, `item.count`, `collection.count`) run in parallel via `Promise.all` (assert via mock call order or spy on `Promise.all`)

---

## Manual Verification

Without any UI yet, the only end-to-end check is via direct DB flip:

1. `npm run dev` and sign in as `demo@devstash.io`
2. In Neon SQL editor (dev branch): `UPDATE users SET "isPro" = true WHERE email = 'demo@devstash.io';`
3. Sign out, sign back in. Add a `console.log(session.user.isPro)` in any server component temporarily — should log `true`.
4. Flip back to `false`, sign out/in, re-verify.
5. Set `BYPASS_PRO_LIMITS=true` in `.env.local`, restart dev server, call `getUserLimits(demoUserId)` from a temporary debug route — assert `canCreateItem: true` even with many items.
6. Remove the debug logs / route before commit.

---

## Acceptance Checklist

- [ ] `npx prisma migrate status` shows clean state, migration committed
- [ ] `npm run build` passes
- [ ] `npm run test:run` passes (existing tests + new limits tests)
- [ ] `npm run lint` passes
- [ ] `session.user.isPro` typed and available in any server component
- [ ] `BYPASS_PRO_LIMITS` documented in `.env.example`
- [ ] No `getUserLimits()` calls anywhere in `src/actions/*` yet (Phase 2)
- [ ] No new UI components (Phase 2)

---

## Commit & Merge

Per [context/ai-interaction.md](../context/ai-interaction.md):

1. Document this feature in `context/current-feature.md` before starting
2. Branch: `feature/stripe-phase-1-core`
3. Single commit (or two: migration + everything else) — no "Claude" mention
4. Ask before committing; build must pass
5. Merge to `main`, delete branch
6. Mark complete in `context/current-feature.md` history; reset to "Not Started" for Phase 2
