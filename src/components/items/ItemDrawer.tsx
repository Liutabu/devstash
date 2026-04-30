'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Pin, Copy, Pencil, Trash2, FolderOpen, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ITEM_TYPE_ICON_MAP } from '@/lib/item-type-icons';
import { updateItemAction, deleteItemAction } from '@/actions/items';

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
  onUpdate: (detail: ItemDetailResponse) => void;
  onDelete: () => void;
}

export function ItemDrawer({ isOpen, onClose, detail, loading, onUpdate, onDelete }: ItemDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="right" className="sm:max-w-[480px] p-0 flex flex-col overflow-hidden gap-0">
        {loading && <DrawerSkeleton />}
        {!loading && detail && <DrawerBody detail={detail} onUpdate={onUpdate} onDelete={onDelete} />}
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

interface DrawerBodyProps {
  detail: ItemDetailResponse;
  onUpdate: (detail: ItemDetailResponse) => void;
  onDelete: () => void;
}

function DrawerBody({ detail, onUpdate, onDelete }: DrawerBodyProps) {
  const router = useRouter();
  const Icon = ITEM_TYPE_ICON_MAP[detail.itemType.icon];

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [language, setLanguage] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const typeName = detail.itemType.name.toLowerCase();
  const showContent = detail.contentType === 'text';
  const showLanguage = typeName === 'snippet' || typeName === 'command';
  const showUrl = detail.contentType === 'url';

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

  function handleEdit() {
    setTitle(detail.title);
    setDescription(detail.description ?? '');
    setContent(detail.content ?? '');
    setUrl(detail.url ?? '');
    setLanguage(detail.language ?? '');
    setTagsInput(detail.tags.join(', '));
    setIsEditing(true);
  }

  function handleCancel() {
    setIsEditing(false);
  }

  async function handleDelete() {
    const result = await deleteItemAction(detail.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success('Item deleted');
    onDelete();
    router.refresh();
  }

  async function handleSave() {
    setSaving(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const result = await updateItemAction(detail.id, {
        title: title.trim(),
        description: description || null,
        content: showContent ? (content || null) : null,
        url: showUrl ? (url || null) : null,
        language: showLanguage ? (language || null) : null,
        tags,
      });

      if (!result.success) {
        toast.error(typeof result.error === 'string' ? result.error : 'Failed to save changes');
        return;
      }

      const updated: ItemDetailResponse = {
        ...result.data,
        createdAt: result.data.createdAt.toISOString(),
        updatedAt: result.data.updatedAt.toISOString(),
      };
      onUpdate(updated);
      setIsEditing(false);
      toast.success('Item updated');
      router.refresh();
    } catch {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Header */}
      <div className="shrink-0 px-6 pt-5 pb-4 pr-12 border-b border-border space-y-3">
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-md bg-muted p-2 mt-0.5">
            {Icon && <Icon className="h-4 w-4" style={{ color: detail.itemType.color }} />}
          </div>
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <>
                <SheetTitle className="sr-only">{detail.title}</SheetTitle>
                <input
                  className="w-full bg-muted rounded px-2 py-1 text-base font-semibold leading-snug mb-1.5 outline-none focus:ring-1 focus:ring-ring"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
                  autoFocus
                />
              </>
            ) : (
              <SheetTitle className="text-base font-semibold leading-snug mb-1.5">
                {detail.title}
              </SheetTitle>
            )}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className="text-xs font-medium px-1.5 py-0.5 rounded"
                style={{ backgroundColor: `${detail.itemType.color}20`, color: detail.itemType.color }}
              >
                {detail.itemType.name}
              </span>
              {!isEditing && detail.language && (
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {detail.language}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action bar */}
        {isEditing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
          </div>
        ) : (
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
            <ActionButton onClick={handleEdit}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </ActionButton>
            <div className="flex-1" />
            <AlertDialog>
              <AlertDialogTrigger
                className="rounded p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete item?</AlertDialogTitle>
                  <AlertDialogDescription>
                    &ldquo;{detail.title}&rdquo; will be permanently deleted. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {isEditing ? (
          <EditForm
            description={description}
            setDescription={setDescription}
            content={content}
            setContent={setContent}
            url={url}
            setUrl={setUrl}
            language={language}
            setLanguage={setLanguage}
            tagsInput={tagsInput}
            setTagsInput={setTagsInput}
            showContent={showContent}
            showLanguage={showLanguage}
            showUrl={showUrl}
            detail={detail}
            createdAt={createdAt}
            updatedAt={updatedAt}
          />
        ) : (
          <ViewBody detail={detail} createdAt={createdAt} updatedAt={updatedAt} />
        )}
      </div>
    </>
  );
}

interface EditFormProps {
  description: string;
  setDescription: (v: string) => void;
  content: string;
  setContent: (v: string) => void;
  url: string;
  setUrl: (v: string) => void;
  language: string;
  setLanguage: (v: string) => void;
  tagsInput: string;
  setTagsInput: (v: string) => void;
  showContent: boolean;
  showLanguage: boolean;
  showUrl: boolean;
  detail: ItemDetailResponse;
  createdAt: string;
  updatedAt: string;
}

function EditForm({
  description, setDescription,
  content, setContent,
  url, setUrl,
  language, setLanguage,
  tagsInput, setTagsInput,
  showContent, showLanguage, showUrl,
  detail, createdAt, updatedAt,
}: EditFormProps) {
  return (
    <>
      <section>
        <SectionHeading>Description</SectionHeading>
        <textarea
          className="w-full bg-muted rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring resize-none"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
        />
      </section>

      {showContent && (
        <section>
          <SectionHeading>Content</SectionHeading>
          <textarea
            className="w-full bg-muted rounded px-3 py-2 text-xs font-mono outline-none focus:ring-1 focus:ring-ring resize-none"
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Content"
          />
        </section>
      )}

      {showUrl && (
        <section>
          <SectionHeading>URL</SectionHeading>
          <input
            type="url"
            className="w-full bg-muted rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
          />
        </section>
      )}

      {showLanguage && (
        <section>
          <SectionHeading>Language</SectionHeading>
          <input
            type="text"
            className="w-full bg-muted rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="e.g. typescript"
          />
        </section>
      )}

      <section>
        <SectionHeading>Tags</SectionHeading>
        <input
          type="text"
          className="w-full bg-muted rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="react, hooks, typescript"
        />
        <p className="text-xs text-muted-foreground mt-1">Comma-separated</p>
      </section>

      <section>
        <SectionHeading>Type</SectionHeading>
        <span
          className="text-xs font-medium px-1.5 py-0.5 rounded"
          style={{ backgroundColor: `${detail.itemType.color}20`, color: detail.itemType.color }}
        >
          {detail.itemType.name}
        </span>
      </section>

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
    </>
  );
}

function ViewBody({ detail, createdAt, updatedAt }: { detail: ItemDetailResponse; createdAt: string; updatedAt: string }) {
  return (
    <>
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
