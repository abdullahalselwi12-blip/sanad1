import { getInitials, cn } from '@/utils';

interface AvatarProps {
  name: string | null;
  src?: string | null | undefined;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name || ''}
        className={cn('rounded-full object-cover ring-2 ring-navy-100 dark:ring-navy-800', sizes[size], className)}
      />
    );
  }

  return (
    <div className={cn(
      'rounded-full flex items-center justify-center font-semibold bg-gradient-to-br from-royal-500 to-royal-700 text-white',
      sizes[size], className
    )}>
      {getInitials(name)}
    </div>
  );
}
