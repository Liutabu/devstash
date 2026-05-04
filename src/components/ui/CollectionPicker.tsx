'use client';

import { FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollectionPickerProps {
  collections: { id: string; name: string }[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function CollectionPicker({ collections, selectedIds, onChange }: CollectionPickerProps) {
  function toggle(id: string) {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((s) => s !== id)
        : [...selectedIds, id],
    );
  }

  if (collections.length === 0) {
    return <p className="text-xs text-muted-foreground">No collections yet.</p>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {collections.map((col) => {
        const isSelected = selectedIds.includes(col.id);
        return (
          <button
            key={col.id}
            type="button"
            onClick={() => toggle(col.id)}
            className={cn(
              'flex items-center gap-1 text-xs px-2 py-0.5 rounded transition-colors',
              isSelected
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'bg-muted text-muted-foreground hover:text-foreground',
            )}
          >
            <FolderOpen className="h-3 w-3 shrink-0" />
            {col.name}
          </button>
        );
      })}
    </div>
  );
}
