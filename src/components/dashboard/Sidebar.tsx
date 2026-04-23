'use client';

import Link from 'next/link';
import { Star, ChevronDown, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { badgeVariants } from '@/components/ui/badge';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { ITEM_TYPE_ICON_MAP } from '@/lib/item-type-icons';
import { signOutAction } from '@/actions/auth';
import type { ItemTypeWithCount } from '@/lib/db/items';
import type { SidebarCollectionData } from '@/lib/db/collections';

interface SidebarUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface SidebarProps {
  collapsed: boolean;
  itemTypes: ItemTypeWithCount[];
  collections: SidebarCollectionData[];
  user: SidebarUser;
}

export function Sidebar({ collapsed, itemTypes, collections, user }: SidebarProps) {
  const [collectionsOpen, setCollectionsOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const favoriteCollections = collections.filter((c) => c.isFavorite);
  const recentCollections = collections.filter((c) => !c.isFavorite);

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
            {itemTypes.map((type) => {
              const Icon = ITEM_TYPE_ICON_MAP[type.icon];
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
                      {(type.slug === 'files' || type.slug === 'images') && (
                        <span className={cn(badgeVariants({ variant: 'secondary' }), 'px-1.5 text-[10px] font-semibold tracking-wide')}>
                          PRO
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground tabular-nums">{type.count}</span>
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
                      <span className="text-xs text-muted-foreground tabular-nums">{col.itemCount}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            )}

            {collectionsOpen && recentCollections.length > 0 && (
              <div>
                <p className="px-3 py-0.5 text-xs text-muted-foreground">Recent</p>
                <nav className="space-y-0.5 px-2">
                  {recentCollections.map((col) => (
                    <Link
                      key={col.id}
                      href={`/collections/${col.id}`}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                    >
                      <span
                        className="h-3.5 w-3.5 shrink-0 rounded-full"
                        style={{ backgroundColor: col.dominantColor }}
                      />
                      <span className="flex-1 truncate">{col.name}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">{col.itemCount}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            )}

            {collectionsOpen && (
              <div className="px-2 pt-1">
                <Link
                  href="/collections"
                  className="block rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
                >
                  View all collections
                </Link>
              </div>
            )}
          </section>
        )}
      </div>

      {/* User area */}
      <div className={cn('relative shrink-0 border-t border-border p-3', collapsed && 'flex justify-center')}>
        {/* Dropdown menu */}
        {userMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setUserMenuOpen(false)}
            />
            <div className={cn(
              'absolute bottom-full mb-1 z-20 min-w-[160px] rounded-md border border-border bg-popover py-1 shadow-md',
              collapsed ? 'left-1' : 'left-3',
            )}>
              <Link
                href="/profile"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
              <div className="my-1 h-px bg-border" />
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </form>
            </div>
          </>
        )}

        {collapsed ? (
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="User menu"
          >
            <UserAvatar name={user.name} image={user.image} />
          </button>
        ) : (
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            className="flex w-full items-center gap-2.5 rounded-md hover:bg-sidebar-accent px-1 py-1 transition-colors text-left"
          >
            <UserAvatar name={user.name} image={user.image} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name ?? 'User'}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
            <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150', userMenuOpen && 'rotate-180')} />
          </button>
        )}
      </div>
    </aside>
  );
}
