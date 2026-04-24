import Link from 'next/link';
import { GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signInWithCredentials, signInWithGitHub } from '@/actions/auth';

const ERROR_MESSAGES: Record<string, string> = {
  invalid: 'Invalid email or password.',
  unverified: 'Please verify your email before signing in. Check your inbox for the verification link.',
  invalid_token: 'Verification link is invalid. Please register again or request a new link.',
  token_expired: 'Verification link has expired. Please register again or request a new link.',
  OAuthAccountNotLinked: 'This email is already linked to a different sign-in method.',
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; registered?: string; verified?: string; reset?: string }>;
}) {
  const params = await searchParams;
  const errorMsg = params.error ? (ERROR_MESSAGES[params.error] ?? 'Something went wrong.') : null;
  const registered = params.registered === '1';
  const verified = params.verified === '1';
  const reset = params.reset === '1';

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

      {/* Registered success */}
      {registered && (
        <div className="rounded-md border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          Account created — check your email to verify before signing in.
        </div>
      )}

      {/* Email verified success */}
      {verified && (
        <div className="rounded-md border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          Email verified — you can now sign in.
        </div>
      )}

      {/* Password reset success */}
      {reset && (
        <div className="rounded-md border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          Password reset — sign in with your new password.
        </div>
      )}

      {/* Error */}
      {errorMsg && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMsg}
        </div>
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
          <GitBranch className="h-4 w-4" />
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
