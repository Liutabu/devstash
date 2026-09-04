'use client';

import { createContext, useContext, useState } from 'react';
import { ItemDrawer, type ItemDetailResponse } from './ItemDrawer';
import type { UserCollectionOption } from '@/lib/db/collections';

interface DrawerContextValue {
  open: (itemId: string) => void;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

export function useItemDrawer() {
  return useContext(DrawerContext);
}

interface ItemDrawerProviderProps {
  children: React.ReactNode;
  userCollections: UserCollectionOption[];
  isPro?: boolean;
}

export function ItemDrawerProvider({ children, userCollections, isPro }: ItemDrawerProviderProps) {
  const [itemId, setItemId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ItemDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function open(id: string) {
    setItemId(id);
    setDetail(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/items/${id}`);
      if (res.ok) {
        setDetail(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }

  function close() {
    setItemId(null);
    setDetail(null);
  }

  return (
    <DrawerContext.Provider value={{ open }}>
      {children}
      <ItemDrawer
        isOpen={itemId !== null}
        onClose={close}
        detail={detail}
        loading={loading}
        onUpdate={setDetail}
        onDelete={close}
        userCollections={userCollections}
        isPro={isPro}
      />
    </DrawerContext.Provider>
  );
}
