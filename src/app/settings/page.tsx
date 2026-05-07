import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/auth';
import { getProfileData, getEditorPreferences } from '@/lib/db/profile';
import { getSidebarCollections, getUserCollections } from '@/lib/db/collections';
import { getItemTypesWithCounts } from '@/lib/db/items';
import { getSearchData } from '@/lib/db/search';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { ChangePasswordSection } from '@/components/profile/ChangePasswordSection';
import { DeleteAccountButton } from '@/components/profile/DeleteAccountButton';
import { EditorPreferencesSection } from '@/components/settings/EditorPreferencesSection';

const PASSWORD_ERRORS: Record<string, string> = {
  required: 'All fields are required.',
  mismatch: 'Passwords do not match.',
  short: 'New password must be at least 8 characters.',
  wrong_password: 'Current password is incorrect.',
  no_password: 'No password is set on this account.',
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const userId = session.user.id;
  const [itemTypes, sidebarCollections, userCollections, searchData, editorPreferences, profile, params] = await Promise.all([
    getItemTypesWithCounts(userId),
    getSidebarCollections(userId),
    getUserCollections(userId),
    getSearchData(userId),
    getEditorPreferences(userId),
    getProfileData(userId),
    searchParams,
  ]);

  if (!profile) redirect('/sign-in');

  const errorMsg = params.error ? (PASSWORD_ERRORS[params.error] ?? 'Something went wrong.') : null;
  const passwordChanged = params.success === 'password';

  return (
    <DashboardShell
      itemTypes={itemTypes}
      sidebarCollections={sidebarCollections}
      userCollections={userCollections}
      searchData={searchData}
      user={session.user}
      editorPreferences={editorPreferences}
    >
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        </div>

        {/* Editor preferences */}
        <EditorPreferencesSection />

        {/* Change password — email users only */}
        {profile.hasPassword && (
          <ChangePasswordSection errorMsg={errorMsg} passwordChanged={passwordChanged} />
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
    </DashboardShell>
  );
}
