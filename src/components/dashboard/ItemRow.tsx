'use client';

import { Star, Pin } from 'lucide-react';
import { ITEM_TYPE_ICON_MAP } from '@/lib/item-type-icons';
import { useItemDrawer } from '@/components/items/ItemDrawerProvider';

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

interface ItemRowProps {
  item: Item;
}

export function ItemRow({ item }: ItemRowProps) {
  const drawer = useItemDrawer();
  const Icon = ITEM_TYPE_ICON_MAP[item.itemType.icon];
  const date = item.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div
      onClick={() => drawer?.open(item.id)}
      className="group flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:border-border/80 transition-colors cursor-pointer"
      style={{ borderLeftColor: item.itemType.color, borderLeftWidth: 3 }}
    >
      {/* Icon */}
      <div className="shrink-0 rounded-md bg-muted p-1.5">
        {Icon && <Icon className="h-3.5 w-3.5" style={{ color: item.itemType.color }} />}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-sm font-medium truncate">{item.title}</span>
          {item.isPinned && <Pin className="h-3 w-3 shrink-0 text-muted-foreground" />}
          {item.isFavorite && <Star className="h-3 w-3 shrink-0 fill-yellow-400 text-yellow-400" />}
        </div>
        <div className="flex items-center gap-2">
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
      </div>

      {/* Date */}
      <span className="shrink-0 text-xs text-muted-foreground">{date}</span>
    </div>
  );
}
