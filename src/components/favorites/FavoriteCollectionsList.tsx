'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { FavoriteCollectionData } from '@/lib/db/collections';

type CollectionSortKey = 'name' | 'date' | 'count';
type SortDir = 'asc' | 'desc';

const SORT_OPTIONS: { key: CollectionSortKey; label: string }[] = [
  { key: 'date', label: 'Date' },
  { key: 'name', label: 'Name' },
  { key: 'count', label: 'Items' },
];

function sortCollections(
  collections: FavoriteCollectionData[],
  key: CollectionSortKey,
  dir: SortDir,
): FavoriteCollectionData[] {
  return [...collections].sort((a, b) => {
    let cmp = 0;
    if (key === 'name') cmp = a.name.localeCompare(b.name);
    else if (key === 'date') cmp = a.updatedAt.getTime() - b.updatedAt.getTime();
    else if (key === 'count') cmp = a.itemCount - b.itemCount;
    return dir === 'asc' ? cmp : -cmp;
  });
}

export function FavoriteCollectionsList({ collections }: { collections: FavoriteCollectionData[] }) {
  const [sortKey, setSortKey] = useState<CollectionSortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  function handleSort(key: CollectionSortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'date' || key === 'count' ? 'desc' : 'asc');
    }
  }

  const sorted = sortCollections(collections, sortKey, sortDir);

  return (
    <section>
      <div className="mb-2 flex items-center justify-between px-3">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Collections ({collections.length})
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
        {sorted.map((col) => (
          <Link
            key={col.id}
            href={`/collections/${col.id}`}
            className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 transition-colors"
          >
            <div
              className="h-4 w-4 shrink-0 rounded-full"
              style={{ backgroundColor: col.dominantColor }}
            />
            <span className="flex-1 truncate font-mono text-sm">{col.name}</span>
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
              {col.itemCount} {col.itemCount === 1 ? 'item' : 'items'}
            </span>
            <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
              {col.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
