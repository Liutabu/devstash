'use client';

import { useState, useTransition } from 'react';
import { Sparkles, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { generateAutoTags } from '@/actions/ai';

interface SuggestTagsProps {
  /** Server-side gating is authoritative; this only hides the button for free users. */
  isPro?: boolean;
  title: string;
  content: string;
  /** Comma-separated tags input value. */
  value: string;
  onChange: (next: string) => void;
}

function parseTagsInput(value: string): string[] {
  return value.split(',').map((t) => t.trim()).filter(Boolean);
}

export function SuggestTags({ isPro, title, content, value, onChange }: SuggestTagsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  if (!isPro) return null;

  const hasTitle = title.trim().length > 0;

  function handleSuggest() {
    startTransition(async () => {
      const result = await generateAutoTags({ title, content });
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const existing = new Set(parseTagsInput(value).map((t) => t.toLowerCase()));
      const fresh = result.data.tags.filter((t) => !existing.has(t));
      setSuggestions(fresh);
      if (fresh.length === 0) toast.info('No new tags to suggest');
    });
  }

  function dismiss(tag: string) {
    setSuggestions((prev) => prev.filter((t) => t !== tag));
  }

  function accept(tag: string) {
    const current = parseTagsInput(value);
    if (!current.some((t) => t.toLowerCase() === tag)) {
      onChange([...current, tag].join(', '));
    }
    dismiss(tag);
  }

  return (
    <div className="mt-2 space-y-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleSuggest}
        disabled={pending || !hasTitle}
        aria-busy={pending}
        title={hasTitle ? 'Suggest tags with AI' : 'Add a title first'}
        className="text-muted-foreground"
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
        {pending ? 'Suggesting…' : 'Suggest tags'}
      </Button>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {suggestions.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-0.5 rounded-full bg-muted py-0.5 pl-2.5 pr-1 text-xs text-muted-foreground"
            >
              {tag}
              <button
                type="button"
                onClick={() => accept(tag)}
                title={`Add "${tag}"`}
                className="rounded-full p-0.5 transition-colors hover:bg-emerald-500/15 hover:text-emerald-400"
              >
                <Check className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => dismiss(tag)}
                title={`Dismiss "${tag}"`}
                className="rounded-full p-0.5 transition-colors hover:bg-destructive/15 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
