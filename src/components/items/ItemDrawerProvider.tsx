'use client';

import { createContext, useContext, useState } from 'react';
import { ItemDrawer, type ItemDetailResponse } from './ItemDrawer';

interface DrawerContextValue {
  open: (itemId: string) => void;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

export function useItemDrawer() {
  return useContext(DrawerContext);
}

export function ItemDrawerProvider({ children }: { children: React.ReactNode }) {
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
      />
    </DrawerContext.Provider>
  );
}
