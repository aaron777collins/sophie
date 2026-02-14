'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ScrollArea({ className, children, ...props }: ScrollAreaProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden',
        className
      )}
      {...props}
    >
      <div className="h-full w-full overflow-y-auto overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}