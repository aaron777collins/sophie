'use client';

import React, { createContext, useContext } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface DialogContextProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextProps | undefined>(undefined);

export interface DialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Dialog({ children, open = false, onOpenChange }: DialogProps) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange: onOpenChange || (() => {}) }}>
      {children}
    </DialogContext.Provider>
  );
}

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hideCloseButton?: boolean;
}

export function DialogContent({ className, children, hideCloseButton = false, ...props }: DialogContentProps) {
  const context = useContext(DialogContext);
  
  if (!context?.open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => context.onOpenChange(false)}
      />
      
      {/* Content */}
      <div
        className={cn(
          'relative z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
          'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          'sm:rounded-lg',
          className
        )}
        {...props}
      >
        {children}
        {!hideCloseButton && (
          <button
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            onClick={() => context.onOpenChange(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}
      </div>
    </div>
  );
}