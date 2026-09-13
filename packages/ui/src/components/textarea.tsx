import * as React from 'react';
import { cn } from '@portfolio/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'min-h-[120px] w-full rounded-md border border-ink/20 bg-transparent px-3 py-2 text-sm transition-colors placeholder:text-ink/40 focus-visible:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-red-600',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';