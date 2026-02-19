'use client';

import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

interface DropdownMenuContextProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = createContext<DropdownMenuContextProps | undefined>(undefined);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

export interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: React.ReactNode;
}

export function DropdownMenuTrigger({ children, asChild, ...props }: DropdownMenuTriggerProps) {
  const context = useContext(DropdownMenuContext);
  
  if (!context) {
    throw new Error('DropdownMenuTrigger must be used within DropdownMenu');
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    context.setOpen(!context.open);
    if (props.onClick) {
      props.onClick(e);
    }
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onClick: handleClick,
    });
  }

  return (
    <button {...props} onClick={handleClick}>
      {children}
    </button>
  );
}

export interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function DropdownMenuContent({ 
  children, 
  className, 
  align = 'center',
  side = 'bottom',
  ...props 
}: DropdownMenuContentProps) {
  const context = useContext(DropdownMenuContext);
  
  if (!context) {
    throw new Error('DropdownMenuContent must be used within DropdownMenu');
  }

  if (!context.open) {
    return null;
  }

  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  };

  const sideClasses = {
    top: 'bottom-full mb-1',
    right: 'left-full top-0 ml-1',
    bottom: 'top-full mt-1',
    left: 'right-full top-0 mr-1',
  };

  return (
    <>
      {/* Backdrop to close menu */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={() => context.setOpen(false)}
      />
      <div
        className={cn(
          'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
          'bg-discord-light border-discord-light/20',
          sideClasses[side],
          alignmentClasses[align],
          className
        )}
        {...props}
      >
        {children}
      </div>
    </>
  );
}

export interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  inset?: boolean;
}

export function DropdownMenuItem({ 
  className, 
  inset, 
  children, 
  ...props 
}: DropdownMenuItemProps) {
  const context = useContext(DropdownMenuContext);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (props.onClick) {
      props.onClick(e);
    }
    context?.setOpen(false);
  };

  return (
    <button
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
        'transition-colors focus:bg-accent focus:text-accent-foreground',
        'hover:bg-discord-hover text-gray-200 hover:text-white w-full text-left',
        inset && 'pl-8',
        className
      )}
      {...props}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('-mx-1 my-1 h-px bg-zinc-700', className)}
      {...props}
    />
  );
}