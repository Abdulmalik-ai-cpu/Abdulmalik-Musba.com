import * as React from 'react';
import { cn } from '@portfolio/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'accent' | 'muted';
}

const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-ink text-paper',
  outline: 'border border-ink text-ink',
  accent: 'bg-accent text-ink',
  muted: 'bg-ink/5 text-ink/70',
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}