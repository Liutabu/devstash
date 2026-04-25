import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/auth';
import { getProfileData } from '@/lib/db/profile';
import { ITEM_TYPE_ICON_MAP } from '@/lib/item-type-icons';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DeleteAccountButton } from '@/components/profile/DeleteAccountButton';
import { changePasswordAction } from '@/actions/profile';

const PASSWORD_ERRORS: Record<string, string> = {
  required: 'All fields are required.',
  mismatch: 'Passwords do not match.',
  short: 'New password must be at least 8 characters.',
  wrong_password: 'Current password is incorrect.',
  no_password: 'No password is set on this account.',
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const [profile, params] = await Promise.all([
    getProfileData(session.user.id),
    searchParams,
  ]);

  if (!profile) redirect('/sign-in');

  const errorMsg = params.error ? (PASSWORD_ERRORS[params.error] ?? 'Something went wrong.') : null;
  const passwordChanged = params.success === 'password';

  const joinDate = profile.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>

        {/* User info */}
        <section className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-4">
            <UserAvatar name={profile.name} image={profile.image} className="h-16 w-16 text-xl" />
            <div>
              <p className="text-lg font-medium">{profile.name ?? 'No name'}</p>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Member since {joinDate}</p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Usage</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-md bg-muted/40 px-4 py-3">
              <p className="text-2xl font-bold">{profile.totalItems}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total items</p>
            </div>
            <div className="rounded-md bg-muted/40 px-4 py-3">
              <p className="text-2xl font-bold">{profile.totalCollections}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total collections</p>
            </div>
          </div>

          {/* Item type breakdown */}
          <div className="space-y-1.5">
            {profile.itemTypeCounts.map((t) => {
              const Icon = ITEM_TYPE_ICON_MAP[t.icon];
              return (
                <div key={t.name} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4" style={{ color: t.color }} />}
                    <span className="text-sm">{t.name}</span>
                  </div>
                  <span className="text-sm font-medium tabular-nums">{t.count}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Change password — email users only */}
        {profile.hasPassword && (
          <section className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Change Password</h2>

            {passwordChanged && (
              <div className="rounded-md border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                Password updated successfully.
              </div>
            )}

            {errorMsg && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {errorMsg}
              </div>
            )}

            <form action={changePasswordAction} className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="currentPassword" className="text-sm font-medium">Current password</label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="newPassword" className="text-sm font-medium">New password</label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="••••••••"
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
              <Button type="submit">Update password</Button>
            </form>
          </section>
        )}

        {/* Danger zone */}
        <section className="rounded-lg border border-destructive/30 bg-card p-6 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-destructive/80">Danger Zone</h2>
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data.
          </p>
          <DeleteAccountButton />
        </section>
      </div>
    </div>
  );
}
