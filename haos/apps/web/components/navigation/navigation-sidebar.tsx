import React from "react";
import { redirect } from "next/navigation";

import { NavigationAction } from "@/components/navigation/navigation-action";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavigationItem } from "@/components/navigation/navigation-item";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useMatrixUserStore } from "@/lib/matrix-user-context";
import { UserButton } from "@/components/user/user-button";

// Mock Matrix spaces/servers for now - replace with actual Matrix client data
const mockSpaces = [
  {
    id: "!example:matrix.org",
    name: "General",
    imageUrl: "/placeholder-server.png"
  },
  {
    id: "!gaming:matrix.org", 
    name: "Gaming",
    imageUrl: "/placeholder-server.png"
  }
];

export function NavigationSidebar() {
  const { userId } = useMatrixUserStore();

  if (!userId) {
    // For now, don't redirect as Matrix auth might be in progress
    // return redirect("/login");
  }

  // In production, this would fetch actual Matrix spaces from the client
  const spaces = mockSpaces;

  return (
    <div className="space-y-4 flex flex-col h-full items-center text-primary w-full dark:bg-[#1e1f22] bg-[#e3e5e8] py-3">
      <NavigationAction />
      <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto" />
      <ScrollArea className="flex-1 w-full">
        {spaces.map((space) => (
          <div key={space.id} className="mb-4">
            <NavigationItem
              id={space.id}
              imageUrl={space.imageUrl}
              name={space.name}
            />
          </div>
        ))}
      </ScrollArea>
      <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
        <ModeToggle />
        <UserButton />
      </div>
    </div>
  );
}