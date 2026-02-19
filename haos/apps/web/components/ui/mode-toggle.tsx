"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

import { Button } from "@/components/ui/button";
import { ActionTooltip } from "@/components/ui/action-tooltip";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <ActionTooltip
      side="right"
      align="center"
      label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <Button
        onClick={toggleTheme}
        variant="ghost"
        size="sm"
        className="bg-transparent border-0 w-10 h-10"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </ActionTooltip>
  );
}