import { type ReactNode } from 'react';
import { cn } from '@/utils';

interface BadgeProps {
  variant?: 'gold' | 'royal' | 'success' | 'error' | 'navy';
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'navy', children, className }: BadgeProps) {
  const variants = {
    gold: 'badge-gold',
    royal: 'badge-royal',
    success: 'badge-success',
    error: 'badge-error',
    navy: 'badge-navy',
  };
  return <span className={cn(variants[variant], className)}>{children}</span>;
}
