import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TopBar() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-background px-4">
      {/* Logo */}
      <div className="flex items-center gap-2 font-semibold text-foreground">
        <span className="text-lg">DevStash</span>
      </div>

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
        <Button variant="outline" size="sm">
          New Collection
        </Button>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          New Item
        </Button>
      </div>
    </header>
  );
}