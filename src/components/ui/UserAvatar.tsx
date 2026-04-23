import { cn } from '@/lib/utils';

interface UserAvatarProps {
  name?: string | null;
  image?: string | null;
  className?: string;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .slice(0, 2)
    .join('');
}

export function UserAvatar({ name, image, className }: UserAvatarProps) {
  const baseClass = cn(
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold select-none overflow-hidden',
    className,
  );

  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={image} alt={name ?? 'User avatar'} className={baseClass} />
    );
  }

  return (
    <div className={cn(baseClass, 'bg-sidebar-accent text-sidebar-accent-foreground')}>
      {getInitials(name)}
    </div>
  );
}
