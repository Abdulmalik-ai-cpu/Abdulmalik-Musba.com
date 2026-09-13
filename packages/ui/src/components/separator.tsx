import * as React from 'react';
import { cn } from '@portfolio/utils';

export function Separator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('h-px w-full bg-ink/10', className)} role="separator" {...props} />;
}