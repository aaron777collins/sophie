'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Toast({ className, children, ...props }: ToastProps) {
  return (
    <div
      className={cn(
        'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
        'data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface ToastActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  altText: string;
}

export function ToastAction({ className, altText, ...props }: ToastActionProps) {
  return (
    <button
      className={cn(
        'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}