'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { updateEditorPreferencesAction } from '@/actions/profile';
import { useEditorPreferences } from '@/components/ui/EditorPreferencesContext';
import {
  FONT_SIZE_OPTIONS,
  TAB_SIZE_OPTIONS,
  THEME_OPTIONS,
  type EditorPreferences,
} from '@/lib/editor-preferences';

export function EditorPreferencesSection() {
  const { preferences, setPreferences } = useEditorPreferences();
  const [, startTransition] = useTransition();

  function handleChange(patch: Partial<EditorPreferences>) {
    const next = { ...preferences, ...patch };
    setPreferences(next);
    startTransition(async () => {
      const result = await updateEditorPreferencesAction(next);
      if (result.success) {
        toast.success('Editor preferences saved');
      } else {
        toast.error('Failed to save preferences');
      }
    });
  }

  return (
    <section className="rounded-lg border border-border bg-card p-6 space-y-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Editor Preferences
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Theme */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="editor-theme">
            Theme
          </label>
          <select
            id="editor-theme"
            value={preferences.theme}
            onChange={(e) => handleChange({ theme: e.target.value as EditorPreferences['theme'] })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {THEME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Font size */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="editor-font-size">
            Font Size
          </label>
          <select
            id="editor-font-size"
            value={preferences.fontSize}
            onChange={(e) => handleChange({ fontSize: Number(e.target.value) })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {FONT_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </select>
        </div>

        {/* Tab size */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="editor-tab-size">
            Tab Size
          </label>
          <select
            id="editor-tab-size"
            value={preferences.tabSize}
            onChange={(e) => handleChange({ tabSize: Number(e.target.value) })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {TAB_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size} spaces
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3 pt-1">
        <Toggle
          id="editor-word-wrap"
          label="Word Wrap"
          description="Wrap long lines that exceed the editor width"
          checked={preferences.wordWrap}
          onChange={(v) => handleChange({ wordWrap: v })}
        />
        <Toggle
          id="editor-minimap"
          label="Minimap"
          description="Show a code overview minimap on the right side"
          checked={preferences.minimap}
          onChange={(v) => handleChange({ minimap: v })}
        />
      </div>
    </section>
  );
}

function Toggle({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-0.5">
        <label htmlFor={id} className="text-sm font-medium cursor-pointer">
          {label}
        </label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background ${
          checked ? 'bg-primary' : 'bg-input'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
