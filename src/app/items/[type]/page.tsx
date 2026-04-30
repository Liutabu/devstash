import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { ItemCard } from '@/components/items/ItemCard';
import { getItemsByType, getItemTypesWithCounts } from '@/lib/db/items';
import { getSidebarCollections } from '@/lib/db/collections';

interface ItemsPageProps {
  params: Promise<{ type: string }>;
}

export default async function ItemsPage({ params }: ItemsPageProps) {
  const { type } = await params;

  const [session, itemTypes, sidebarCollections, result] = await Promise.all([
    auth(),
    getItemTypesWithCounts(),
    getSidebarCollections(),
    getItemsByType(type),
  ]);

  if (!result) notFound();

  const user = session?.user ?? { name: null, email: null, image: null };
  const { items, typeName, typeColor } = result;

  return (
    <DashboardShell itemTypes={itemTypes} sidebarCollections={sidebarCollections} user={user}>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-5 w-1 rounded-full" style={{ backgroundColor: typeColor }} />
          <h1 className="text-xl font-semibold">{typeName}s</h1>
          <span className="text-sm text-muted-foreground">{items.length} item{items.length !== 1 ? 's' : ''}</span>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No {typeName.toLowerCase()}s yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
