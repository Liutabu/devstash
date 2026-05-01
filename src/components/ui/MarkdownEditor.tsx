'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

const MAX_HEIGHT = 400;
const MIN_HEIGHT = 192;

export function MarkdownEditor({ value, onChange, readOnly = false, placeholder }: MarkdownEditorProps) {
  const [tab, setTab] = useState<'write' | 'preview'>(readOnly ? 'preview' : 'write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function syncHeight() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(Math.max(el.scrollHeight, MIN_HEIGHT), MAX_HEIGHT)}px`;
  }

  useEffect(() => {
    if (tab === 'write') syncHeight();
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleCopy() {
    navigator.clipboard.writeText(value);
    toast.success('Copied to clipboard');
  }

  return (
    <div className="rounded-md overflow-hidden border border-border" style={{ backgroundColor: '#1e1e1e' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2" style={{ backgroundColor: '#2d2d2d' }}>
        <div className="flex items-center gap-1">
          {!readOnly && (
            <>
              <TabButton active={tab === 'write'} onClick={() => setTab('write')}>
                Write
              </TabButton>
              <TabButton active={tab === 'preview'} onClick={() => setTab('preview')}>
                Preview
              </TabButton>
            </>
          )}
          {readOnly && (
            <span className="text-xs" style={{ color: '#858585' }}>
              Markdown
            </span>
          )}
        </div>

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

      {/* Write tab */}
      {tab === 'write' && !readOnly && (
        <textarea
          ref={textareaRef}
          className="w-full bg-transparent text-sm px-4 py-3 outline-none resize-none font-mono overflow-y-auto"
          style={{ color: '#d4d4d4', height: MIN_HEIGHT, maxHeight: MAX_HEIGHT }}
          value={value}
          onChange={(e) => { onChange?.(e.target.value); syncHeight(); }}
          placeholder={placeholder ?? 'Write markdown here…'}
          spellCheck={false}
        />
      )}

      {/* Preview tab */}
      {tab === 'preview' && (
        <div
          className="markdown-preview px-4 py-3 text-sm overflow-y-auto"
          style={{ maxHeight: MAX_HEIGHT, minHeight: readOnly ? undefined : MIN_HEIGHT }}
        >
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p style={{ color: '#6b7280' }}>{readOnly ? 'No content.' : 'Nothing to preview.'}</p>
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded px-2.5 py-0.5 text-xs transition-colors"
      style={{
        color: active ? '#cccccc' : '#858585',
        backgroundColor: active ? 'rgba(255,255,255,0.08)' : 'transparent',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = '#aaaaaa'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = '#858585'; }}
    >
      {children}
    </button>
  );
}
