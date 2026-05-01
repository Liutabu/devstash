'use client';

import { Plus } from 'lucide-react';
import { useDashboard } from '@/components/dashboard/DashboardContext';

interface NewItemButtonProps {
  typeId: string;
  label: string;
  color: string;
}

export function NewItemButton({ typeId, label, color }: NewItemButtonProps) {
  const { openCreate } = useDashboard();

  return (
    <button
      type="button"
      onClick={() => openCreate(typeId)}
      className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:opacity-90"
      style={{ backgroundColor: `${color}20`, color }}
    >
      <Plus className="h-4 w-4" />
      New {label}
    </button>
  );
}
