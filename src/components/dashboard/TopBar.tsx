import { Search, Plus, PanelLeft, Menu, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  onToggleSidebar?: () => void;
  onMobileMenuClick?: () => void;
  onNewItem?: () => void;
  onNewCollection?: () => void;
  onSearchClick?: () => void;
}

export function TopBar({ onToggleSidebar, onMobileMenuClick, onNewItem, onNewCollection, onSearchClick }: TopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-foreground shrink-0 hover:opacity-80 transition-opacity">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
          S
        </div>
        <span className="hidden min-[410px]:inline text-base">DevStash</span>
      </Link>

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

      {/* Search — full pill at 410px+, icon-only below */}
      <button
        type="button"
        onClick={onSearchClick}
        className="relative flex-1 max-w-sm hidden min-[410px]:flex items-center gap-2 h-9 rounded-md border border-border bg-muted/50 px-3 text-sm text-muted-foreground hover:bg-muted transition-colors cursor-pointer text-left"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate">Search items...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
          <span>⌘</span><span>K</span>
        </kbd>
      </button>
      <button
        type="button"
        onClick={onSearchClick}
        className="min-[410px]:hidden h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        title="Search"
      >
        <Search className="h-4 w-4" />
      </button>

      {/* Actions */}
      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/favorites"
          className="hidden min-[410px]:inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Favorites"
        >
          <Star className="h-4 w-4" />
        </Link>
        <Button variant="outline" size="sm" className="hidden sm:flex" onClick={onNewCollection}>
          New Collection
        </Button>
        <Button size="sm" onClick={onNewItem}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Item</span>
        </Button>
      </div>
    </header>
  );
}
