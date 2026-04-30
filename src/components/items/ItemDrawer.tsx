'use client';

import { Star, Pin, Copy, Pencil, Trash2, FolderOpen } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { ITEM_TYPE_ICON_MAP } from '@/lib/item-type-icons';

export interface ItemDetailResponse {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  contentType: string;
  isFavorite: boolean;
  isPinned: boolean;
  tags: string[];
  itemType: { id: string; name: string; color: string; icon: string };
  collections: { id: string; name: string }[];
  createdAt: string;
  updatedAt: string;
}

interface ItemDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  detail: ItemDetailResponse | null;
  loading: boolean;
}

export function ItemDrawer({ isOpen, onClose, detail, loading }: ItemDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="right" className="sm:max-w-[480px] p-0 flex flex-col overflow-hidden gap-0">
        {loading && <DrawerSkeleton />}
        {!loading && detail && <DrawerBody detail={detail} />}
        {!loading && !detail && isOpen && (
          <>
            <SheetTitle className="sr-only">Item</SheetTitle>
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              Failed to load item.
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DrawerSkeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <SheetTitle className="sr-only">Loading…</SheetTitle>
      <div className="h-5 w-2/3 rounded bg-muted" />
      <div className="flex gap-2">
        <div className="h-4 w-16 rounded bg-muted" />
        <div className="h-4 w-20 rounded bg-muted" />
      </div>
      <div className="h-9 rounded bg-muted" />
      <div className="h-28 rounded bg-muted" />
      <div className="h-16 rounded bg-muted" />
    </div>
  );
}

function DrawerBody({ detail }: { detail: ItemDetailResponse }) {
  const Icon = ITEM_TYPE_ICON_MAP[detail.itemType.icon];
  const createdAt = new Date(detail.createdAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
  const updatedAt = new Date(detail.updatedAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  function handleCopy() {
    const text = detail.content ?? detail.url ?? detail.title;
    navigator.clipboard.writeText(text);
  }

  return (
    <>
      {/* Header */}
      <div className="shrink-0 px-6 pt-5 pb-4 pr-12 border-b border-border space-y-3">
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-md bg-muted p-2 mt-0.5">
            {Icon && <Icon className="h-4 w-4" style={{ color: detail.itemType.color }} />}
          </div>
          <div className="min-w-0">
            <SheetTitle className="text-base font-semibold leading-snug mb-1.5">
              {detail.title}
            </SheetTitle>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className="text-xs font-medium px-1.5 py-0.5 rounded"
                style={{ backgroundColor: `${detail.itemType.color}20`, color: detail.itemType.color }}
              >
                {detail.itemType.name}
              </span>
              {detail.language && (
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {detail.language}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-0.5">
          <ActionButton onClick={undefined}>
            <Star className={`h-3.5 w-3.5 ${detail.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            Favorite
          </ActionButton>
          <ActionButton onClick={undefined}>
            <Pin className={`h-3.5 w-3.5 ${detail.isPinned ? 'fill-foreground text-foreground' : ''}`} />
            Pin
          </ActionButton>
          <ActionButton onClick={handleCopy}>
            <Copy className="h-3.5 w-3.5" />
            Copy
          </ActionButton>
          <ActionButton onClick={undefined}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </ActionButton>
          <div className="flex-1" />
          <button
            className="rounded p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {detail.description && (
          <section>
            <SectionHeading>Description</SectionHeading>
            <p className="text-sm">{detail.description}</p>
          </section>
        )}

        {(detail.content || detail.url) && (
          <section>
            <SectionHeading>Content</SectionHeading>
            {detail.url ? (
              <a
                href={detail.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:underline break-all"
              >
                {detail.url}
              </a>
            ) : (
              <pre className="text-xs rounded-md bg-muted px-4 py-3 overflow-x-auto whitespace-pre-wrap break-words max-h-64">
                <code>{detail.content}</code>
              </pre>
            )}
          </section>
        )}

        {detail.tags.length > 0 && (
          <section>
            <SectionHeading>Tags</SectionHeading>
            <div className="flex flex-wrap gap-1.5">
              {detail.tags.map((tag) => (
                <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {detail.collections.length > 0 && (
          <section>
            <SectionHeading>Collections</SectionHeading>
            <div className="flex flex-wrap gap-1.5">
              {detail.collections.map((col) => (
                <span key={col.id} className="flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                  <FolderOpen className="h-3 w-3 shrink-0" />
                  {col.name}
                </span>
              ))}
            </div>
          </section>
        )}

        <section>
          <SectionHeading>Details</SectionHeading>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Created</span>
              <span>{createdAt}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Updated</span>
              <span>{updatedAt}</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
      {children}
    </h3>
  );
}

function ActionButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: (() => void) | undefined;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    >
      {children}
    </button>
  );
}
