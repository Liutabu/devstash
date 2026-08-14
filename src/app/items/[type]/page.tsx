import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { ItemCard } from '@/components/items/ItemCard';
import { ImageThumbnailCard } from '@/components/items/ImageThumbnailCard';
import { FileListRow } from '@/components/items/FileListRow';
import { NewItemButton } from '@/components/items/NewItemButton';
import { ProTypeUpgrade } from '@/components/items/ProTypeUpgrade';
import { Pagination } from '@/components/ui/Pagination';
import { getItemsByType, getItemTypesWithCounts } from '@/lib/db/items';
import { getSidebarCollections, getUserCollections } from '@/lib/db/collections';
import { getSearchData } from '@/lib/db/search';
import { getEditorPreferences } from '@/lib/db/profile';
import { getUserLimits, isProType } from '@/lib/limits';
import { ITEMS_PER_PAGE } from '@/lib/constants';

interface ItemsPageProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function ItemsPage({ params, searchParams }: ItemsPageProps) {
  const { type } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);

  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const userId = session.user.id;
  const [itemTypes, sidebarCollections, userCollections, searchData, editorPreferences, limits, result] = await Promise.all([
    getItemTypesWithCounts(userId),
    getSidebarCollections(userId),
    getUserCollections(userId),
    getSearchData(userId),
    getEditorPreferences(userId),
    getUserLimits(userId),
    getItemsByType(type, userId, page),
  ]);

  if (!result) notFound();

  const user = session.user;
  const { items, total, typeName, typeColor, typeId } = result;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // Gate Pro-only item types (file/image) for free users behind an upgrade prompt.
  if (isProType(typeName) && !limits.canUseProType) {
    return (
      <DashboardShell itemTypes={itemTypes} sidebarCollections={sidebarCollections} userCollections={userCollections} searchData={searchData} user={user} editorPreferences={editorPreferences}>
        <ProTypeUpgrade type={type} typeName={typeName} typeColor={typeColor} />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell itemTypes={itemTypes} sidebarCollections={sidebarCollections} userCollections={userCollections} searchData={searchData} user={user} editorPreferences={editorPreferences}>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-5 w-1 rounded-full" style={{ backgroundColor: typeColor }} />
          <h1 className="text-xl font-semibold">{typeName}s</h1>
          <span className="text-sm text-muted-foreground">{total} item{total !== 1 ? 's' : ''}</span>
          <div className="ml-auto">
            <NewItemButton typeId={typeId} label={typeName} color={typeColor} />
          </div>
        </div>

        {total === 0 ? (
          <p className="text-sm text-muted-foreground">No {typeName.toLowerCase()}s yet.</p>
        ) : type === 'images' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((item) => (
                <ImageThumbnailCard key={item.id} item={item} />
              ))}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} basePath={`/items/${type}`} />
          </>
        ) : type === 'files' ? (
          <>
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <FileListRow key={item.id} item={item} />
              ))}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} basePath={`/items/${type}`} />
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} basePath={`/items/${type}`} />
          </>
        )}
      </div>
    </DashboardShell>
  );
}
