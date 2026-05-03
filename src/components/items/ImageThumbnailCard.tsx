'use client';

import { Star, Pin } from 'lucide-react';
import { useItemDrawer } from './ItemDrawerProvider';

interface Item {
  id: string;
  title: string;
  isFavorite: boolean;
  isPinned: boolean;
}

interface ImageThumbnailCardProps {
  item: Item;
}

export function ImageThumbnailCard({ item }: ImageThumbnailCardProps) {
  const drawer = useItemDrawer();

  return (
    <div
      onClick={() => drawer?.open(item.id)}
      className="group relative rounded-lg border border-border bg-card overflow-hidden cursor-pointer hover:border-border/80 transition-colors"
    >
      <div className="aspect-video overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/download/${item.id}`}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="px-3 py-2 flex items-center justify-between gap-2">
        <span className="text-sm font-medium truncate">{item.title}</span>
        <div className="flex items-center gap-1 shrink-0">
          {item.isPinned && <Pin className="h-3.5 w-3.5 text-muted-foreground" />}
          {item.isFavorite && <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />}
        </div>
      </div>
    </div>
  );
}
