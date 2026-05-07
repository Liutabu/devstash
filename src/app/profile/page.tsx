import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { getProfileData, getEditorPreferences } from '@/lib/db/profile';
import { getSidebarCollections, getUserCollections } from '@/lib/db/collections';
import { getItemTypesWithCounts } from '@/lib/db/items';
import { getSearchData } from '@/lib/db/search';
import { ITEM_TYPE_ICON_MAP } from '@/lib/item-type-icons';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const userId = session.user.id;
  const [itemTypes, sidebarCollections, userCollections, searchData, editorPreferences, profile] = await Promise.all([
    getItemTypesWithCounts(userId),
    getSidebarCollections(userId),
    getUserCollections(userId),
    getSearchData(userId),
    getEditorPreferences(userId),
    getProfileData(userId),
  ]);

  if (!profile) redirect('/sign-in');

  const joinDate = profile.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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

        {/* Account settings */}
        <div className="text-sm text-muted-foreground">
          Manage your password and account in{' '}
          <Link href="/settings" className="text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors">
            Settings
          </Link>
          .
        </div>
      </div>
    </DashboardShell>
  );
}
