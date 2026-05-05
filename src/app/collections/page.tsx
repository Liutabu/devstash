import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { CollectionCard } from '@/components/dashboard/CollectionCard';
import { getAllCollections, getSidebarCollections, getUserCollections } from '@/lib/db/collections';
import { getItemTypesWithCounts } from '@/lib/db/items';

export default async function CollectionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const userId = session.user.id;
  const [itemTypes, sidebarCollections, userCollections, collections] = await Promise.all([
    getItemTypesWithCounts(userId),
    getSidebarCollections(userId),
    getUserCollections(userId),
    getAllCollections(userId),
  ]);

  return (
    <DashboardShell
      itemTypes={itemTypes}
      sidebarCollections={sidebarCollections}
      userCollections={userCollections}
      user={session.user}
    >
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">Collections</h1>
          <span className="text-sm text-muted-foreground">
            {collections.length} collection{collections.length !== 1 ? 's' : ''}
          </span>
        </div>

        {collections.length === 0 ? (
          <p className="text-sm text-muted-foreground">No collections yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {collections.map((col) => (
              <CollectionCard key={col.id} collection={col} />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
