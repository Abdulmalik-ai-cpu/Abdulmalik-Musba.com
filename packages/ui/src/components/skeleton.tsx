import * as React from 'react';
import { cn } from '@portfolio/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn('animate-pulse rounded-md bg-ink/10', className)}
      {...props}
    />
  );
}