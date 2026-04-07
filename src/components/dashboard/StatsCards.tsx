import { mockItems, mockCollections } from '@/lib/mock-data';
import { LayoutGrid, Star, Layers } from 'lucide-react';

const totalItems = mockItems.length;
const totalCollections = mockCollections.length;
const favoriteItems = mockItems.filter((i) => i.isFavorite).length;
const favoriteCollections = mockCollections.filter((c) => c.isFavorite).length;

const stats = [
  { label: 'Items', value: totalItems, icon: LayoutGrid, color: 'text-blue-400' },
  { label: 'Collections', value: totalCollections, icon: Layers, color: 'text-purple-400' },
  { label: 'Favorite Items', value: favoriteItems, icon: Star, color: 'text-yellow-400' },
  { label: 'Favorite Collections', value: favoriteCollections, icon: Star, color: 'text-yellow-400' },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-card p-4 flex items-center gap-3"
          >
            <div className="shrink-0 rounded-md bg-muted p-2">
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
              <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
