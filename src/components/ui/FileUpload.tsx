'use client';

import { useRef, useState } from 'react';
import { Upload, X, FileText, Image } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UploadResult {
  key: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

interface FileUploadProps {
  accept: 'image' | 'file';
  onUpload: (result: UploadResult) => void;
  onClear?: () => void;
  uploaded?: UploadResult | null;
}

const IMAGE_ACCEPT = '.png,.jpg,.jpeg,.gif,.webp,.svg';
const FILE_ACCEPT = '.pdf,.txt,.md,.json,.yaml,.yml,.xml,.csv,.toml,.ini';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function FileUpload({ accept, onUpload, onClear, uploaded }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File) {
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      setProgress(null);
      if (xhr.status >= 200 && xhr.status < 300) {
        const result: UploadResult = JSON.parse(xhr.responseText);
        onUpload(result);
      } else {
        try {
          const body = JSON.parse(xhr.responseText);
          setError(body.error ?? 'Upload failed');
        } catch {
          setError('Upload failed');
        }
      }
    };

    xhr.onerror = () => {
      setProgress(null);
      setError('Upload failed');
    };

    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }

  if (uploaded) {
    const isImage = uploaded.mimeType.startsWith('image/');
    return (
      <div className="relative rounded-md border border-border bg-muted/50 p-3">
        <button
          type="button"
          onClick={() => { onClear?.(); }}
          className="absolute top-2 right-2 rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Remove"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        {isImage ? (
          <div className="flex items-center gap-3">
            <Image className="h-5 w-5 shrink-0 text-pink-400" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{uploaded.fileName}</p>
              <p className="text-xs text-muted-foreground">{formatBytes(uploaded.fileSize)}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{uploaded.fileName}</p>
              <p className="text-xs text-muted-foreground">{formatBytes(uploaded.fileSize)}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-6 text-center cursor-pointer transition-colors',
          dragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-muted-foreground/50 hover:bg-muted/30',
          progress !== null && 'pointer-events-none',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept={accept === 'image' ? IMAGE_ACCEPT : FILE_ACCEPT}
          onChange={handleChange}
        />

        {progress !== null ? (
          <>
            <div className="h-1.5 w-full max-w-[200px] rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">Uploading… {progress}%</p>
          </>
        ) : (
          <>
            <Upload className="h-6 w-6 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Drop {accept === 'image' ? 'an image' : 'a file'} here</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                or click to browse &mdash;{' '}
                {accept === 'image' ? 'PNG, JPG, GIF, WebP, SVG up to 5 MB' : 'PDF, TXT, MD, JSON, YAML, XML, CSV, TOML up to 10 MB'}
              </p>
            </div>
          </>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
