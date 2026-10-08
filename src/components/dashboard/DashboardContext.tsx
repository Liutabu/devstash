'use client';

import { createContext, useContext } from 'react';

interface DashboardContextValue {
  openCreate: (typeId?: string) => void;
  openCreateCollection: () => void;
}

export const DashboardContext = createContext<DashboardContextValue>({
  openCreate: () => {},
  openCreateCollection: () => {},
});

export function useDashboard() {
  return useContext(DashboardContext);
}
