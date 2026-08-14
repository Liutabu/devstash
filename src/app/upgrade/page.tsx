import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/auth';
import { getEditorPreferences } from '@/lib/db/profile';
import { getSidebarCollections, getUserCollections } from '@/lib/db/collections';
import { getItemTypesWithCounts } from '@/lib/db/items';
import { getSearchData } from '@/lib/db/search';
import { getSubscriptionStatus } from '@/lib/db/subscription';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { UpgradePlans } from '@/components/upgrade/UpgradePlans';

export default async function UpgradePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const userId = session.user.id;
  const [itemTypes, sidebarCollections, userCollections, searchData, editorPreferences, subscription] =
    await Promise.all([
      getItemTypesWithCounts(userId),
      getSidebarCollections(userId),
      getUserCollections(userId),
      getSearchData(userId),
      getEditorPreferences(userId),
      getSubscriptionStatus(userId),
    ]);

  // Already Pro — nothing to upgrade; manage the plan in Settings instead.
  if (subscription.isPro) redirect('/settings');

  return (
    <DashboardShell
      itemTypes={itemTypes}
      sidebarCollections={sidebarCollections}
      userCollections={userCollections}
      searchData={searchData}
      user={session.user}
      editorPreferences={editorPreferences}
    >
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <UpgradePlans />
      </div>
    </DashboardShell>
  );
}
