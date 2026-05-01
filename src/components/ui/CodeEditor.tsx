'use client';

import { useState, useRef } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
}

const MIN_HEIGHT = 120;
const MAX_HEIGHT = 400;

export function CodeEditor({ value, onChange, language, readOnly = false }: CodeEditorProps) {
  const [editorHeight, setEditorHeight] = useState(MIN_HEIGHT);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

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

  const displayLanguage = language?.toLowerCase() || 'plaintext';

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
          {language && (
            <span className="text-xs" style={{ color: '#858585' }}>
              {language}
            </span>
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
        theme="vs-dark"
        height={editorHeight}
        options={{
          readOnly,
          minimap: { enabled: false },
          lineNumbers: 'off',
          folding: false,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          fontSize: 13,
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
          tabSize: 2,
        }}
        onMount={handleMount}
        onChange={(val) => onChange?.(val ?? '')}
      />
    </div>
  );
}
