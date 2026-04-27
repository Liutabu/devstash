import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resetPasswordAction } from '@/actions/auth';
import { prisma } from '@/lib/prisma';

const ERROR_MESSAGES: Record<string, string> = {
  required: 'All fields are required.',
  mismatch: 'Passwords do not match.',
  short: 'Password must be at least 8 characters.',
  rate_limited: 'Too many attempts. Please wait before trying again.',
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const params = await searchParams;
  const token = params.token?.trim();

  if (!token) {
    redirect('/forgot-password?error=invalid_token');
  }

  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (!record || !record.identifier.startsWith('reset:')) {
    redirect('/forgot-password?error=invalid_token');
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    redirect('/forgot-password?error=token_expired');
  }

  const errorMsg = params.error ? (ERROR_MESSAGES[params.error] ?? 'Something went wrong.') : null;

  return (
    <div className="space-y-6">
      {/* Logo */}
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg font-bold">
          S
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Set a new password</h1>
        <p className="text-sm text-muted-foreground">Choose a strong password for your account.</p>
      </div>

      {errorMsg && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMsg}
        </div>
      )}

      <form action={resetPasswordAction} className="space-y-3">
        <input type="hidden" name="token" value={token} />
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">New password</label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Min. 8 characters"
            required
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm new password</label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" className="w-full">Reset password</Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/sign-in"
          className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
