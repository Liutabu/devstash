import Link from 'next/link';
import { mockCollections, mockItems } from '@/lib/mock-data';
import { StatsCards } from './StatsCards';
import { CollectionCard } from './CollectionCard';
import { ItemRow } from './ItemRow';

const recentCollections = mockCollections.slice(0, 6);
const pinnedItems = mockItems.filter((i) => i.isPinned);
const recentItems = mockItems.slice(0, 10);

export function DashboardMain() {
  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your developer knowledge hub</p>
      </div>

      {/* Stats */}
      <StatsCards />

      {/* Collections */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Collections</h2>
          <Link href="/collections" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recentCollections.map((col) => (
            <CollectionCard key={col.id} collection={col} />
          ))}
        </div>
      </section>

      {/* Pinned Items */}
      {pinnedItems.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
            📌 Pinned
          </h2>
          <div className="space-y-2">
            {pinnedItems.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Items */}
      <section>
        <h2 className="text-sm font-semibold mb-3">Recent Items</h2>
        <div className="space-y-2">
          {recentItems.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
