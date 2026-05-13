import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Star, ArrowLeft } from 'lucide-react';
import { auth } from '@/auth';
import { getFavoriteItems, getItemTypesWithCounts } from '@/lib/db/items';
import { getFavoriteCollections, getSidebarCollections, getUserCollections } from '@/lib/db/collections';
import { getSearchData } from '@/lib/db/search';
import { getEditorPreferences } from '@/lib/db/profile';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { FavoriteItemsList } from '@/components/favorites/FavoriteItemsList';
import { FavoriteCollectionsList } from '@/components/favorites/FavoriteCollectionsList';

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const userId = session.user.id;
  const [itemTypes, sidebarCollections, userCollections, searchData, editorPreferences, favoriteItems, favoriteCollections] =
    await Promise.all([
      getItemTypesWithCounts(userId),
      getSidebarCollections(userId),
      getUserCollections(userId),
      getSearchData(userId),
      getEditorPreferences(userId),
      getFavoriteItems(userId),
      getFavoriteCollections(userId),
    ]);

  const isEmpty = favoriteItems.length === 0 && favoriteCollections.length === 0;

  return (
    <DashboardShell
      itemTypes={itemTypes}
      sidebarCollections={sidebarCollections}
      userCollections={userCollections}
      searchData={searchData}
      user={session.user}
      editorPreferences={editorPreferences}
    >
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
            Favorites
          </h1>
        </div>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Star className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No favorites yet.</p>
            <p className="mt-1 text-xs text-muted-foreground/60">Star items and collections to see them here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {favoriteItems.length > 0 && (
              <FavoriteItemsList items={favoriteItems} />
            )}
            {favoriteCollections.length > 0 && (
              <FavoriteCollectionsList collections={favoriteCollections} />
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
