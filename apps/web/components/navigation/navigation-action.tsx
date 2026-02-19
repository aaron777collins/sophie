"use client";

import React from "react";
import { Plus } from "lucide-react";

// For Melo, we'll create a simplified tooltip component inline since ActionTooltip doesn't exist
// We'll also need to create a modal hook similar to the Discord clone

interface TooltipProps {
  children: React.ReactNode;
  label: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
}

function SimpleTooltip({ children, label, side = 'right', align = 'center' }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`
          absolute z-50 px-2 py-1 text-sm font-medium text-white bg-black rounded-md shadow-lg
          ${side === 'right' ? 'left-full ml-2' : ''}
          ${side === 'left' ? 'right-full mr-2' : ''}
          ${side === 'top' ? 'bottom-full mb-2' : ''}
          ${side === 'bottom' ? 'top-full mt-2' : ''}
          ${align === 'center' ? 'top-1/2 -translate-y-1/2' : ''}
          whitespace-nowrap
        `}>
          {label}
        </div>
      )}
    </div>
  );
}

// TODO: Replace this with actual modal system when available
function useModal() {
  return {
    onOpen: (type: string) => {
      console.log(`Opening modal: ${type}`);
      // This would integrate with Melo's modal system
    }
  };
}

export function NavigationAction() {
  const { onOpen } = useModal();

  return (
    <div>
      <SimpleTooltip side="right" align="center" label="Add a server">
        <button
          onClick={() => onOpen("createServer")}
          className="group flex items-center"
        >
          <div className="flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden items-center justify-center bg-background dark:bg-neutral-700 group-hover:bg-emerald-500">
            <Plus
              className="group-hover:text-white transition text-emerald-500"
              size={25}
            />
          </div>
        </button>
      </SimpleTooltip>
    </div>
  );
}