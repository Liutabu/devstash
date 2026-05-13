'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Star, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface CollectionDetailActionsProps {
  collection: {
    id: string;
    name: string;
    description: string | null;
    isFavorite: boolean;
  };
}

export function CollectionDetailActions({ collection }: CollectionDetailActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [favoriting, setFavoriting] = useState(false);
  const [localName, setLocalName] = useState(collection.name);
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
    router.push('/collections');
  }

  return (
    <>
      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title={localIsFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className={`h-8 w-8 ${localIsFavorite ? 'text-yellow-400 hover:text-yellow-400' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={handleFavorite}
          disabled={favoriting}
        >
          <Star className={`h-4 w-4 ${localIsFavorite ? 'fill-yellow-400' : ''}`} />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Edit collection"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Delete collection"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <EditCollectionDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        collection={{ id: collection.id, name: localName, description: collection.description }}
        onSuccess={({ name }) => {
          setLocalName(name);
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
