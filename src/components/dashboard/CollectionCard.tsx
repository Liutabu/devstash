'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Star, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EditCollectionDialog } from '@/components/collections/EditCollectionDialog';
import { deleteCollectionAction, toggleCollectionFavoriteAction } from '@/actions/collections';
import { ITEM_TYPE_ICON_MAP } from '@/lib/item-type-icons';

interface Collection {
  id: string;
  name: string;
  description: string;
  isFavorite: boolean;
  itemCount: number;
  dominantColor: string;
  icons: readonly string[];
}

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [favoriting, setFavoriting] = useState(false);
  const [localName, setLocalName] = useState(collection.name);
  const [localDescription, setLocalDescription] = useState(collection.description);
  const [localIsFavorite, setLocalIsFavorite] = useState(collection.isFavorite);

  async function handleFavorite() {
    setFavoriting(true);
    const result = await toggleCollectionFavoriteAction(collection.id);
    setFavoriting(false);
    if (!result.success) {
      toast.error(result.error || 'Failed to update favorite');
      return;
    }
    setLocalIsFavorite(result.data.isFavorite);
    toast.success(result.data.isFavorite ? 'Added to favorites' : 'Removed from favorites');
    router.refresh();
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteCollectionAction(collection.id);
    setDeleting(false);
    setDeleteOpen(false);
    if (!result.success) {
      toast.error(result.error || 'Failed to delete collection');
      return;
    }
    toast.success(`"${localName}" deleted`);
    router.refresh();
  }

  return (
    <>
      <div
        className="group relative rounded-lg border border-border bg-card p-4 flex flex-col gap-3 hover:border-border/80 transition-colors cursor-pointer"
        style={{ borderTopColor: collection.dominantColor, borderTopWidth: 2 }}
        onClick={() => router.push(`/collections/${collection.id}`)}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-sm font-medium truncate">{localName}</span>
              {localIsFavorite && (
                <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">{localDescription}</p>
          </div>

          {/* Dropdown — stop propagation so the card click doesn't fire */}
          <div
            className="shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground p-0.5 rounded" aria-label="Collection actions">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="h-3.5 w-3.5 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleFavorite} disabled={favoriting}>
                  <Star className={`h-3.5 w-3.5 mr-2 ${localIsFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  {localIsFavorite ? 'Unfavorite' : 'Favorite'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {collection.icons.slice(0, 3).map((iconName) => {
              const Icon = ITEM_TYPE_ICON_MAP[iconName];
              return Icon ? (
                <div key={iconName} className="rounded bg-muted p-1">
                  <Icon className="h-3 w-3 text-muted-foreground" />
                </div>
              ) : null;
            })}
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {collection.itemCount} items
          </span>
        </div>
      </div>

      <EditCollectionDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        collection={{ id: collection.id, name: localName, description: localDescription || null }}
        onSuccess={({ name, description }) => {
          setLocalName(name);
          setLocalDescription(description ?? '');
        }}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{localName}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the collection. Items inside it will not be deleted — they will just be removed from this collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
