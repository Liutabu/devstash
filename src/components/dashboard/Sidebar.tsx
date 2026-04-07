'use client';

import Link from 'next/link';
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
  Star,
  Settings,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { mockItemTypes, mockItemTypeCounts, mockCollections, mockUser } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
};

const favoriteCollections = mockCollections.filter((c) => c.isFavorite);
const recentCollections = mockCollections.filter((c) => !c.isFavorite);

interface SidebarProps {
  collapsed: boolean;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const [collectionsOpen, setCollectionsOpen] = useState(true);

  const initials = mockUser.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  return (
    <aside
      suppressHydrationWarning
      className={cn(
        'flex flex-col h-full border-r border-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-in-out overflow-hidden shrink-0',
        collapsed ? 'w-[52px]' : 'w-60',
      )}
    >
      {/* Scrollable nav */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-4">
        {/* Types */}
        <section>
          {!collapsed && (
            <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Types
            </p>
          )}
          <nav className="space-y-0.5 px-2">
            {mockItemTypes.map((type) => {
              const Icon = iconMap[type.icon];
              const count = mockItemTypeCounts[type.id] ?? 0;
              return (
                <Link
                  key={type.id}
                  href={`/items/${type.slug}`}
                  title={collapsed ? type.name : undefined}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors',
                    collapsed && 'justify-center',
                  )}
                >
                  <span className="shrink-0" style={{ color: type.color }}>
                    {Icon && <Icon className="h-4 w-4" />}
                  </span>
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{type.name}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
                    </>
                  )}
                </Link>
              );
            })}
          </nav>
        </section>

        {/* Collections — hidden when collapsed */}
        {!collapsed && (
          <section>
            <button
              onClick={() => setCollectionsOpen((o) => !o)}
              className="flex w-full items-center gap-1 px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="flex-1 text-left">Collections</span>
              <ChevronDown
                className={cn('h-3.5 w-3.5 transition-transform duration-200', !collectionsOpen && '-rotate-90')}
              />
            </button>

            {collectionsOpen && favoriteCollections.length > 0 && (
              <div className="mb-2" suppressHydrationWarning>
                <p className="px-3 py-0.5 text-xs text-muted-foreground">Favorites</p>
                <nav className="space-y-0.5 px-2">
                  {favoriteCollections.map((col) => (
                    <Link
                      key={col.id}
                      href={`/collections/${col.id}`}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                    >
                      <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
                      <span className="flex-1 truncate">{col.name}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {col.itemCount}
                      </span>
                    </Link>
                  ))}
                </nav>
              </div>
            )}

            {collectionsOpen && recentCollections.length > 0 && (
              <div>
                <p className="px-3 py-0.5 text-xs text-muted-foreground">All Collections</p>
                <nav className="space-y-0.5 px-2">
                  {recentCollections.map((col) => (
                    <Link
                      key={col.id}
                      href={`/collections/${col.id}`}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                    >
                      <span className="h-3.5 w-3.5 shrink-0" />
                      <span className="flex-1 truncate">{col.name}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {col.itemCount}
                      </span>
                    </Link>
                  ))}
                </nav>
              </div>
            )}
          </section>
        )}
      </div>

      {/* User area */}
      <div
        className={cn(
          'shrink-0 border-t border-border p-3',
          collapsed && 'flex justify-center',
        )}
      >
        {collapsed ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold">
            {initials}
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{mockUser.name}</p>
              <p className="truncate text-xs text-muted-foreground">{mockUser.email}</p>
            </div>
            <button
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
