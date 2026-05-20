import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signInWithCredentials, signInWithGitHub, resendVerificationAction } from '@/actions/auth';
import { SuccessBanner, ErrorBanner } from '@/components/ui/banners';

const ERROR_MESSAGES: Record<string, string> = {
  invalid: 'Invalid email or password.',
  unverified: 'Please verify your email before signing in.',
  resend_rate_limited: 'Too many resend attempts. Please wait before trying again.',
  rate_limited: 'Too many sign-in attempts. Please wait a few minutes before trying again.',
  invalid_token: 'Verification link is invalid. Please register again or request a new link.',
  token_expired: 'Verification link has expired. Please register again or request a new link.',
  OAuthAccountNotLinked: 'This email is already linked to a different sign-in method.',
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; email?: string; registered?: string; verified?: string; reset?: string; resent?: string }>;
}) {
  const params = await searchParams;
  const errorMsg = params.error ? (ERROR_MESSAGES[params.error] ?? 'Something went wrong.') : null;
  const unverifiedEmail = params.error === 'unverified' || params.error === 'resend_rate_limited' ? (params.email ?? '') : '';
  const registered = params.registered === '1';
  const verified = params.verified === '1';
  const reset = params.reset === '1';
  const resent = params.resent === '1';

  return (
    <div className="space-y-6">
      {/* Logo */}
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg font-bold">
          S
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Sign in to DevStash</h1>
        <p className="text-sm text-muted-foreground">Enter your credentials to continue</p>
      </div>

      {registered && <SuccessBanner message="Account created — check your email to verify before signing in." />}
      {verified && <SuccessBanner message="Email verified — you can now sign in." />}
      {reset && <SuccessBanner message="Password reset — sign in with your new password." />}
      {resent && <SuccessBanner message="Verification email resent — check your inbox." />}
      {errorMsg && <ErrorBanner message={errorMsg} />}

      {/* Resend verification form */}
      {(params.error === 'unverified' || params.error === 'resend_rate_limited') && (
        <form action={resendVerificationAction} className="space-y-2">
          {unverifiedEmail ? (
            <>
              <input type="hidden" name="email" value={unverifiedEmail} />
              <Button type="submit" variant="outline" size="sm" className="w-full text-xs">
                Resend verification email to {unverifiedEmail}
              </Button>
            </>
          ) : (
            <div className="space-y-1.5">
              <Input name="email" type="email" placeholder="Enter your email to resend" required autoComplete="email" className="text-sm" />
              <Button type="submit" variant="outline" size="sm" className="w-full text-xs">
                Resend verification email
              </Button>
            </div>
          )}
        </form>
      )}

      {/* Credentials form */}
      <form action={signInWithCredentials} className="space-y-3">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <Link href="/forgot-password" className="text-xs text-muted-foreground underline underline-offset-4 hover:text-primary transition-colors">
              Forgot password?
            </Link>
          </div>
          <Input id="password" name="password" type="password" placeholder="••••••••" required autoComplete="current-password" />
        </div>
        <Button type="submit" className="w-full">Sign in</Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>

      {/* GitHub */}
      <form action={signInWithGitHub}>
        <Button type="submit" variant="outline" className="w-full gap-2">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          Sign in with GitHub
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
          Register
        </Link>
      </p>
    </div>
  );
}
