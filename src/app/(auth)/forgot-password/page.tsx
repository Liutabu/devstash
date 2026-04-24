import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { forgotPasswordAction } from '@/actions/auth';

const ERROR_MESSAGES: Record<string, string> = {
  required: 'Please enter your email address.',
  invalid_token: 'Reset link is invalid. Please request a new one.',
  token_expired: 'Reset link has expired. Please request a new one.',
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const params = await searchParams;
  const errorMsg = params.error ? (ERROR_MESSAGES[params.error] ?? 'Something went wrong.') : null;
  const sent = params.sent === '1';

  return (
    <div className="space-y-6">
      {/* Logo */}
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg font-bold">
          S
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Forgot your password?</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {sent ? (
        <div className="rounded-md border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          If that email exists, a password reset link has been sent. Check your inbox.
        </div>
      ) : (
        <>
          {errorMsg && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorMsg}
            </div>
          )}

          <form action={forgotPasswordAction} className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <Button type="submit" className="w-full">Send reset link</Button>
          </form>
        </>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link
          href="/sign-in"
          className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
