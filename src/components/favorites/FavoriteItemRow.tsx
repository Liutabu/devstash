'use client';

import { useItemDrawer } from '@/components/items/ItemDrawerProvider';
import { ITEM_TYPE_ICON_MAP } from '@/lib/item-type-icons';
import type { ItemRowData } from '@/lib/db/items';

export function FavoriteItemRow({ item }: { item: ItemRowData }) {
  const drawer = useItemDrawer();
  const Icon = ITEM_TYPE_ICON_MAP[item.itemType.icon] ?? ITEM_TYPE_ICON_MAP['Code'];

  return (
    <button
      type="button"
      onClick={() => drawer?.open(item.id)}
      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted/50 transition-colors"
    >
      <Icon className="h-4 w-4 shrink-0" style={{ color: item.itemType.color }} />
      <span className="flex-1 truncate text-sm font-mono">{item.title}</span>
      <span
        className="shrink-0 text-xs px-1.5 py-0.5 rounded font-mono"
        style={{ backgroundColor: `${item.itemType.color}20`, color: item.itemType.color }}
      >
        {item.itemType.name.toLowerCase()}
      </span>
      <span className="shrink-0 text-xs text-muted-foreground font-mono tabular-nums">
        {item.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </span>
    </button>
  );
}
