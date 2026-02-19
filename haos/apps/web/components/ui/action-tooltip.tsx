"use client";

import React from "react";
import { Tooltip, TooltipProps } from "@/components/ui/tooltip";

interface ActionTooltipProps {
  label: string;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  className?: string;
}

export function ActionTooltip({
  label,
  children,
  side = "top",
  align = "center",
  className,
}: ActionTooltipProps) {
  return (
    <Tooltip
      content={label}
      side={side}
      className={className}
      delayMs={50}
    >
      {children}
    </Tooltip>
  );
}