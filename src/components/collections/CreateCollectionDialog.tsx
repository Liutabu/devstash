'use client';

import { useState } from 'react';
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
import { createCollectionAction } from '@/actions/collections';

interface CreateCollectionDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateCollectionDialog({ open, onClose }: CreateCollectionDialogProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState('');

  function reset() {
    setName('');
    setDescription('');
    setNameError('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }
    setSaving(true);
    const result = await createCollectionAction({ name, description });
    setSaving(false);

    if (!result.success) {
      const err = typeof result.error === 'string'
        ? result.error
        : Object.values(result.error).flat().filter(Boolean).join(', ');
      toast.error(err || 'Failed to create collection');
      return;
    }

    toast.success(`Collection "${result.data.name}" created`);
    reset();
    onClose();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Collection</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="col-name">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="col-name"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(''); }}
              placeholder="e.g. React Patterns"
              autoFocus
            />
            {nameError && <p className="text-xs text-destructive">{nameError}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="col-desc">
              Description <span className="text-muted-foreground text-xs">(optional)</span>
            </label>
            <textarea
              id="col-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this collection for?"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Creating…' : 'Create Collection'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
