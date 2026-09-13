import * as React from 'react';
import { cn } from '@portfolio/utils';

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('mb-1 block text-sm font-medium text-ink/80', className)}
      {...props}
    />
  );
}