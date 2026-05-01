'use client';

import { useState } from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { DashboardContext } from './DashboardContext';
import { cn } from '@/lib/utils';
import type { ItemTypeWithCount } from '@/lib/db/items';
import type { SidebarCollectionData } from '@/lib/db/collections';
import { ItemDrawerProvider } from '@/components/items/ItemDrawerProvider';
import { CreateItemDialog } from '@/components/items/CreateItemDialog';

interface SidebarUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface DashboardShellProps {
  children: React.ReactNode;
  itemTypes: ItemTypeWithCount[];
  sidebarCollections: SidebarCollectionData[];
  user: SidebarUser;
}

export function DashboardShell({ children, itemTypes, sidebarCollections, user }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createTypeId, setCreateTypeId] = useState<string | undefined>(undefined);

  function openCreate(typeId?: string) {
    setCreateTypeId(typeId);
    setCreateOpen(true);
  }

  return (
    <DashboardContext value={{ openCreate }}>
    <div className="flex h-full flex-col" suppressHydrationWarning>
      <TopBar
        onToggleSidebar={() => setCollapsed((c) => !c)}
        onMobileMenuClick={() => setMobileOpen(true)}
        onNewItem={() => openCreate()}
      />
      <CreateItemDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        itemTypes={itemTypes}
        initialTypeId={createTypeId}
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
          <ItemDrawerProvider>{children}</ItemDrawerProvider>
        </main>
      </div>
    </div>
    </DashboardContext>
  );
}
