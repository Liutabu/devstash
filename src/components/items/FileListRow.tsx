'use client';

import {
  File,
  FileText,
  FileCode,
  FileImage,
  FileArchive,
  FileAudio,
  FileVideo,
  FileSpreadsheet,
  Download,
  Star,
  Pin,
} from 'lucide-react';
import { useItemDrawer } from './ItemDrawerProvider';

interface FileItem {
  id: string;
  title: string;
  fileName: string | null;
  fileSize: number | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
}

interface FileListRowProps {
  item: FileItem;
}

function getFileIcon(fileName: string | null) {
  const ext = fileName?.split('.').pop()?.toLowerCase() ?? '';
  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'md'].includes(ext)) return FileText;
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'bmp'].includes(ext)) return FileImage;
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'rb', 'go', 'java', 'c', 'cpp', 'h', 'cs', 'php', 'html', 'css', 'json', 'xml', 'yaml', 'yml', 'sh', 'sql'].includes(ext)) return FileCode;
  if (['zip', 'tar', 'gz', 'rar', '7z', 'bz2'].includes(ext)) return FileArchive;
  if (['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'].includes(ext)) return FileAudio;
  if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv'].includes(ext)) return FileVideo;
  if (['xls', 'xlsx', 'csv'].includes(ext)) return FileSpreadsheet;
  return File;
}

function formatFileSize(bytes: number | null): string {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileListRow({ item }: FileListRowProps) {
  const drawer = useItemDrawer();
  const Icon = getFileIcon(item.fileName);

  function handleDownload(e: React.MouseEvent) {
    e.stopPropagation();
    window.location.href = `/api/download/${item.id}?download=1`;
  }

  return (
    <div
      onClick={() => drawer?.open(item.id)}
      className="group flex items-center gap-4 px-4 py-3 rounded-lg border border-border bg-card cursor-pointer hover:bg-accent/50 transition-colors"
    >
      <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.title}</p>
        {item.fileName && item.fileName !== item.title && (
          <p className="text-xs text-muted-foreground truncate">{item.fileName}</p>
        )}
      </div>

      <div className="hidden sm:flex items-center gap-6 shrink-0 text-xs text-muted-foreground">
        <span>{formatFileSize(item.fileSize)}</span>
        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
      </div>

      <div className="flex sm:hidden flex-col items-end shrink-0 text-xs text-muted-foreground gap-0.5">
        <span>{formatFileSize(item.fileSize)}</span>
        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {item.isPinned && <Pin className="h-3.5 w-3.5 text-muted-foreground" />}
        {item.isFavorite && <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />}
        <button
          type="button"
          onClick={handleDownload}
          className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
          title="Download"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
