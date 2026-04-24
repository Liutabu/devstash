import Link from 'next/link';
import { MailOpen } from 'lucide-react';

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="space-y-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <MailOpen className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          We sent a verification link to{' '}
          {email ? (
            <span className="font-medium text-foreground">{email}</span>
          ) : (
            'your email address'
          )}
          . Click the link to activate your account.
        </p>
      </div>

      <p className="text-xs text-muted-foreground">
        Already verified?{' '}
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
