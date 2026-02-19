"use client";

import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  FormControl,
  Form,
  FormField,
  FormItem
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useModal } from "@/hooks/use-modal-store";
import { EmojiPicker } from "@/components/emoji-picker";
import { useMatrixMessaging } from "@/hooks/use-matrix-messaging";

interface ChatInputProps {
  /** Matrix client instance */
  client?: any; // MatrixClient type from matrix-js-sdk
  /** Matrix room ID */
  roomId: string;
  /** Display name for the channel/conversation */
  name: string;
  /** Type of chat - channel or direct conversation */
  type: "conversation" | "channel";
}

const formSchema = z.object({
  content: z.string().min(1)
});

export function ChatInput({ client, roomId, name, type }: ChatInputProps) {
  const { onOpen } = useModal();
  const router = useRouter();

  // Use Matrix messaging hook instead of axios
  const { sendMessage, isLoading, error, clearError } = useMatrixMessaging({
    client,
    roomId
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { content: "" }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      clearError();
      // Trim content to match discord-clone behavior exactly
      const trimmedContent = values.content.trim();
      if (!trimmedContent) {
        return; // Don't send empty messages
      }
      await sendMessage(trimmedContent);
      form.reset();
      router.refresh();
    } catch (error) {
      console.error('Failed to send message:', error);
      // Form validation will show the error from the hook
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative p-4 pb-6">
                  <button
                    type="button"
                    onClick={() =>
                      onOpen("messageFile", { roomId, client })
                    }
                    className="absolute top-7 left-8 h-[24px] w-[24px] bg-zinc-500 dark:bg-zinc-400 hover:bg-zinc-600 dark:hover:bg-zinc-300 transition rounded-full p-1 flex items-center justify-center"
                    aria-label="Attach file"
                  >
                    <Plus className="text-white dark:text-[#313338]" />
                  </button>
                  <Input
                    placeholder={`Message ${
                      type === "conversation" ? name : "#" + name
                    }`}
                    disabled={isLoading}
                    className="px-14 py-6 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                    {...field}
                  />
                  <div className="absolute top-7 right-8">
                    <EmojiPicker
                      onChange={(emoji: string) =>
                        field.onChange(`${field.value} ${emoji}`)
                      }
                    />
                  </div>
                </div>
              </FormControl>
              {error && (
                <div className="px-4 pb-2">
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}