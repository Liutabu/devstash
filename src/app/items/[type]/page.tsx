import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { ItemCard } from '@/components/items/ItemCard';
import { NewItemButton } from '@/components/items/NewItemButton';
import { getItemsByType, getItemTypesWithCounts } from '@/lib/db/items';
import { getSidebarCollections } from '@/lib/db/collections';

interface ItemsPageProps {
  params: Promise<{ type: string }>;
}

export default async function ItemsPage({ params }: ItemsPageProps) {
  const { type } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const userId = session.user.id;
  const [itemTypes, sidebarCollections, result] = await Promise.all([
    getItemTypesWithCounts(userId),
    getSidebarCollections(userId),
    getItemsByType(type, userId),
  ]);

  if (!result) notFound();

  const user = session.user;
  const { items, typeName, typeColor, typeId } = result;

  return (
    <DashboardShell itemTypes={itemTypes} sidebarCollections={sidebarCollections} user={user}>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-5 w-1 rounded-full" style={{ backgroundColor: typeColor }} />
          <h1 className="text-xl font-semibold">{typeName}s</h1>
          <span className="text-sm text-muted-foreground">{items.length} item{items.length !== 1 ? 's' : ''}</span>
          <div className="ml-auto">
            <NewItemButton typeId={typeId} label={typeName} color={typeColor} />
          </div>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No {typeName.toLowerCase()}s yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
