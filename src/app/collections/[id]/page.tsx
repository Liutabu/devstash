import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { ItemCard } from '@/components/items/ItemCard';
import { ImageThumbnailCard } from '@/components/items/ImageThumbnailCard';
import { FileListRow } from '@/components/items/FileListRow';
import { CollectionDetailActions } from '@/components/collections/CollectionDetailActions';
import { getItemTypesWithCounts, getItemsByCollectionId } from '@/lib/db/items';
import { getSidebarCollections, getUserCollections, getCollectionById } from '@/lib/db/collections';

interface CollectionPageProps {
  params: Promise<{ id: string }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const userId = session.user.id;
  const [itemTypes, sidebarCollections, userCollections, collection, items] = await Promise.all([
    getItemTypesWithCounts(userId),
    getSidebarCollections(userId),
    getUserCollections(userId),
    getCollectionById(id, userId),
    getItemsByCollectionId(id, userId),
  ]);

  if (!collection) notFound();

  const imageItems = items.filter((i) => i.itemType.name.toLowerCase() === 'image');
  const fileItems = items.filter((i) => i.itemType.name.toLowerCase() === 'file');
  const otherItems = items.filter(
    (i) => i.itemType.name.toLowerCase() !== 'image' && i.itemType.name.toLowerCase() !== 'file',
  );
  const multiSection = [imageItems, fileItems, otherItems].filter((g) => g.length > 0).length > 1;

  return (
    <DashboardShell
      itemTypes={itemTypes}
      sidebarCollections={sidebarCollections}
      userCollections={userCollections}
      user={session.user}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="h-5 w-1 rounded-full mt-1 shrink-0" style={{ backgroundColor: collection.dominantColor }} />
            <div className="min-w-0">
              <h1 className="text-xl font-semibold">{collection.name}</h1>
              {collection.description && (
                <p className="text-sm text-muted-foreground mt-0.5">{collection.description}</p>
              )}
              <span className="text-sm text-muted-foreground">
                {items.length} item{items.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <CollectionDetailActions collection={collection} />
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items in this collection yet.</p>
        ) : (
          <div className="space-y-8">
            {imageItems.length > 0 && (
              <section>
                {multiSection && <h2 className="text-sm font-semibold mb-3">Images</h2>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {imageItems.map((item) => (
                    <ImageThumbnailCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {fileItems.length > 0 && (
              <section>
                {multiSection && <h2 className="text-sm font-semibold mb-3">Files</h2>}
                <div className="flex flex-col gap-2">
                  {fileItems.map((item) => (
                    <FileListRow key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {otherItems.length > 0 && (
              <section>
                {multiSection && <h2 className="text-sm font-semibold mb-3">Items</h2>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {otherItems.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
