import { Scale } from 'lucide-react';
import { cn } from '@/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-7 h-7', text: 'text-lg' },
    md: { icon: 'w-9 h-9', text: 'text-xl' },
    lg: { icon: 'w-12 h-12', text: 'text-3xl' },
  };

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className={cn(
        'rounded-xl bg-gradient-to-br from-royal-600 to-navy-800 flex items-center justify-center shadow-soft',
        sizes[size].icon
      )}>
        <Scale className="w-1/2 h-1/2 text-gold-400" strokeWidth={2.5} />
      </div>
      {showText && (
        <span className={cn('font-bold tracking-tight text-navy-900 dark:text-white', sizes[size].text)}>
          SANAD
        </span>
      )}
    </div>
  );
}
