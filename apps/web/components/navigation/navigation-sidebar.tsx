"use client";

import React from "react";
import { redirect } from "next/navigation";

// Melo Matrix imports
import { MatrixSession } from "@/lib/matrix/auth";
import { MatrixProfile, getMatrixProfile } from "@/lib/matrix/profile";

import { NavigationAction } from "@/components/navigation/navigation-action";
import { NavigationItem } from "@/components/navigation/navigation-item";

// Simple UI components to replace the shadcn/ui components
interface SeparatorProps {
  className?: string;
}

function Separator({ className }: SeparatorProps) {
  return <div className={className} />;
}

interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
}

function ScrollArea({ children, className }: ScrollAreaProps) {
  return (
    <div className={`overflow-auto ${className || ''}`}>
      {children}
    </div>
  );
}

// Theme toggle component (simplified)
function ModeToggle() {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('dark');
  
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };
  
  return (
    <button
      onClick={toggleTheme}
      className="h-[48px] w-[48px] rounded-[24px] hover:rounded-[16px] transition-all bg-background dark:bg-neutral-700 hover:bg-primary/10 flex items-center justify-center"
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}

// User button component (simplified Matrix user display)
interface UserButtonProps {
  session: MatrixSession;
  profile?: MatrixProfile;
}

function UserButton({ session, profile }: UserButtonProps) {
  const displayName = profile?.displayName || session.userId;
  const initials = displayName.substring(0, 2).toUpperCase();
  
  return (
    <button
      className="h-[48px] w-[48px] rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center hover:opacity-80 transition-opacity"
      onClick={() => {
        // TODO: Open user settings/profile modal
        console.log('User button clicked');
      }}
    >
      {profile?.avatarUrl ? (
        <img 
          src={profile.avatarUrl} 
          alt={displayName}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </button>
  );
}

// Mock server data structure for now - will be replaced with actual Matrix rooms/spaces
interface Server {
  id: string;
  name: string;
  imageUrl: string;
}

// Mock function to get servers - replace with actual Matrix logic
async function getServersForProfile(session: MatrixSession): Promise<Server[]> {
  // TODO: Replace with actual Matrix room/space discovery
  // This would use the Matrix client to get joined spaces/rooms
  return [
    {
      id: "server1",
      name: "General",
      imageUrl: "/placeholder-server.png"
    },
    {
      id: "server2", 
      name: "Development",
      imageUrl: "/placeholder-server.png"
    }
  ];
}

interface NavigationSidebarProps {
  session: MatrixSession;
}

export async function NavigationSidebar({ session }: NavigationSidebarProps) {
  if (!session) {
    redirect("/");
  }

  try {
    // Get user profile from Matrix
    const profile = await getMatrixProfile(session);
    
    // Get servers (Matrix spaces/rooms) for the user
    const servers = await getServersForProfile(session);

    return (
      <div className="space-y-4 flex flex-col h-full items-center text-primary w-full dark:bg-[#1e1f22] bg-[#e3e5e8] py-3">
        <NavigationAction />
        <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto" />
        <ScrollArea className="flex-1 w-full">
          {servers.map((server) => (
            <div key={server.id} className="mb-4">
              <NavigationItem
                id={server.id}
                imageUrl={server.imageUrl}
                name={server.name}
              />
            </div>
          ))}
        </ScrollArea>
        <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
          <ModeToggle />
          <UserButton session={session} profile={profile} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Failed to load navigation sidebar:', error);
    // Return a basic fallback UI
    return (
      <div className="space-y-4 flex flex-col h-full items-center text-primary w-full dark:bg-[#1e1f22] bg-[#e3e5e8] py-3">
        <NavigationAction />
        <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto" />
        <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
          <ModeToggle />
          <div className="h-[48px] w-[48px] rounded-full bg-gray-400 flex items-center justify-center">
            ?
          </div>
        </div>
      </div>
    );
  }
}

// Client component wrapper for easier usage
export function NavigationSidebarClient({ session }: NavigationSidebarProps) {
  const [profile, setProfile] = React.useState<MatrixProfile | null>(null);
  const [servers, setServers] = React.useState<Server[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      if (!session) return;
      
      try {
        const [userProfile, userServers] = await Promise.all([
          getMatrixProfile(session),
          getServersForProfile(session)
        ]);
        
        setProfile(userProfile);
        setServers(userServers);
      } catch (error) {
        console.error('Failed to load navigation data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [session]);

  if (loading) {
    return (
      <div className="space-y-4 flex flex-col h-full items-center text-primary w-full dark:bg-[#1e1f22] bg-[#e3e5e8] py-3">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 flex flex-col h-full items-center text-primary w-full dark:bg-[#1e1f22] bg-[#e3e5e8] py-3">
      <NavigationAction />
      <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto" />
      <ScrollArea className="flex-1 w-full">
        {servers.map((server) => (
          <div key={server.id} className="mb-4">
            <NavigationItem
              id={server.id}
              imageUrl={server.imageUrl}
              name={server.name}
            />
          </div>
        ))}
      </ScrollArea>
      <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
        <ModeToggle />
        <UserButton session={session} profile={profile || undefined} />
      </div>
    </div>
  );
}