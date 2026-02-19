"use client";

import React from "react";
import { useMatrixUserStore } from "@/lib/matrix-user-context";
import { Avatar } from "@/components/ui/avatar";
import { ActionTooltip } from "@/components/ui/action-tooltip";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export function UserButton() {
  const { userId, displayName, avatarUrl } = useMatrixUserStore();

  const handleUserClick = () => {
    // Open user settings or profile modal
    console.log("User clicked:", userId);
  };

  if (!userId) {
    return (
      <ActionTooltip side="right" align="center" label="Not signed in">
        <Button
          variant="ghost"
          size="sm"
          className="h-[48px] w-[48px] bg-background dark:bg-neutral-700 rounded-full"
        >
          <User className="h-6 w-6" />
        </Button>
      </ActionTooltip>
    );
  }

  return (
    <ActionTooltip side="right" align="center" label={displayName || userId}>
      <Button
        onClick={handleUserClick}
        variant="ghost"
        size="sm"
        className="h-[48px] w-[48px] p-0 rounded-full overflow-hidden"
      >
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={displayName || userId}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-background dark:bg-neutral-700 flex items-center justify-center">
            <User className="h-6 w-6" />
          </div>
        )}
      </Button>
    </ActionTooltip>
  );
}