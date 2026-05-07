'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layers } from 'lucide-react';
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { ITEM_TYPE_ICON_MAP } from '@/lib/item-type-icons';
import { useItemDrawer } from '@/components/items/ItemDrawerProvider';
import type { SearchData } from '@/lib/db/search';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  searchData: SearchData;
}

export function CommandPalette({ open, onClose, searchData }: CommandPaletteProps) {
  const router = useRouter();
  const drawer = useItemDrawer();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose(); // toggle: if already open this call is a no-op since parent handles it
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function selectItem(id: string) {
    onClose();
    drawer?.open(id);
  }

  function selectCollection(id: string) {
    onClose();
    router.push(`/collections/${id}`);
  }

  function filter(value: string, search: string) {
    return value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
  }

  return (
    <CommandDialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Command filter={filter}>
      <CommandInput placeholder="Search items and collections..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {searchData.items.length > 0 && (
          <CommandGroup heading="Items">
            {searchData.items.map((item) => {
              const Icon = ITEM_TYPE_ICON_MAP[item.itemType.icon];
              return (
                <CommandItem
                  key={item.id}
                  value={`${item.title} ${item.itemType.name}`}
                  onSelect={() => selectItem(item.id)}
                >
                  {Icon && (
                    <Icon
                      className="size-4 shrink-0"
                      style={{ color: item.itemType.color }}
                    />
                  )}
                  <span className="truncate">{item.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground shrink-0">
                    {item.itemType.name}
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {searchData.items.length > 0 && searchData.collections.length > 0 && (
          <CommandSeparator />
        )}

        {searchData.collections.length > 0 && (
          <CommandGroup heading="Collections">
            {searchData.collections.map((col) => (
              <CommandItem
                key={col.id}
                value={col.name}
                onSelect={() => selectCollection(col.id)}
              >
                <Layers className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{col.name}</span>
                <span className="ml-auto text-xs text-muted-foreground shrink-0">
                  {col.itemCount} {col.itemCount === 1 ? 'item' : 'items'}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
      </Command>
    </CommandDialog>
  );
}
