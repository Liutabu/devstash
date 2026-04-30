'use client';

import { Star, Pin } from 'lucide-react';
import { ITEM_TYPE_ICON_MAP } from '@/lib/item-type-icons';
import { useItemDrawer } from './ItemDrawerProvider';

interface ItemType {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface Item {
  id: string;
  title: string;
  description?: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  tags: readonly string[];
  itemType: ItemType;
  createdAt: Date;
}

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  const drawer = useItemDrawer();
  const Icon = ITEM_TYPE_ICON_MAP[item.itemType.icon];
  const date = item.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div
      onClick={() => drawer?.open(item.id)}
      className="group flex flex-col gap-3 rounded-lg border border-border bg-card px-4 py-4 hover:border-border/80 transition-colors cursor-pointer"
      style={{ borderLeftColor: item.itemType.color, borderLeftWidth: 3 }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="shrink-0 rounded-md bg-muted p-1.5">
            {Icon && <Icon className="h-3.5 w-3.5" style={{ color: item.itemType.color }} />}
          </div>
          <span className="text-sm font-medium truncate">{item.title}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {item.isPinned && <Pin className="h-3.5 w-3.5 text-muted-foreground" />}
          {item.isFavorite && <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />}
        </div>
      </div>

      {item.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
      )}

      <div className="flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="text-xs font-medium px-1.5 py-0.5 rounded"
            style={{ backgroundColor: `${item.itemType.color}20`, color: item.itemType.color }}
          >
            {item.itemType.name}
          </span>
          {item.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">{date}</span>
      </div>
    </div>
  );
}
