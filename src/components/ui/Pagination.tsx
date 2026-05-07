import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  const navClass = 'flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors';

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      {hasPrev ? (
        <Link href={`${basePath}?page=${currentPage - 1}`} className={cn(navClass, 'hover:bg-muted')}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className={cn(navClass, 'opacity-30 cursor-not-allowed')}>
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {pageNumbers.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground">
            &hellip;
          </span>
        ) : (
          <Link
            key={p}
            href={`${basePath}?page=${p}`}
            className={cn(
              navClass,
              p === currentPage
                ? 'bg-primary text-primary-foreground font-medium'
                : 'hover:bg-muted text-muted-foreground',
            )}
          >
            {p}
          </Link>
        ),
      )}

      {hasNext ? (
        <Link href={`${basePath}?page=${currentPage + 1}`} className={cn(navClass, 'hover:bg-muted')}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className={cn(navClass, 'opacity-30 cursor-not-allowed')}>
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </div>
  );
}
