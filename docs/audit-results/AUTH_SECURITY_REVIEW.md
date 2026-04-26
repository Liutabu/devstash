# Auth Security Review

**Last audited:** 2026-04-26
**Auditor:** auth-auditor agent
**Scope:** `src/auth.ts`, `src/auth.config.ts`, `src/actions/auth.ts`, `src/actions/profile.ts`, `src/app/api/auth/register/route.ts`, `src/app/(auth)/verify-email/page.tsx`, `src/app/(auth)/reset-password/page.tsx`, `src/app/(auth)/forgot-password/page.tsx`, `src/app/profile/page.tsx`, `src/lib/email.ts`, `src/lib/db/profile.ts`, `src/proxy.ts`, `prisma/schema.prisma`

---

## Critical

_None found._

---

## High

### No Rate Limiting on Auth Endpoints

- **Files:** `src/actions/auth.ts` (all exports), `src/app/api/auth/register/route.ts`
- **Problem:** The sign-in, registration, and forgot-password flows have no rate limiting. The sign-in path (`signInWithCredentials` → NextAuth `authorize`) runs a bcrypt compare on every attempt with no throttling. While bcrypt is expensive per attempt, an attacker can still run a dictionary attack — especially targeting accounts with common passwords — without any friction. The forgot-password endpoint has no limit either, allowing an attacker to flood a victim's inbox by repeatedly submitting their email.
- **Evidence:**
  ```ts
  // src/actions/auth.ts — no rate check before signIn()
  export async function signInWithCredentials(formData: FormData) {
    await signIn('credentials', { ... });
  }

  // src/actions/auth.ts — no rate check before sending reset email
  export async function forgotPasswordAction(formData: FormData) {
    if (user) { await sendPasswordResetEmail(email, token); }
    redirect('/forgot-password?sent=1');
  }
  ```
- **Fix:** Add rate limiting at the middleware or route level. The recommended approach for Next.js is [`@upstash/ratelimit`](https://github.com/upstash/ratelimit) with Upstash Redis (or any Redis-compatible store), keyed on IP address:
  ```ts
  import { Ratelimit } from '@upstash/ratelimit';
  import { Redis } from '@upstash/redis';

  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '15 m'),
  });

  // In forgotPasswordAction / signInWithCredentials:
  const ip = headers().get('x-forwarded-for') ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);
  if (!success) redirect('/sign-in?error=rate_limited');
  ```
  Apply: 5 attempts per 15 min for sign-in; 3 per hour for forgot-password; 10 per hour for registration.

---

## Medium

### Email Not Normalized in API Register Route

- **File:** `src/app/api/auth/register/route.ts` (line 9)
- **Problem:** The API route uses the `email` value from the request body directly without `.trim().toLowerCase()`. The server action `registerAction` in `src/actions/auth.ts` (line 35) does normalize. This inconsistency means a user could register via the API with `User@Example.COM` and end up unable to sign in by typing `user@example.com` (PostgreSQL string comparison is case-sensitive, so the `findUnique({ where: { email } })` in `authorize` would fail to find the record). It also means two accounts can exist for what is semantically the same email address.
- **Evidence:**
  ```ts
  // src/app/api/auth/register/route.ts (line 9) — no normalization
  const { name, email, password, confirmPassword } = body as { ... };

  // src/actions/auth.ts (line 35) — correctly normalized
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  ```
- **Fix:**
  ```ts
  // src/app/api/auth/register/route.ts
  const email = (body.email as string)?.trim().toLowerCase();
  ```

### bcryptjs Silently Truncates Passwords at 72 Bytes

- **Files:** `src/actions/auth.ts` (line 54), `src/app/api/auth/register/route.ts` (line 45), `src/actions/profile.ts` (line 40)
- **Problem:** `bcryptjs` silently truncates inputs to 72 bytes before hashing. Any two passwords that share the same first 72 bytes are treated as identical. A user who sets a 100-character password believing it to be highly secure can authenticate with only the first 72 characters. There is no maximum length validation or user-facing warning anywhere in the code.
- **Evidence:**
  ```ts
  // src/actions/auth.ts (line 45-54) — only min-length checked
  if (password.length < 8) { redirect('/register?error=short'); }
  const hashed = await bcrypt.hash(password, 12);
  ```
- **Fix:** Add a maximum length check before hashing:
  ```ts
  if (password.length > 72) {
    redirect('/register?error=too_long'); // add 'too_long' to error map
  }
  ```
  Apply the same check in `resetPasswordAction` and `changePasswordAction`. Add the error message `'Password must be 72 characters or fewer.'` to all error maps.

---

## Low

### Reset Token Echoed Back in Redirect URL on Validation Errors

- **File:** `src/actions/auth.ts` (lines 108, 110, 114)
- **Problem:** When the reset password form fails basic validation (missing fields, password mismatch, too short), the server action redirects back to `/reset-password?token=<token>&error=...`. The token is already in the browser history from the original email link, so this adds no new exposure path. However, the token is now appended to error-state URLs too, which slightly extends its presence in access logs and referrer headers.
- **Evidence:**
  ```ts
  redirect(`/reset-password?token=${token}&error=required`);
  redirect(`/reset-password?token=${token}&error=mismatch`);
  redirect(`/reset-password?token=${token}&error=short`);
  ```
- **Fix:** Handle validation errors in the page's `searchParams` using only an `error` key, keeping the token in the hidden form field. The token is re-submitted on the next attempt so no round-trip to the DB is needed:
  ```ts
  // Pass only the error; the page already has the token in the URL from the original link
  redirect(`/reset-password?token=${token}&error=mismatch`);
  // (current behavior is already reasonably safe — low priority)
  ```

### `verify-email` Page Does Not Reject Reset Tokens

- **File:** `src/app/(auth)/verify-email/page.tsx` (lines 15–34)
- **Problem:** The verify-email page looks up the token without checking that `record.identifier` does NOT start with `reset:`. A reset token passed to `/verify-email?token=...` would attempt `prisma.user.update({ where: { email: 'reset:user@example.com' } })`, which fails (no user has that email). Because the update and delete are wrapped in a `$transaction`, the rollback means the reset token is preserved. There is no practical exploit here, but adding the identifier check makes the code's intent explicit and prevents silent failures.
- **Evidence:**
  ```ts
  // src/app/(auth)/verify-email/page.tsx (line 15) — no identifier prefix check
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record) { redirect('/sign-in?error=invalid_token'); }
  // Missing: if (record.identifier.startsWith('reset:')) { redirect(...) }
  ```
- **Fix:**
  ```ts
  if (!record || record.identifier.startsWith('reset:')) {
    redirect('/sign-in?error=invalid_token');
  }
  ```

---

## Passed Checks

- **Password hashing rounds:** `bcrypt.hash(password, 12)` in all three hashing sites — exceeds the ≥10 round minimum (`src/actions/auth.ts:54`, `src/app/api/auth/register/route.ts:45`, `src/actions/profile.ts:40`).
- **Token generation:** `randomBytes(32).toString('hex')` used for both email verification and password reset tokens — 256-bit entropy, cryptographically secure (`src/actions/auth.ts:61, 87`).
- **Token expiry enforced server-side:** Expiry checked against `new Date()` before any action is taken in `verify-email/page.tsx:23`, `reset-password/page.tsx:32`, and `resetPasswordAction` in `auth.ts:122`.
- **Tokens are single-use:** Email verification token deleted atomically with the user update via `$transaction` (`verify-email/page.tsx:28–34`). Reset token deleted after password update (`auth.ts:131`).
- **Reset token prefix validated:** `record.identifier.startsWith('reset:')` checked before redeeming in both `resetPasswordAction` (`auth.ts:119`) and `reset-password/page.tsx:28`.
- **User enumeration prevented in forgot-password:** `forgotPasswordAction` always redirects to `?sent=1` regardless of whether the email exists (`auth.ts:99`).
- **Session validation in all protected actions:** Both `changePasswordAction` and `deleteAccountAction` call `auth()` and gate on `session?.user?.id` (`src/actions/profile.ts:9, 50`).
- **User ID sourced from session:** All DB writes use `session.user.id` (server-side), never a client-supplied value (`src/actions/profile.ts:41, 53`).
- **Password excluded from API and profile responses:** API route uses `select: { id, name, email }` (`route.ts:47–49`). `getProfileData` exposes `hasPassword: boolean`, never the hash (`src/lib/db/profile.ts:52`).
- **Stale reset tokens cleaned before issuing new ones:** `deleteMany({ where: { identifier: 'reset:${email}' } })` before creating a new token (`auth.ts:85`).
- **Cascade deletes wired up:** `User` → `Item`, `Collection`, `Account`, `Session` all `onDelete: Cascade` in `prisma/schema.prisma` — deleting an account removes all associated data.
- **Email verification flow atomic:** `$transaction` ensures user's `emailVerified` and token deletion are committed together, preventing partial state.
- **GitHub OAuth handled by NextAuth:** CSRF (state param), cookie security (HttpOnly/Secure/SameSite), and session rotation are all managed by NextAuth v5 — not flagged.

---

## Summary

- **Critical:** 0
- **High:** 1 (no rate limiting)
- **Medium:** 2 (email normalization inconsistency, bcrypt 72-byte truncation)
- **Low:** 2 (token in redirect URLs, missing reset-token filter on verify-email)

The auth implementation is well-structured: tokens are cryptographically strong, expiry and single-use are correctly enforced, and session ownership is properly verified in all server actions. The primary gap before production hardening is rate limiting on the sign-in and forgot-password endpoints.
