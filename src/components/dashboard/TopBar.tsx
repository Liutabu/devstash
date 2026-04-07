'use client';

import { Search, Plus, PanelLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TopBarProps {
  onToggleSidebar?: () => void;
  onMobileMenuClick?: () => void;
}

export function TopBar({ onToggleSidebar, onMobileMenuClick }: TopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      {/* Logo */}
      <div className="flex items-center gap-2 font-semibold text-foreground shrink-0">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
          S
        </div>
        <span className="text-base">DevStash</span>
      </div>

      {/* Desktop sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:flex h-8 w-8 text-muted-foreground hover:text-foreground"
        onClick={onToggleSidebar}
      >
        <PanelLeft className="h-4 w-4" />
      </Button>

      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden h-8 w-8 text-muted-foreground hover:text-foreground"
        onClick={onMobileMenuClick}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          className="pl-9 bg-muted/50 border-border text-sm"
        />
      </div>

      {/* Actions */}
      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="sm" className="hidden sm:flex">
          New Collection
        </Button>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Item</span>
        </Button>
      </div>
    </header>
  );
}
