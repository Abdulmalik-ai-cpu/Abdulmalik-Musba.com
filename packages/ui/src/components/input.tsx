import * as React from 'react';
import { cn } from '@portfolio/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-md border border-ink/20 bg-transparent px-3 text-sm transition-colors placeholder:text-ink/40 focus-visible:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-red-600',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';