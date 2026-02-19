"use client";

import React from "react";
import { Smile } from "lucide-react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

interface EmojiPickerProps {
  onChange: (value: string) => void;
}

export function EmojiPicker({ onChange }: EmojiPickerProps) {
  // Use dark theme by default to match HAOS Discord theme
  const theme = "dark";

  return (
    <Popover>
      <PopoverTrigger>
        <Smile className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition" />
      </PopoverTrigger>
      <PopoverContent
        className="bg-transparent border-none shadow-none drop-shadow-none mb-16"
        sideOffset={40}
        side="right"
      >
        <Picker
          theme={theme}
          data={data}
          onEmojiSelect={(emoji: any) => onChange(emoji.native)}
        />
      </PopoverContent>
    </Popover>
  );
}