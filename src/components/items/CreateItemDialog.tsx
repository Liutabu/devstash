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
import { cn } from '@/lib/utils';
import { ITEM_TYPE_ICON_MAP } from '@/lib/item-type-icons';
import { createItemAction } from '@/actions/items';
import type { ItemTypeWithCount } from '@/lib/db/items';

interface CreateItemDialogProps {
  open: boolean;
  onClose: () => void;
  itemTypes: ItemTypeWithCount[];
}

const EXCLUDED_SLUGS = ['files', 'images'];

function getContentType(typeName: string): 'text' | 'url' {
  return typeName.toLowerCase() === 'link' ? 'url' : 'text';
}

function shouldShowContent(typeName: string): boolean {
  return ['snippet', 'command', 'prompt', 'note'].includes(typeName.toLowerCase());
}

function shouldShowLanguage(typeName: string): boolean {
  const n = typeName.toLowerCase();
  return n === 'snippet' || n === 'command';
}

function shouldShowUrl(typeName: string): boolean {
  return typeName.toLowerCase() === 'link';
}

export function CreateItemDialog({ open, onClose, itemTypes }: CreateItemDialogProps) {
  const router = useRouter();
  const availableTypes = itemTypes.filter((t) => !EXCLUDED_SLUGS.includes(t.slug));

  const [selectedTypeId, setSelectedTypeId] = useState<string>(availableTypes[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [language, setLanguage] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedType = availableTypes.find((t) => t.id === selectedTypeId) ?? availableTypes[0];
  const typeName = selectedType?.name ?? '';
  const isUrl = shouldShowUrl(typeName);
  const isContent = shouldShowContent(typeName);
  const isLanguage = shouldShowLanguage(typeName);
  const isValid = title.trim().length > 0 && (!isUrl || url.trim().length > 0);

  function resetForm() {
    setTitle('');
    setDescription('');
    setContent('');
    setUrl('');
    setLanguage('');
    setTagsInput('');
    setSaving(false);
    setSelectedTypeId(availableTypes[0]?.id ?? '');
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSave() {
    if (!isValid || !selectedType) return;
    setSaving(true);
    try {
      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      const result = await createItemAction({
        title: title.trim(),
        description: description || null,
        content: isContent ? (content || null) : null,
        url: isUrl ? (url || null) : null,
        language: isLanguage ? (language || null) : null,
        tags,
        itemTypeId: selectedType.id,
        contentType: getContentType(typeName),
      });

      if (!result.success) {
        toast.error(typeof result.error === 'string' ? result.error : 'Failed to create item');
        return;
      }

      toast.success('Item created');
      router.refresh();
      handleClose();
    } catch {
      toast.error('Failed to create item');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Item</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Type selector */}
          <div className="flex flex-wrap gap-1.5">
            {availableTypes.map((type) => {
              const Icon = ITEM_TYPE_ICON_MAP[type.icon];
              const isSelected = type.id === selectedType?.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedTypeId(type.id)}
                  className={cn(
                    'flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors',
                    isSelected
                      ? ''
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                  )}
                  style={isSelected ? { backgroundColor: `${type.color}20`, color: type.color } : {}}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  {type.name}
                </button>
              );
            })}
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              className="mt-1 w-full bg-muted rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
              placeholder="Enter a title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Description
            </label>
            <textarea
              className="mt-1 w-full bg-muted rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring resize-none"
              rows={2}
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* URL */}
          {isUrl && (
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                URL <span className="text-destructive">*</span>
              </label>
              <input
                type="url"
                className="mt-1 w-full bg-muted rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                placeholder="https://…"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          )}

          {/* Content */}
          {isContent && (
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Content
              </label>
              <textarea
                className="mt-1 w-full bg-muted rounded px-3 py-2 text-xs font-mono outline-none focus:ring-1 focus:ring-ring resize-none"
                rows={6}
                placeholder="Enter content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          )}

          {/* Language */}
          {isLanguage && (
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Language
              </label>
              <input
                type="text"
                className="mt-1 w-full bg-muted rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                placeholder="e.g. typescript"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              />
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Tags
            </label>
            <input
              type="text"
              className="mt-1 w-full bg-muted rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
              placeholder="react, hooks, typescript"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">Comma-separated</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid || saving}>
            {saving ? 'Creating…' : 'Create Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
