import { Scale } from 'lucide-react';
import { cn } from '@/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({
  className,
  showText = true,
  size = 'md',
}: LogoProps) {
  const sizes = {
    sm: {
      icon: 'w-7 h-7',
      text: 'text-lg',
    },
    md: {
      icon: 'w-9 h-9',
      text: 'text-xl',
    },
    lg: {
      icon: 'w-12 h-12',
      text: 'text-3xl',
    },
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2.5',
        className
      )}
    >
      {/* SANAD Icon */}
      <div
        className={cn(
          'flex items-center justify-center rounded-xl',
          'bg-[#0D2942]',
          'border border-[#173F5F]',
          'shadow-[0_4px_15px_rgba(0,0,0,0.25)]',
          'transition-all duration-200',
          'hover:border-[#D8B96A]',
          sizes[size].icon
        )}
      >
        <Scale
          className="w-1/2 h-1/2 text-[#D8B96A]"
          strokeWidth={2.5}
          aria-hidden="true"
        />
      </div>

      {/* SANAD Text */}
      {showText && (
        <span
          className={cn(
            'font-bold tracking-tight',
            'text-[#F5F7FA]',
            sizes[size].text
          )}
        >
          SANAD
        </span>
      )}
    </div>
  );
}