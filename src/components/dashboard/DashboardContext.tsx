'use client';

import { createContext, useContext } from 'react';

interface DashboardContextValue {
  openCreate: (typeId?: string) => void;
}

export const DashboardContext = createContext<DashboardContextValue>({
  openCreate: () => {},
});

export function useDashboard() {
  return useContext(DashboardContext);
}
