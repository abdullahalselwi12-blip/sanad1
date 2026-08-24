import { type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export function Input({ label, error, icon, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-navy-700 dark:text-navy-200">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400">{icon}</div>}
        <input className={cn('input', icon ? 'pr-10' : '', error ? 'border-error-500 focus:ring-error-500/20' : '', className)} {...props} />
      </div>
      {error && <p className="text-xs text-error-600 dark:text-error-400">{error}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-navy-700 dark:text-navy-200">{label}</label>}
      <textarea className={cn('input resize-none', error && 'border-error-500 focus:ring-error-500/20', className)} {...props} />
      {error && <p className="text-xs text-error-600 dark:text-error-400">{error}</p>}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export function Select({ label, error, className, children, ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-navy-700 dark:text-navy-200">{label}</label>}
      <select className={cn('input cursor-pointer', error && 'border-error-500 focus:ring-error-500/20', className)} {...props}>
        {children}
      </select>
      {error && <p className="text-xs text-error-600 dark:text-error-400">{error}</p>}
    </div>
  );
}
