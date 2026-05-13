'use client';

import { useState } from 'react';
import { FavoriteItemRow } from './FavoriteItemRow';
import type { ItemRowData } from '@/lib/db/items';

type ItemSortKey = 'name' | 'date' | 'type';
type SortDir = 'asc' | 'desc';

const SORT_OPTIONS: { key: ItemSortKey; label: string }[] = [
  { key: 'date', label: 'Date' },
  { key: 'name', label: 'Name' },
  { key: 'type', label: 'Type' },
];

function sortItems(items: ItemRowData[], key: ItemSortKey, dir: SortDir): ItemRowData[] {
  return [...items].sort((a, b) => {
    let cmp = 0;
    if (key === 'name') cmp = a.title.localeCompare(b.title);
    else if (key === 'date') cmp = a.createdAt.getTime() - b.createdAt.getTime();
    else if (key === 'type') cmp = a.itemType.name.localeCompare(b.itemType.name);
    return dir === 'asc' ? cmp : -cmp;
  });
}

export function FavoriteItemsList({ items }: { items: ItemRowData[] }) {
  const [sortKey, setSortKey] = useState<ItemSortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  function handleSort(key: ItemSortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'date' ? 'desc' : 'asc');
    }
  }

  const sorted = sortItems(items, sortKey, sortDir);

  return (
    <section>
      <div className="mb-2 flex items-center justify-between px-3">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Items ({items.length})
        </p>
        <div className="flex items-center gap-1">
          {SORT_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleSort(key)}
              className={`rounded px-2 py-0.5 font-mono text-xs transition-colors ${
                sortKey === key
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
              {sortKey === key && (
                <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-border overflow-hidden rounded-md border border-border">
        {sorted.map((item) => (
          <FavoriteItemRow key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
