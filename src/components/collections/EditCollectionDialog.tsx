'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateCollectionAction } from '@/actions/collections';

interface EditCollectionDialogProps {
  open: boolean;
  onClose: () => void;
  collection: { id: string; name: string; description: string | null };
  onSuccess?: (updated: { name: string; description: string | null }) => void;
}

export function EditCollectionDialog({ open, onClose, collection, onSuccess }: EditCollectionDialogProps) {
  const router = useRouter();
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description ?? '');
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (open) {
      setName(collection.name);
      setDescription(collection.description ?? '');
      setNameError('');
    }
  }, [open, collection]);

  function handleClose() {
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }
    setSaving(true);
    const result = await updateCollectionAction({ id: collection.id, name, description });
    setSaving(false);

    if (!result.success) {
      const err = typeof result.error === 'string'
        ? result.error
        : Object.values(result.error).flat().filter(Boolean).join(', ');
      toast.error(err || 'Failed to update collection');
      return;
    }

    toast.success('Collection updated');
    onSuccess?.({ name: result.data.name, description: result.data.description });
    onClose();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Collection</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="edit-col-name">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="edit-col-name"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(''); }}
              autoFocus
            />
            {nameError && <p className="text-xs text-destructive">{nameError}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="edit-col-desc">
              Description <span className="text-muted-foreground text-xs">(optional)</span>
            </label>
            <textarea
              id="edit-col-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
