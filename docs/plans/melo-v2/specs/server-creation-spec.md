# Server Creation Implementation Specification
**Project:** Melo V2  
**Task:** p3-1-b  
**Date:** 2025-01-11  
**Based on:** discord-clone-reference analysis (audit report p3-1-a)  

## Executive Summary

This specification provides a complete implementation guide for creating Discord-style server creation components in Melo V2, based on detailed analysis of discord-clone-reference source code. The spec covers exact JSX patterns, styling, Matrix SDK integration points, and visual verification requirements to achieve pixel-perfect Discord-like appearance.

## Component Architecture Overview

### Primary Components to Implement

1. **InitialModal** (`components/modals/initial-modal.tsx`)
   - Always-open modal for initial server setup
   - Used for first-time user server creation
   - No modal store integration (always visible)

2. **CreateServerModal** (`components/modals/create-server-modal.tsx`)  
   - Modal store managed server creation
   - Used for additional server creation
   - Integrated with existing modal system

### Component Structure Hierarchy

```
Dialog (Radix UI)
├── DialogContent (Main container)
├── DialogHeader (Title + Description)
│   ├── DialogTitle
│   └── DialogDescription  
├── Form (React Hook Form)
│   └── form (HTML element)
│       ├── FormField (Image Upload)
│       │   └── MatrixFileUpload
│       └── FormField (Server Name)
│           └── Input
└── DialogFooter (Action buttons)
    └── Button (Create/Submit)
```

## Discord Reference JSX Patterns

### 1. Initial Modal Structure (Always Open)

**File:** `components/modals/initial-modal.tsx`

```tsx
"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

// Matrix-specific imports (REPLACE axios with Matrix SDK)
import { getClient } from "@/lib/matrix/client";
import { useMatrixAuth } from "@/components/providers/matrix-auth-provider";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// REPLACE: FileUpload with MatrixFileUpload
import { MatrixFileUpload } from "@/components/matrix-file-upload";

const formSchema = z.object({
  name: z.string().min(1, { message: "Server name is required." }),
  imageUrl: z.string().min(1, { message: "Server image is required." })
});

export function InitialModal() {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { session } = useMatrixAuth(); // ADD: Matrix auth context

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: ""
    }
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // REPLACE: axios.post with Matrix space creation logic
      // See "Matrix Integration Points" section below for full implementation
      
      form.reset();
      router.refresh();
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <Dialog open> {/* Always open - no modal store */}
      {/* Content structure - see styling section below */}
    </Dialog>
  );
}
```

### 2. Create Server Modal Structure (Modal Store Managed)

**File:** `components/modals/create-server-modal.tsx`

```tsx
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

// Matrix-specific imports
import { getClient } from "@/lib/matrix/client";
import { useMatrixAuth } from "@/components/providers/matrix-auth-provider";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MatrixFileUpload } from "@/components/matrix-file-upload";
import { useModal } from "@/hooks/use-modal-store";

const formSchema = z.object({
  name: z.string().min(1, { message: "Server name is required." }),
  imageUrl: z.string().min(1, { message: "Server image is required." })
});

export function CreateServerModal() {
  const { isOpen, onClose, type } = useModal();
  const router = useRouter();
  const { session } = useMatrixAuth();

  const isModalOpen = isOpen && type === "createServer";

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: ""
    }
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Matrix space creation logic - see Matrix Integration Points
      
      form.reset();
      router.refresh();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      {/* Content structure - see styling section below */}
    </Dialog>
  );
}
```

## Discord-Style Component Styling

### Core Color Palette (Discord Theme)

```css
/* Primary Discord Colors - EXACT MATCHES */
--discord-background: #313338    /* Main dialog background */
--discord-secondary: #2B2D31     /* Input/footer background */  
--discord-primary: #5865F2       /* Discord blurple button */
--discord-primary-hover: #4752C4 /* Button hover state */

--discord-text-primary: #ffffff  /* Main text color */
--discord-text-secondary: #zinc-400 /* Description text */
--discord-text-muted: #zinc-500  /* Placeholder text */
--discord-text-label: #zinc-300  /* Form labels */
--discord-error: #red-400        /* Error messages */
```

### DialogContent Styling (Main Container)

```tsx
<DialogContent className="bg-[#313338] text-white p-0 overflow-hidden">
```

**Key Requirements:**
- `bg-[#313338]` - Discord's main background color (EXACT hex match)
- `text-white` - White text throughout
- `p-0` - No default padding (content controls its own spacing)
- `overflow-hidden` - Clean borders, no content overflow

### DialogHeader Styling

```tsx
<DialogHeader className="pt-8 px-6">
  <DialogTitle className="text-2xl text-center font-bold text-white">
    Customize your server
  </DialogTitle>
  <DialogDescription className="text-center text-zinc-400">
    Give your server a personality with a name and an image. You can
    always change it later.
  </DialogDescription>
</DialogHeader>
```

**Key Requirements:**
- Header padding: `pt-8 px-6` (top padding 8, horizontal padding 6)
- Title: `text-2xl text-center font-bold text-white`
- Description: `text-center text-zinc-400` (muted secondary text)

### Form Container Styling

```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
    <div className="space-y-8 px-6">
      {/* Form fields go here */}
    </div>
  </form>
</Form>
```

**Key Requirements:**
- Form spacing: `space-y-8` (8-unit vertical spacing between elements)
- Content padding: `px-6` (horizontal padding 6 units)

### File Upload Field Structure

```tsx
<div className="flex items-center justify-center text-center">
  <FormField
    control={form.control}
    name="imageUrl"
    render={({ field }) => (
      <FormItem>
        <FormControl>
          <MatrixFileUpload
            type="image"
            value={field.value}
            onUpload={(mxcUrl) => field.onChange(mxcUrl)}
            onClear={() => field.onChange("")}
            onError={(err) => console.error("Upload error:", err)}
            disabled={isLoading}
            placeholder="Upload server icon"
            maxSize={4 * 1024 * 1024}
          />
        </FormControl>
      </FormItem>
    )}
  />
</div>
```

**Key Requirements:**
- Container: `flex items-center justify-center text-center` (center-aligned)
- File upload integration with Matrix SDK (mxc:// URLs)
- Proper error handling and loading states
- 4MB max file size limit

### Server Name Input Field

```tsx
<FormField
  control={form.control}
  name="name"
  render={({ field }) => (
    <FormItem>
      <FormLabel className="uppercase text-xs font-bold text-zinc-300">
        Server Name
      </FormLabel>
      <FormControl>
        <Input
          disabled={isLoading}
          placeholder="Enter server name"
          className="bg-[#2B2D31] border-0 focus-visible:ring-0 text-white focus-visible:ring-offset-0 placeholder:text-zinc-500"
          {...field}
        />
      </FormControl>
      <FormMessage className="text-red-400" />
    </FormItem>
  )}
/>
```

**Key Requirements:**
- Label styling: `uppercase text-xs font-bold text-zinc-300`
- Input background: `bg-[#2B2D31]` (Discord secondary color)
- Input text: `text-white` with `placeholder:text-zinc-500`
- Focus styling: `border-0 focus-visible:ring-0 focus-visible:ring-offset-0`
- Error message: `text-red-400` for validation errors

### DialogFooter Styling

```tsx
<DialogFooter className="bg-[#2B2D31] px-6 py-4">
  <Button 
    disabled={isLoading} 
    className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
  >
    Create
  </Button>
</DialogFooter>
```

**Key Requirements:**
- Footer background: `bg-[#2B2D31]` (Discord secondary background)
- Footer padding: `px-6 py-4`
- Button colors: Discord blurple (`#5865F2`) with hover (`#4752C4`)
- Button text: `text-white`

## Matrix SDK Integration Points

### Authentication Requirements

```tsx
import { useMatrixAuth } from "@/components/providers/matrix-auth-provider";

const { session } = useMatrixAuth();

// Verify Matrix authentication before server creation
if (!session?.userId) {
  console.error("Matrix authentication required");
  return;
}
```

### Matrix Space Creation Logic

Replace `axios.post("/api/servers", values)` with:

```tsx
const onSubmit = async (values: z.infer<typeof formSchema>) => {
  try {
    const client = getClient();
    if (!client) {
      console.error("Matrix client not initialized");
      return;
    }

    console.log("[CreateServerModal] Creating Matrix space:", values.name);

    // Build initial state events  
    const initialState: any[] = [
      // E2EE is MANDATORY - all rooms must be encrypted
      {
        type: "m.room.encryption",
        state_key: "",
        content: { algorithm: "m.megolm.v1.aes-sha2" }
      },
      // Enable guest access (optional)
      {
        type: "m.room.guest_access",
        state_key: "",
        content: { guest_access: "can_join" }
      },
      // Set history visibility
      {
        type: "m.room.history_visibility", 
        state_key: "",
        content: { history_visibility: "shared" }
      }
    ];

    // Add avatar if uploaded (mxc:// URL)
    if (values.imageUrl) {
      initialState.push({
        type: "m.room.avatar",
        state_key: "",
        content: { url: values.imageUrl }
      });
    }

    // Create a Matrix space (which is like a Discord server)
    const createResult = await client.createRoom({
      name: values.name,
      // Mark as a space (not a regular room)
      creation_content: {
        type: "m.space"
      },
      // Set initial power levels
      power_level_content_override: {
        users_default: 0,
        events_default: 0,
        state_default: 50,
        ban: 50,
        kick: 50,
        redact: 50,
        invite: 0
      },
      // Set visibility
      visibility: "private" as any,
      preset: "private_chat" as any,
      // Initial state events
      initial_state: initialState
    });

    console.log("[CreateServerModal] Space created:", createResult.room_id);

    // Create a default "general" channel within the space
    const generalChannel = await client.createRoom({
      name: "general",
      topic: "General discussion",
      visibility: "private" as any,
      preset: "private_chat" as any,
      initial_state: [
        // E2EE is MANDATORY - all rooms must be encrypted
        {
          type: "m.room.encryption",
          state_key: "",
          content: { algorithm: "m.megolm.v1.aes-sha2" }
        },
        // Link to parent space
        {
          type: "m.space.parent",
          state_key: createResult.room_id,
          content: {
            via: [session?.userId?.split(":")[1] || "matrix.org"],
            canonical: true
          }
        }
      ]
    });

    console.log("[CreateServerModal] General channel created:", generalChannel.room_id);

    // Add the channel to the space
    await client.sendStateEvent(
      createResult.room_id,
      "m.space.child" as any,
      {
        via: [session?.userId?.split(":")[1] || "matrix.org"],
        suggested: true,
        order: "0000"
      },
      generalChannel.room_id
    );

    console.log("[CreateServerModal] Channel linked to space");

    form.reset();
    router.refresh();
    onClose();
  } catch (error) {
    console.error("[CreateServerModal] Error creating server:", error);
  }
};
```

### File Upload Integration

Replace `FileUpload` with `MatrixFileUpload`:

```tsx
// BEFORE (Discord Reference):
<FileUpload
  endpoint="serverImage"
  value={field.value}
  onChange={field.onChange}
/>

// AFTER (Melo V2 Matrix):
<MatrixFileUpload
  type="image"
  value={field.value}
  onUpload={(mxcUrl) => field.onChange(mxcUrl)}
  onClear={() => field.onChange("")}
  onError={(err) => console.error("Upload error:", err)}
  disabled={isLoading}
  placeholder="Upload server icon"
  maxSize={4 * 1024 * 1024}
/>
```

**Key Differences:**
- Matrix uses mxc:// URLs instead of HTTP URLs
- More comprehensive prop interface for error handling
- Direct Matrix homeserver upload integration
- File size limits and validation built-in

### Modal Store Integration

Both modals use the existing modal store system:

```tsx
// For CreateServerModal only (InitialModal is always open)
import { useModal } from "@/hooks/use-modal-store";

const { isOpen, onClose, type } = useModal();
const isModalOpen = isOpen && type === "createServer";

// Modal trigger elsewhere in app:
const { onOpen } = useModal();
onOpen("createServer"); // Triggers modal display
```

## Component Comparison Summary

### Reference vs Melo V2 Key Differences

| Aspect | Discord Reference | Melo V2 Implementation |
|--------|------------------|-------------------------|
| **Theme** | Light theme (`bg-white text-black`) | Dark theme (`bg-[#313338] text-white`) |
| **Input Background** | `bg-zinc-300/50` (light) | `bg-[#2B2D31]` (dark) |
| **Footer Background** | `bg-gray-100` (light) | `bg-[#2B2D31]` (dark) |
| **Button Style** | `variant="primary"` | `bg-[#5865F2] hover:bg-[#4752C4]` |
| **Error Text** | Default red | `text-red-400` |
| **Label Style** | `text-zinc-500 dark:text-secondary/70` | `text-zinc-300` |
| **Backend** | `axios.post("/api/servers")` | Matrix SDK space creation |
| **File Upload** | `FileUpload` component | `MatrixFileUpload` component |
| **Authentication** | Not shown | `useMatrixAuth()` required |

### Critical Integration Points

1. **File Upload System**
   - MUST use `MatrixFileUpload` instead of `FileUpload`
   - Handle mxc:// URLs instead of HTTP URLs
   - Integrate with Matrix homeserver upload API

2. **Backend API Integration**  
   - MUST replace `axios.post` with Matrix client space creation
   - Create Matrix space with proper room hierarchy
   - Set up default general channel with parent/child relationships

3. **Authentication**
   - MUST verify Matrix session before server creation
   - Use `useMatrixAuth()` hook for session management
   - Handle authentication errors gracefully

## Visual Verification Checklist

### Layout & Structure
- [ ] Dialog opens centered on screen with proper backdrop
- [ ] Header contains centered title and description
- [ ] Form fields are vertically spaced with 8-unit gaps
- [ ] Footer contains right-aligned Create button
- [ ] File upload area is centered above text input

### Color Verification
- [ ] Dialog background: `#313338` (Discord main background)
- [ ] Input/footer background: `#2B2D31` (Discord secondary)
- [ ] Button background: `#5865F2` (Discord blurple)
- [ ] Button hover: `#4752C4` (darker blurple)
- [ ] Primary text: white (`#ffffff`)
- [ ] Description text: `zinc-400` (muted)
- [ ] Label text: `zinc-300` 
- [ ] Placeholder text: `zinc-500`
- [ ] Error text: `red-400`

### Typography Verification
- [ ] Title: 2xl, center, bold, white
- [ ] Description: center, zinc-400
- [ ] Label: uppercase, xs, bold, zinc-300
- [ ] Input text: white with proper placeholder styling
- [ ] Button text: white, proper weight

### Interactive Elements
- [ ] File upload component shows proper placeholder
- [ ] File upload displays selected image preview
- [ ] Input field accepts typing with white text
- [ ] Input placeholder shows muted text
- [ ] Button shows loading state when submitting
- [ ] Button hover effect works (color change)
- [ ] Form validation shows error messages in red-400
- [ ] Modal closes properly via X button or outside click

### Functional Testing
- [ ] Form validation prevents empty submissions
- [ ] Matrix authentication is verified before creation
- [ ] File uploads result in mxc:// URLs
- [ ] Server creation triggers Matrix space creation
- [ ] Default "general" channel is created and linked
- [ ] Success state navigates properly and closes modal
- [ ] Error handling shows appropriate messages
- [ ] Modal state resets on close

## Build Validation

### TypeScript Compilation
```bash
cd ~/repos/melo
pnpm build
```
**Expected Result:** Build completes with exit code 0, no TypeScript errors

### Runtime Testing
1. Start development server: `pnpm dev`
2. Test modal opening via trigger button
3. Test form submission with valid/invalid data
4. Verify Matrix space creation in homeserver
5. Confirm general channel creation and linking

## Implementation Notes

### Dependencies Required

```json
{
  "dependencies": {
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^3.x", 
    "zod": "^3.x",
    "@radix-ui/react-dialog": "^1.x"
  }
}
```

### Import Statements Checklist

```tsx
// Core React & Form
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

// Matrix Integration
import { getClient } from "@/lib/matrix/client";
import { useMatrixAuth } from "@/components/providers/matrix-auth-provider";

// UI Components  
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MatrixFileUpload } from "@/components/matrix-file-upload";

// Modal Management (CreateServerModal only)
import { useModal } from "@/hooks/use-modal-store";
```

### Common Implementation Pitfalls

1. **Color Values**: Use exact hex values (`#313338`, `#2B2D31`) not Tailwind approximations
2. **File Upload**: Don't forget to handle mxc:// URL format properly
3. **Matrix Authentication**: Always verify session before Matrix operations
4. **Space Creation**: Include mandatory encryption and proper room hierarchy
5. **Error Handling**: Display user-friendly errors, not just console.log
6. **Modal State**: Reset form state when modal closes
7. **Button Styling**: Use specific Discord colors, not generic variants

## Acceptance Criteria

### Functional Requirements
- [ ] Modal opens and closes properly
- [ ] Form validation works with appropriate error messages
- [ ] File upload integrates with Matrix homeserver
- [ ] Server creation results in Matrix space with general channel
- [ ] Success flow navigates correctly and provides feedback
- [ ] Error handling shows meaningful messages to users

### Visual Requirements  
- [ ] Exact Discord color palette implementation
- [ ] Proper spacing and typography matching reference
- [ ] Dark theme consistency throughout component
- [ ] Responsive design works on mobile devices
- [ ] Loading states and disabled states styled properly
- [ ] Form validation errors displayed with correct styling

### Integration Requirements
- [ ] Matrix SDK integration for space creation
- [ ] Authentication verification via useMatrixAuth
- [ ] Modal store integration (CreateServerModal only)
- [ ] File upload via MatrixFileUpload component
- [ ] Proper TypeScript typing throughout
- [ ] Build passes without errors or warnings

---

**Implementation Priority:** HIGH  
**Complexity:** Medium-High (Matrix integration complexity)  
**Visual Accuracy:** Critical (Must match Discord styling exactly)  
**Testing Requirements:** Comprehensive (Both visual and functional testing required)