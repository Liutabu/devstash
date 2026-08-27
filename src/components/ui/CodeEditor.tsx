'use client';

import { useState, useRef } from 'react';
import Editor, { type OnMount, type BeforeMount } from '@monaco-editor/react';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useEditorPreferences } from './EditorPreferencesContext';
import { MONACO_THEMES } from '@/lib/monaco-themes';
import { LANGUAGE_OPTIONS, getLanguageLabel, normalizeLanguage } from '@/lib/languages';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  /** When provided, the header shows a language dropdown instead of a static label. */
  onLanguageChange?: (language: string) => void;
  readOnly?: boolean;
}

const MIN_HEIGHT = 120;
const MAX_HEIGHT = 400;

export function CodeEditor({ value, onChange, language, onLanguageChange, readOnly = false }: CodeEditorProps) {
  const [editorHeight, setEditorHeight] = useState(MIN_HEIGHT);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const { preferences } = useEditorPreferences();

  const handleBeforeMount: BeforeMount = (monaco) => {
    for (const [name, data] of Object.entries(MONACO_THEMES)) {
      monaco.editor.defineTheme(name, data);
    }
  };

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;

    const updateHeight = () => {
      const contentHeight = editor.getContentHeight();
      const clamped = Math.min(Math.max(contentHeight, MIN_HEIGHT), MAX_HEIGHT);
      setEditorHeight(clamped);
    };

    updateHeight();
    editor.onDidContentSizeChange(updateHeight);
  };

  function handleCopy() {
    navigator.clipboard.writeText(value);
    toast.success('Copied to clipboard');
  }

  const displayLanguage = normalizeLanguage(language);

  return (
    <div className="rounded-md overflow-hidden border border-border" style={{ backgroundColor: '#1e1e1e' }}>
      {/* macOS header */}
      <div className="flex items-center justify-between px-3 py-2" style={{ backgroundColor: '#2d2d2d' }}>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: '#ff5f57' }} />
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: '#febc2e' }} />
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: '#28c840' }} />
        </div>

        <div className="flex items-center gap-2">
          {onLanguageChange ? (
            <select
              value={displayLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              aria-label="Language"
              title="Language"
              className="cursor-pointer rounded border-0 px-1.5 py-0.5 text-xs outline-none focus:ring-1 focus:ring-white/20"
              style={{ backgroundColor: '#3c3c3c', color: '#cccccc' }}
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            language && (
              <span className="text-xs" style={{ color: '#858585' }}>
                {getLanguageLabel(language)}
              </span>
            )
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs transition-colors"
            style={{ color: '#858585' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#cccccc')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#858585')}
            title="Copy"
          >
            <Copy className="h-3 w-3" />
            Copy
          </button>
        </div>
      </div>

      {/* Editor */}
      <Editor
        value={value}
        language={displayLanguage}
        theme={preferences.theme}
        height={editorHeight}
        options={{
          readOnly,
          minimap: { enabled: preferences.minimap },
          lineNumbers: 'off',
          folding: false,
          wordWrap: preferences.wordWrap ? 'on' : 'off',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          fontSize: preferences.fontSize,
          fontFamily: '"Geist Mono", Consolas, "Courier New", monospace',
          padding: { top: 12, bottom: 12 },
          overviewRulerBorder: false,
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          renderLineHighlight: readOnly ? 'none' : 'line',
          scrollbar: {
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
            vertical: 'auto',
            horizontal: 'auto',
            useShadows: false,
          },
          contextmenu: false,
          tabSize: preferences.tabSize,
        }}
        beforeMount={handleBeforeMount}
        onMount={handleMount}
        onChange={(val) => onChange?.(val ?? '')}
      />
    </div>
  );
}
