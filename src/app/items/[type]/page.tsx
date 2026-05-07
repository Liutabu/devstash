import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { ItemCard } from '@/components/items/ItemCard';
import { ImageThumbnailCard } from '@/components/items/ImageThumbnailCard';
import { FileListRow } from '@/components/items/FileListRow';
import { NewItemButton } from '@/components/items/NewItemButton';
import { getItemsByType, getItemTypesWithCounts } from '@/lib/db/items';
import { getSidebarCollections, getUserCollections } from '@/lib/db/collections';
import { getSearchData } from '@/lib/db/search';

interface ItemsPageProps {
  params: Promise<{ type: string }>;
}

export default async function ItemsPage({ params }: ItemsPageProps) {
  const { type } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const userId = session.user.id;
  const [itemTypes, sidebarCollections, userCollections, searchData, result] = await Promise.all([
    getItemTypesWithCounts(userId),
    getSidebarCollections(userId),
    getUserCollections(userId),
    getSearchData(userId),
    getItemsByType(type, userId),
  ]);

  if (!result) notFound();

  const user = session.user;
  const { items, typeName, typeColor, typeId } = result;

  return (
    <DashboardShell itemTypes={itemTypes} sidebarCollections={sidebarCollections} userCollections={userCollections} searchData={searchData} user={user}>
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
        ) : type === 'images' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item) => (
              <ImageThumbnailCard key={item.id} item={item} />
            ))}
          </div>
        ) : type === 'files' ? (
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <FileListRow key={item.id} item={item} />
            ))}
          </div>
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
