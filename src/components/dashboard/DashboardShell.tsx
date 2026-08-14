'use client';

import { useState, useEffect } from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { DashboardContext } from './DashboardContext';
import { cn } from '@/lib/utils';
import type { ItemTypeWithCount } from '@/lib/db/items';
import type { SidebarCollectionData, UserCollectionOption } from '@/lib/db/collections';
import type { SearchData } from '@/lib/db/search';
import { ItemDrawerProvider } from '@/components/items/ItemDrawerProvider';
import { CreateItemDialog } from '@/components/items/CreateItemDialog';
import { CreateCollectionDialog } from '@/components/collections/CreateCollectionDialog';
import { CommandPalette } from '@/components/search/CommandPalette';
import { EditorPreferencesProvider } from '@/components/ui/EditorPreferencesContext';
import { DEFAULT_EDITOR_PREFERENCES, type EditorPreferences } from '@/lib/editor-preferences';

interface SidebarUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isPro?: boolean;
}

interface DashboardShellProps {
  children: React.ReactNode;
  itemTypes: ItemTypeWithCount[];
  sidebarCollections: SidebarCollectionData[];
  userCollections: UserCollectionOption[];
  searchData: SearchData;
  user: SidebarUser;
  editorPreferences?: EditorPreferences;
}

export function DashboardShell({ children, itemTypes, sidebarCollections, userCollections, searchData, user, editorPreferences }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createTypeId, setCreateTypeId] = useState<string | undefined>(undefined);
  const [collectionCreateOpen, setCollectionCreateOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  function openCreate(typeId?: string) {
    setCreateTypeId(typeId);
    setCreateOpen(true);
  }

  return (
    <EditorPreferencesProvider initialPreferences={editorPreferences ?? DEFAULT_EDITOR_PREFERENCES}>
    <DashboardContext value={{ openCreate }}>
    <div className="flex h-full flex-col" suppressHydrationWarning>
      <TopBar
        onToggleSidebar={() => setCollapsed((c) => !c)}
        onMobileMenuClick={() => setMobileOpen(true)}
        onNewItem={() => openCreate()}
        onNewCollection={() => setCollectionCreateOpen(true)}
        onSearchClick={() => setSearchOpen(true)}
        isPro={user.isPro}
      />
      <CreateCollectionDialog
        open={collectionCreateOpen}
        onClose={() => setCollectionCreateOpen(false)}
      />
      <CreateItemDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        itemTypes={itemTypes}
        userCollections={userCollections}
        initialTypeId={createTypeId}
        isPro={user.isPro}
      />

      <div className="relative flex flex-1 overflow-hidden" suppressHydrationWarning>
        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Desktop sidebar */}
        <div className="hidden md:flex" suppressHydrationWarning>
          <Sidebar collapsed={collapsed} itemTypes={itemTypes} collections={sidebarCollections} user={user} />
        </div>

        {/* Mobile drawer */}
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 md:hidden transition-transform duration-300 ease-in-out',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <Sidebar collapsed={false} itemTypes={itemTypes} collections={sidebarCollections} user={user} />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-background p-6">
          <ItemDrawerProvider userCollections={userCollections}>
            <CommandPalette
              open={searchOpen}
              onClose={() => setSearchOpen(false)}
              searchData={searchData}
            />
            {children}
          </ItemDrawerProvider>
        </main>
      </div>
    </div>
    </DashboardContext>
    </EditorPreferencesProvider>
  );
}
