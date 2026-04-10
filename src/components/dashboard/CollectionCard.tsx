import { Star, MoreHorizontal } from 'lucide-react';
import { ITEM_TYPE_ICON_MAP } from '@/lib/item-type-icons';

interface Collection {
  id: string;
  name: string;
  description: string;
  isFavorite: boolean;
  itemCount: number;
  dominantColor: string;
  icons: readonly string[];
}

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <div
      className="group relative rounded-lg border border-border bg-card p-4 flex flex-col gap-3 hover:border-border/80 transition-colors cursor-pointer"
      style={{ borderTopColor: collection.dominantColor, borderTopWidth: 2 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm font-medium truncate">{collection.name}</span>
            {collection.isFavorite && (
              <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">{collection.description}</p>
        </div>
        <button className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {collection.icons.slice(0, 3).map((iconName) => {
            const Icon = ITEM_TYPE_ICON_MAP[iconName];
            return Icon ? (
              <div key={iconName} className="rounded bg-muted p-1">
                <Icon className="h-3 w-3 text-muted-foreground" />
              </div>
            ) : null;
          })}
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {collection.itemCount} items
        </span>
      </div>
    </div>
  );
}
