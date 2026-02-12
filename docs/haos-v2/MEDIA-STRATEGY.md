# HAOS v2 Media Strategy: UploadThing → Matrix Content API

> **Audit Task:** `audit-05-media-strategy`  
> **Date:** 2025-02-11  
> **Source:** `/home/ubuntu/repos/discord-clone-reference`

This document details the migration strategy from UploadThing to Matrix Content Repository API for all file upload functionality in HAOS v2.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current UploadThing Usage](#2-current-uploadthing-usage)
3. [Matrix Content API Overview](#3-matrix-content-api-overview)
4. [Migration Mapping](#4-migration-mapping)
5. [Implementation Guide](#5-implementation-guide)
6. [Security Considerations](#6-security-considerations)
7. [File Handling Specifications](#7-file-handling-specifications)
8. [Code Examples](#8-code-examples)
9. [UI Components](#9-ui-components)
10. [Testing Strategy](#10-testing-strategy)

---

## 1. Executive Summary

### Current State (Discord Clone)
- **UploadThing** handles all file uploads via `@uploadthing/react` package
- Two upload endpoints: `serverImage` (server avatars) and `messageFile` (attachments)
- Files stored on UploadThing's CDN, URLs stored in Prisma database
- Next.js Image component configured for `uploadthing.com` domain

### Target State (HAOS v2)
- **Matrix Content Repository** handles all file uploads
- Files stored on Matrix homeserver, referenced via `mxc://` URLs
- Native thumbnail generation by Matrix server
- Federated media access across homeservers
- No third-party service dependency

### Key Benefits
| Aspect | UploadThing | Matrix Content API |
|--------|-------------|-------------------|
| **Dependency** | Third-party SaaS | Self-hosted |
| **Federation** | No | Yes |
| **Thumbnails** | Manual | Server-generated |
| **Authentication** | Custom auth middleware | Matrix access token |
| **Cost** | Usage-based pricing | Server storage only |
| **GDPR** | Data on third-party | Full control |

---

## 2. Current UploadThing Usage

### 2.1 Package Dependencies

```json
// package.json
{
  "dependencies": {
    "@uploadthing/react": "^5.3.0",
    "uploadthing": "^5.3.3"
  }
}
```

### 2.2 File Router Configuration

**Location:** `/app/api/uploadthing/core.ts`

```typescript
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs";

const f = createUploadthing();

const handleAuth = () => {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized!");
  return { userId };
};

export const ourFileRouter = {
  // Server/Space avatar images
  serverImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {
      console.log("Server Image Upload Completed.");
    }),
  
  // Message attachments (images + PDFs)
  messageFile: f(["image", "pdf"])
    .middleware(() => handleAuth())
    .onUploadComplete(() => {
      console.log("Message File Upload Completed.");
    })
} satisfies FileRouter;
```

### 2.3 Upload Component

**Location:** `/components/file-upload.tsx`

```typescript
"use client";

import { UploadDropzone } from "@/lib/uploadthing";

interface FileUploadProps {
  onChange: (url?: string) => void;
  value: string;
  endpoint: "messageFile" | "serverImage";
}

export function FileUpload({ onChange, value, endpoint }: FileUploadProps) {
  // Displays uploaded image preview or PDF link
  // Uses UploadDropzone for upload UI
  // Calls onChange with the returned URL
}
```

### 2.4 Usage Locations

| Component | Upload Type | Use Case |
|-----------|-------------|----------|
| `InitialModal` | `serverImage` | First server creation |
| `CreateServerModal` | `serverImage` | New server avatar |
| `EditServerModal` | `serverImage` | Update server avatar |
| `MessageFileModal` | `messageFile` | Send file attachments |

### 2.5 Database Schema (How URLs Are Stored)

```prisma
model Profile {
  imageUrl String @db.Text  // From Clerk, not UploadThing
}

model Server {
  imageUrl String @db.Text  // UploadThing URL
}

model Message {
  fileUrl String? @db.Text  // UploadThing URL (optional)
}

model DirectMessage {
  fileUrl String? @db.Text  // UploadThing URL (optional)
}
```

### 2.6 Next.js Configuration

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ["uploadthing.com"]
  }
};
```

---

## 3. Matrix Content API Overview

### 3.1 Core Concepts

#### MXC URIs
Matrix uses `mxc://` URIs to reference media:
```
mxc://server-name/media-id
mxc://matrix.example.com/SEsfnsuifSDFSSEF
```

These are **not** directly usable in browsers. They must be converted to HTTP URLs through the homeserver's media endpoint.

#### Endpoints Summary

| Endpoint | Purpose | Authentication |
|----------|---------|----------------|
| `POST /_matrix/media/v3/upload` | Upload media | Required |
| `PUT /_matrix/media/v3/upload/{serverName}/{mediaId}` | Upload to pre-created media ID | Required |
| `POST /_matrix/media/v1/create` | Create media ID before upload | Required |
| `GET /_matrix/client/v1/media/download/{serverName}/{mediaId}` | Download media | Required |
| `GET /_matrix/client/v1/media/thumbnail/{serverName}/{mediaId}` | Get thumbnail | Required |
| `GET /_matrix/client/v1/media/config` | Get server limits | Required |

### 3.2 Upload Flow

```
┌──────────┐     POST /upload      ┌─────────────────┐
│  Client  │ ──────────────────► │  Homeserver     │
│          │  Content-Type: */*   │                 │
│          │  Authorization:      │  Stores media   │
│          │    Bearer {token}    │  Returns mxc:// │
└──────────┘                       └─────────────────┘
     │
     │ Response: { "content_uri": "mxc://server/mediaid" }
     │
     ▼
┌──────────────────────────────────────────────────────┐
│  Store mxc:// URL in room state or message content   │
└──────────────────────────────────────────────────────┘
```

### 3.3 Download/Display Flow

```
┌──────────┐  GET /thumbnail/{server}/{id}  ┌──────────────┐
│  Client  │ ─────────────────────────────► │  Homeserver  │
│          │  ?width=96&height=96           │              │
│          │  Authorization: Bearer {token} │  Generates   │
│          │ ◄───────────────────────────── │  thumbnail   │
└──────────┘       Binary image data        └──────────────┘
```

### 3.4 API Endpoints Detail

#### Upload Media
```http
POST /_matrix/media/v3/upload HTTP/1.1
Host: matrix.example.com
Authorization: Bearer {access_token}
Content-Type: image/png
Content-Length: 12345

<binary data>
```

Response:
```json
{
  "content_uri": "mxc://matrix.example.com/AQwafuaFswefuhsfAFAgsw"
}
```

#### Download Media (Authenticated - v1.11+)
```http
GET /_matrix/client/v1/media/download/{serverName}/{mediaId} HTTP/1.1
Host: matrix.example.com
Authorization: Bearer {access_token}
```

#### Get Thumbnail (Authenticated - v1.11+)
```http
GET /_matrix/client/v1/media/thumbnail/{serverName}/{mediaId} HTTP/1.1
Host: matrix.example.com
Authorization: Bearer {access_token}
```

Query parameters:
| Parameter | Description | Values |
|-----------|-------------|--------|
| `width` | Desired width | Integer |
| `height` | Desired height | Integer |
| `method` | Resize method | `crop` or `scale` |
| `animated` | Allow animated | `true` or `false` |

#### Get Server Config
```http
GET /_matrix/client/v1/media/config HTTP/1.1
Host: matrix.example.com
Authorization: Bearer {access_token}
```

Response:
```json
{
  "m.upload.size": 52428800
}
```

---

## 4. Migration Mapping

### 4.1 Upload Type Mapping

| UploadThing Endpoint | Matrix Equivalent | Notes |
|---------------------|-------------------|-------|
| `serverImage` | `/_matrix/media/v3/upload` | Store mxc:// in space state event |
| `messageFile` | `/_matrix/media/v3/upload` | Reference in `m.room.message` event |

### 4.2 URL Storage Migration

| Entity | Current (Prisma) | Target (Matrix) |
|--------|------------------|-----------------|
| Profile avatar | `Profile.imageUrl` (Clerk URL) | `m.room.avatar` on user's presence OR `avatar_url` in user profile |
| Server avatar | `Server.imageUrl` | `m.room.avatar` state event on Space |
| Message attachment | `Message.fileUrl` | `m.room.message` event with `m.file`/`m.image` content |
| DM attachment | `DirectMessage.fileUrl` | `m.room.message` event in DM room |

### 4.3 Feature Mapping

| UploadThing Feature | Matrix Equivalent |
|--------------------|-------------------|
| Max file size: 4MB (serverImage) | `m.upload.size` config + client validation |
| Image-only validation | Content-Type validation before upload |
| Multiple file types (messageFile) | Content-Type check (image/*, application/pdf) |
| Upload progress | XHR/fetch progress events (client-side) |
| Dropzone UI | Custom component with drag-and-drop |

---

## 5. Implementation Guide

### 5.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           HAOS Media Layer                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────┐     ┌──────────────────────────────────┐       │
│  │   MediaUploader     │────►│  Matrix Client (matrix-js-sdk)   │       │
│  │   Component         │     │  - uploadContent()               │       │
│  └─────────────────────┘     │  - getHttpUriForMxcUri()         │       │
│           │                  └──────────────────────────────────┘       │
│           │                               │                              │
│           ▼                               ▼                              │
│  ┌─────────────────────┐     ┌──────────────────────────────────┐       │
│  │  useMediaUpload     │     │  Synapse Homeserver              │       │
│  │  Hook               │     │  /_matrix/media/v3/*             │       │
│  │  - progress         │     │  /_matrix/client/v1/media/*      │       │
│  │  - upload()         │     └──────────────────────────────────┘       │
│  │  - cancel()         │                                                │
│  └─────────────────────┘                                                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Matrix JS SDK Methods

```typescript
import { MatrixClient } from "matrix-js-sdk";

// Upload content
const mxcUrl = await client.uploadContent(
  file,                          // File or Blob
  {
    name: file.name,             // Optional filename
    type: file.type,             // MIME type
    progressHandler: (progress) => {
      // progress.loaded / progress.total
    },
    onlyContentUri: true         // Return just mxc:// string
  }
);

// Convert mxc:// to HTTP URL for display
const httpUrl = client.mxcUrlToHttp(
  mxcUrl,
  width,    // Thumbnail width (optional)
  height,   // Thumbnail height (optional)
  method,   // "scale" or "crop" (optional)
  allowDirectLinks  // boolean (optional)
);

// Get upload limits
const config = await client.getMediaConfig();
// { "m.upload.size": 52428800 }
```

### 5.3 Server Avatar Upload

```typescript
// When creating/editing a Space (Server)
async function uploadServerAvatar(
  client: MatrixClient,
  spaceId: string,
  file: File
): Promise<string> {
  // 1. Validate file
  if (!file.type.startsWith("image/")) {
    throw new Error("Only images are allowed for server avatars");
  }
  if (file.size > 4 * 1024 * 1024) {  // 4MB limit
    throw new Error("Image must be smaller than 4MB");
  }

  // 2. Upload to Matrix
  const mxcUrl = await client.uploadContent(file, {
    name: file.name,
    type: file.type,
    onlyContentUri: true
  });

  // 3. Set as room avatar
  await client.sendStateEvent(
    spaceId,
    "m.room.avatar",
    { url: mxcUrl },
    ""  // state_key
  );

  return mxcUrl;
}
```

### 5.4 Message Attachment Upload

```typescript
// When sending a file message
async function sendFileMessage(
  client: MatrixClient,
  roomId: string,
  file: File
): Promise<void> {
  // 1. Upload file
  const mxcUrl = await client.uploadContent(file, {
    name: file.name,
    type: file.type,
    onlyContentUri: true
  });

  // 2. Determine message type
  const isImage = file.type.startsWith("image/");
  const msgtype = isImage ? "m.image" : "m.file";

  // 3. Build content
  const content: any = {
    body: file.name,
    msgtype,
    url: mxcUrl,
    info: {
      mimetype: file.type,
      size: file.size
    }
  };

  // 4. Add image dimensions if applicable
  if (isImage) {
    const dimensions = await getImageDimensions(file);
    content.info.w = dimensions.width;
    content.info.h = dimensions.height;
    
    // Generate thumbnail for large images
    if (file.size > 100 * 1024) {  // > 100KB
      const thumbnail = await generateThumbnail(file);
      const thumbMxc = await client.uploadContent(thumbnail.blob, {
        name: `thumb_${file.name}`,
        type: thumbnail.type,
        onlyContentUri: true
      });
      content.info.thumbnail_url = thumbMxc;
      content.info.thumbnail_info = {
        w: thumbnail.width,
        h: thumbnail.height,
        mimetype: thumbnail.type,
        size: thumbnail.size
      };
    }
  }

  // 5. Send message event
  await client.sendMessage(roomId, content);
}
```

### 5.5 User Avatar Upload

```typescript
// For user profile avatar
async function uploadUserAvatar(
  client: MatrixClient,
  file: File
): Promise<string> {
  // 1. Upload to Matrix
  const mxcUrl = await client.uploadContent(file, {
    name: file.name,
    type: file.type,
    onlyContentUri: true
  });

  // 2. Set as profile avatar
  await client.setAvatarUrl(mxcUrl);

  return mxcUrl;
}
```

---

## 6. Security Considerations

### 6.1 Authentication Requirements

**Matrix v1.11+ (Authenticated Media)**

Starting with Matrix spec v1.11, media endpoints require authentication:

```http
GET /_matrix/client/v1/media/download/{serverName}/{mediaId}
Authorization: Bearer {access_token}
```

This is a security improvement over the legacy unauthenticated endpoints.

**For HAOS v2:** Always use the authenticated `/client/v1/media/*` endpoints.

### 6.2 Content Validation

```typescript
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml"  // Consider security implications
];

const ALLOWED_ATTACHMENT_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  "application/pdf",
  "text/plain",
  "application/zip"
];

function validateFile(
  file: File,
  allowedTypes: string[],
  maxSizeBytes: number
): { valid: boolean; error?: string } {
  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `File type ${file.type} not allowed` 
    };
  }

  // Check file size
  if (file.size > maxSizeBytes) {
    return { 
      valid: false, 
      error: `File too large (max ${maxSizeBytes / 1024 / 1024}MB)` 
    };
  }

  // Additional: Check magic bytes for images
  // (To prevent MIME type spoofing)
  
  return { valid: true };
}
```

### 6.3 Content Security Policy

For Next.js, configure CSP headers to allow Matrix media:

```typescript
// next.config.js
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: `
      img-src 'self' blob: data: https://${process.env.MATRIX_SERVER_NAME};
      media-src 'self' blob: https://${process.env.MATRIX_SERVER_NAME};
    `.replace(/\n/g, "")
  }
];
```

### 6.4 Image Domains (Next.js)

```javascript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.MATRIX_SERVER_NAME,
        pathname: "/_matrix/client/v1/media/**"
      },
      // For federated content (other homeservers)
      {
        protocol: "https",
        hostname: "**",
        pathname: "/_matrix/client/v1/media/**"
      }
    ]
  }
};
```

### 6.5 Rate Limiting

Matrix homeservers typically rate-limit uploads. Handle this gracefully:

```typescript
async function uploadWithRetry(
  client: MatrixClient,
  file: File,
  maxRetries = 3
): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await client.uploadContent(file, { onlyContentUri: true });
    } catch (error: any) {
      if (error.errcode === "M_LIMIT_EXCEEDED") {
        const retryAfter = error.retry_after_ms || 5000;
        await sleep(retryAfter);
        continue;
      }
      throw error;
    }
  }
  throw new Error("Upload failed after max retries");
}
```

---

## 7. File Handling Specifications

### 7.1 Size Limits

| Upload Type | UploadThing Limit | HAOS Recommended | Matrix Default |
|-------------|-------------------|------------------|----------------|
| Server Avatar | 4MB | 4MB | 50MB (configurable) |
| Message Image | Unlimited | 10MB | 50MB |
| Message PDF | Unlimited | 25MB | 50MB |
| Any Attachment | N/A | 50MB | 50MB |

Configure Synapse limits in `homeserver.yaml`:
```yaml
max_upload_size: 50M
```

### 7.2 Allowed File Types

#### Server Images
```typescript
const SERVER_IMAGE_TYPES = [
  "image/jpeg",
  "image/png", 
  "image/gif",
  "image/webp"
];
```

#### Message Attachments
```typescript
const MESSAGE_ATTACHMENT_TYPES = [
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  // Documents
  "application/pdf",
  "text/plain",
  // Archives (optional)
  "application/zip",
  "application/x-tar",
  "application/gzip"
];
```

### 7.3 Thumbnail Specifications

Matrix servers generate thumbnails automatically. Recommended sizes:

| Use Case | Width | Height | Method |
|----------|-------|--------|--------|
| Avatar preview | 96 | 96 | crop |
| Avatar full | 256 | 256 | crop |
| Image preview | 320 | 240 | scale |
| Image medium | 640 | 480 | scale |
| Image large | 1024 | 768 | scale |

---

## 8. Code Examples

### 8.1 Media Upload Hook

```typescript
// hooks/useMediaUpload.ts
import { useState, useCallback, useRef } from "react";
import { useMatrix } from "@/providers/matrix-provider";

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UseMediaUploadOptions {
  allowedTypes?: string[];
  maxSizeBytes?: number;
  onProgress?: (progress: UploadProgress) => void;
}

interface UseMediaUploadResult {
  upload: (file: File) => Promise<string>;
  cancel: () => void;
  isUploading: boolean;
  progress: UploadProgress | null;
  error: string | null;
}

export function useMediaUpload(
  options: UseMediaUploadOptions = {}
): UseMediaUploadResult {
  const { client } = useMatrix();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortController = useRef<AbortController | null>(null);

  const {
    allowedTypes,
    maxSizeBytes = 50 * 1024 * 1024, // 50MB default
    onProgress
  } = options;

  const upload = useCallback(async (file: File): Promise<string> => {
    setError(null);
    
    // Validate file type
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      const err = `File type "${file.type}" not allowed`;
      setError(err);
      throw new Error(err);
    }

    // Validate file size
    if (file.size > maxSizeBytes) {
      const err = `File too large (max ${maxSizeBytes / 1024 / 1024}MB)`;
      setError(err);
      throw new Error(err);
    }

    setIsUploading(true);
    setProgress({ loaded: 0, total: file.size, percentage: 0 });
    abortController.current = new AbortController();

    try {
      const mxcUrl = await client.uploadContent(file, {
        name: file.name,
        type: file.type,
        onlyContentUri: true,
        progressHandler: (p) => {
          const prog = {
            loaded: p.loaded,
            total: p.total,
            percentage: Math.round((p.loaded / p.total) * 100)
          };
          setProgress(prog);
          onProgress?.(prog);
        },
        abortController: abortController.current
      });

      return mxcUrl;
    } catch (err: any) {
      if (err.name === "AbortError") {
        setError("Upload cancelled");
      } else {
        setError(err.message || "Upload failed");
      }
      throw err;
    } finally {
      setIsUploading(false);
      abortController.current = null;
    }
  }, [client, allowedTypes, maxSizeBytes, onProgress]);

  const cancel = useCallback(() => {
    abortController.current?.abort();
  }, []);

  return {
    upload,
    cancel,
    isUploading,
    progress,
    error
  };
}
```

### 8.2 MXC URL Converter Hook

```typescript
// hooks/useMxcUrl.ts
import { useMemo } from "react";
import { useMatrix } from "@/providers/matrix-provider";

interface MxcUrlOptions {
  width?: number;
  height?: number;
  method?: "crop" | "scale";
  allowDirectLinks?: boolean;
}

export function useMxcUrl(
  mxcUrl: string | null | undefined,
  options: MxcUrlOptions = {}
): string | null {
  const { client } = useMatrix();
  const { width, height, method = "scale", allowDirectLinks = false } = options;

  return useMemo(() => {
    if (!mxcUrl || !client) return null;
    
    // Validate mxc:// format
    if (!mxcUrl.startsWith("mxc://")) {
      console.warn("Invalid mxc URL:", mxcUrl);
      return null;
    }

    try {
      return client.mxcUrlToHttp(
        mxcUrl,
        width,
        height,
        method,
        allowDirectLinks
      );
    } catch (err) {
      console.error("Failed to convert mxc URL:", err);
      return null;
    }
  }, [mxcUrl, client, width, height, method, allowDirectLinks]);
}
```

### 8.3 Matrix Image Component

```typescript
// components/matrix-image.tsx
"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import { useMxcUrl } from "@/hooks/useMxcUrl";
import { cn } from "@/lib/utils";

interface MatrixImageProps extends Omit<ImageProps, "src"> {
  mxcUrl: string | null | undefined;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  thumbnailMethod?: "crop" | "scale";
  fallback?: React.ReactNode;
}

export function MatrixImage({
  mxcUrl,
  thumbnailWidth,
  thumbnailHeight,
  thumbnailMethod = "scale",
  fallback,
  className,
  alt,
  ...props
}: MatrixImageProps) {
  const [error, setError] = useState(false);
  
  const httpUrl = useMxcUrl(mxcUrl, {
    width: thumbnailWidth,
    height: thumbnailHeight,
    method: thumbnailMethod
  });

  if (!httpUrl || error) {
    if (fallback) return <>{fallback}</>;
    return (
      <div 
        className={cn(
          "bg-muted flex items-center justify-center",
          className
        )}
        style={{ width: props.width, height: props.height }}
      >
        <span className="text-muted-foreground text-xs">No image</span>
      </div>
    );
  }

  return (
    <Image
      {...props}
      src={httpUrl}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}
```

### 8.4 File Upload Component

```typescript
// components/file-upload.tsx
"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileIcon, ImageIcon, X, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { MatrixImage } from "./matrix-image";

const SERVER_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp"
];

const MESSAGE_FILE_TYPES = [
  ...SERVER_IMAGE_TYPES,
  "application/pdf"
];

interface FileUploadProps {
  value: string;  // mxc:// URL
  onChange: (url: string) => void;
  endpoint: "serverImage" | "messageFile";
  disabled?: boolean;
}

export function FileUpload({
  value,
  onChange,
  endpoint,
  disabled
}: FileUploadProps) {
  const allowedTypes = endpoint === "serverImage" 
    ? SERVER_IMAGE_TYPES 
    : MESSAGE_FILE_TYPES;
  
  const maxSize = endpoint === "serverImage"
    ? 4 * 1024 * 1024   // 4MB
    : 25 * 1024 * 1024; // 25MB

  const { upload, cancel, isUploading, progress, error } = useMediaUpload({
    allowedTypes,
    maxSizeBytes: maxSize
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      const mxcUrl = await upload(file);
      onChange(mxcUrl);
    } catch (err) {
      // Error is handled by the hook
      console.error("Upload failed:", err);
    }
  }, [upload, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: allowedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxFiles: 1,
    maxSize,
    disabled: disabled || isUploading
  });

  // Display uploaded content
  if (value) {
    const isImage = !value.includes(".pdf"); // Simplified check
    
    if (isImage) {
      return (
        <div className="relative h-20 w-20">
          <MatrixImage
            mxcUrl={value}
            fill
            thumbnailWidth={96}
            thumbnailHeight={96}
            thumbnailMethod="crop"
            alt="Uploaded image"
            className="rounded-full object-cover"
          />
          <button
            onClick={() => onChange("")}
            disabled={disabled}
            className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full shadow-sm hover:bg-rose-600 disabled:opacity-50"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      );
    }

    // PDF display
    return (
      <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
        <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
        <span className="ml-2 text-sm text-indigo-500 truncate max-w-[200px]">
          Uploaded file
        </span>
        <button
          onClick={() => onChange("")}
          disabled={disabled}
          className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full shadow-sm hover:bg-rose-600 disabled:opacity-50"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // Upload dropzone
  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition cursor-pointer",
        isDragActive && "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20",
        isUploading && "pointer-events-none opacity-60",
        error && "border-rose-500",
        !isDragActive && !error && "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400"
      )}
    >
      <input {...getInputProps()} />
      
      {isUploading ? (
        <>
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
          <p className="mt-2 text-sm text-zinc-500">
            Uploading... {progress?.percentage}%
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              cancel();
            }}
            className="mt-2 text-xs text-rose-500 hover:text-rose-600"
            type="button"
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          {endpoint === "serverImage" ? (
            <ImageIcon className="h-10 w-10 text-zinc-400" />
          ) : (
            <Upload className="h-10 w-10 text-zinc-400" />
          )}
          <p className="mt-2 text-sm text-zinc-500">
            {isDragActive ? "Drop the file here" : "Click or drag to upload"}
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            {endpoint === "serverImage" 
              ? "Image only (max 4MB)"
              : "Image or PDF (max 25MB)"
            }
          </p>
        </>
      )}
      
      {error && (
        <p className="absolute bottom-1 text-xs text-rose-500">{error}</p>
      )}
    </div>
  );
}
```

### 8.5 Matrix Message Content Types

```typescript
// types/matrix-message.ts

// Image message content
interface ImageMessageContent {
  msgtype: "m.image";
  body: string;  // Filename as fallback
  url: string;   // mxc:// URL
  info?: {
    h: number;           // Height in pixels
    w: number;           // Width in pixels
    mimetype: string;    // e.g., "image/png"
    size: number;        // Size in bytes
    thumbnail_url?: string;       // mxc:// thumbnail
    thumbnail_info?: {
      h: number;
      w: number;
      mimetype: string;
      size: number;
    };
  };
}

// File message content
interface FileMessageContent {
  msgtype: "m.file";
  body: string;  // Filename
  url: string;   // mxc:// URL
  filename?: string;
  info?: {
    mimetype: string;
    size: number;
  };
}

// Video message content (for future use)
interface VideoMessageContent {
  msgtype: "m.video";
  body: string;
  url: string;
  info?: {
    h: number;
    w: number;
    duration: number;  // Milliseconds
    mimetype: string;
    size: number;
    thumbnail_url?: string;
    thumbnail_info?: object;
  };
}

// Audio message content (for future use)  
interface AudioMessageContent {
  msgtype: "m.audio";
  body: string;
  url: string;
  info?: {
    duration: number;
    mimetype: string;
    size: number;
  };
}

export type MediaMessageContent = 
  | ImageMessageContent 
  | FileMessageContent
  | VideoMessageContent
  | AudioMessageContent;
```

---

## 9. UI Components

### 9.1 Component Migration Map

| UploadThing Component | HAOS Component | Notes |
|----------------------|----------------|-------|
| `UploadDropzone` | `FileUpload` | Custom implementation |
| `UploadButton` | Not needed | Use dropzone instead |
| CSS (`@uploadthing/react/styles.css`) | Tailwind classes | Custom styling |

### 9.2 Server Avatar Display

```typescript
// components/server-avatar.tsx
import { MatrixImage } from "./matrix-image";

interface ServerAvatarProps {
  mxcUrl: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { px: 32, thumb: 48 },
  md: { px: 48, thumb: 64 },
  lg: { px: 96, thumb: 128 }
};

export function ServerAvatar({ mxcUrl, name, size = "md" }: ServerAvatarProps) {
  const { px, thumb } = sizes[size];
  
  return (
    <div 
      className="relative overflow-hidden rounded-full"
      style={{ width: px, height: px }}
    >
      {mxcUrl ? (
        <MatrixImage
          mxcUrl={mxcUrl}
          fill
          thumbnailWidth={thumb}
          thumbnailHeight={thumb}
          thumbnailMethod="crop"
          alt={name}
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}
```

### 9.3 Message Attachment Display

```typescript
// components/message-attachment.tsx
import { Download, FileIcon, ExternalLink } from "lucide-react";
import { MatrixImage } from "./matrix-image";
import { useMxcUrl } from "@/hooks/useMxcUrl";
import { MediaMessageContent } from "@/types/matrix-message";

interface MessageAttachmentProps {
  content: MediaMessageContent;
}

export function MessageAttachment({ content }: MessageAttachmentProps) {
  const downloadUrl = useMxcUrl(content.url);

  if (content.msgtype === "m.image") {
    return (
      <div className="mt-2 max-w-md">
        <a 
          href={downloadUrl ?? "#"} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block rounded-lg overflow-hidden hover:opacity-90 transition"
        >
          <MatrixImage
            mxcUrl={content.url}
            width={content.info?.w ?? 400}
            height={content.info?.h ?? 300}
            thumbnailWidth={640}
            thumbnailHeight={480}
            thumbnailMethod="scale"
            alt={content.body}
            className="max-h-[300px] w-auto object-contain"
          />
        </a>
      </div>
    );
  }

  // File attachment (PDF, etc.)
  return (
    <div className="mt-2 flex items-center gap-3 p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 max-w-sm">
      <FileIcon className="h-8 w-8 text-indigo-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{content.body}</p>
        {content.info?.size && (
          <p className="text-xs text-zinc-500">
            {formatBytes(content.info.size)}
          </p>
        )}
      </div>
      <a
        href={downloadUrl ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition"
        title="Download"
      >
        <Download className="h-4 w-4" />
      </a>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
```

---

## 10. Testing Strategy

### 10.1 Unit Tests

```typescript
// __tests__/hooks/useMediaUpload.test.ts
import { renderHook, act } from "@testing-library/react";
import { useMediaUpload } from "@/hooks/useMediaUpload";

describe("useMediaUpload", () => {
  it("should validate file type", async () => {
    const { result } = renderHook(() => 
      useMediaUpload({ allowedTypes: ["image/png"] })
    );

    const invalidFile = new File(["test"], "test.pdf", { 
      type: "application/pdf" 
    });

    await expect(result.current.upload(invalidFile))
      .rejects.toThrow("not allowed");
  });

  it("should validate file size", async () => {
    const { result } = renderHook(() => 
      useMediaUpload({ maxSizeBytes: 1000 })
    );

    const largeFile = new File(["x".repeat(2000)], "large.png", { 
      type: "image/png" 
    });

    await expect(result.current.upload(largeFile))
      .rejects.toThrow("too large");
  });

  it("should track upload progress", async () => {
    const onProgress = jest.fn();
    const { result } = renderHook(() => 
      useMediaUpload({ onProgress })
    );

    const file = new File(["test"], "test.png", { type: "image/png" });
    
    // Mock client upload...
    await act(async () => {
      await result.current.upload(file);
    });

    expect(onProgress).toHaveBeenCalled();
  });
});
```

### 10.2 Integration Tests

```typescript
// __tests__/integration/media-upload.test.ts
import { createTestClient, uploadTestFile } from "@/test-utils/matrix";

describe("Matrix Media Upload", () => {
  let client: MatrixClient;

  beforeAll(async () => {
    client = await createTestClient();
  });

  it("should upload an image and return mxc:// URL", async () => {
    const testImage = await fetch("/test-fixtures/test-image.png")
      .then(r => r.blob());

    const mxcUrl = await client.uploadContent(testImage, {
      name: "test.png",
      type: "image/png",
      onlyContentUri: true
    });

    expect(mxcUrl).toMatch(/^mxc:\/\//);
  });

  it("should convert mxc:// to HTTP URL", async () => {
    const mxcUrl = "mxc://example.com/test123";
    const httpUrl = client.mxcUrlToHttp(mxcUrl, 96, 96, "crop");

    expect(httpUrl).toContain("/_matrix/client/v1/media/thumbnail");
    expect(httpUrl).toContain("width=96");
    expect(httpUrl).toContain("height=96");
  });
});
```

### 10.3 E2E Tests

```typescript
// e2e/media-upload.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Media Upload", () => {
  test("should upload server avatar", async ({ page }) => {
    await page.goto("/servers/create");
    
    // Upload image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles("./test-fixtures/server-avatar.png");

    // Wait for upload to complete
    await expect(page.locator("[data-testid=upload-preview]"))
      .toBeVisible();

    // Create server
    await page.fill('[name="name"]', "Test Server");
    await page.click('button[type="submit"]');

    // Verify server was created with avatar
    await expect(page.locator("[data-testid=server-avatar] img"))
      .toHaveAttribute("src", /\/_matrix\/client\/v1\/media/);
  });

  test("should send image message", async ({ page }) => {
    await page.goto("/channels/test-room");
    
    // Open file upload modal
    await page.click("[data-testid=attach-file]");
    
    // Upload image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles("./test-fixtures/test-image.png");

    // Wait for upload
    await expect(page.locator("[data-testid=upload-progress]"))
      .toBeHidden({ timeout: 30000 });

    // Send message
    await page.click("[data-testid=send-file]");

    // Verify message appears with image
    await expect(page.locator("[data-testid=message-image]").last())
      .toBeVisible();
  });
});
```

---

## Appendix A: Migration Checklist

### Phase 1: Infrastructure
- [ ] Configure Synapse media repository storage
- [ ] Set appropriate upload size limits
- [ ] Configure CORS for media endpoints
- [ ] Update Next.js image domains

### Phase 2: Core Components
- [ ] Implement `useMediaUpload` hook
- [ ] Implement `useMxcUrl` hook
- [ ] Create `MatrixImage` component
- [ ] Create `FileUpload` component
- [ ] Create `MessageAttachment` component

### Phase 3: Feature Integration
- [ ] Update `CreateServerModal` to use Matrix upload
- [ ] Update `EditServerModal` to use Matrix upload
- [ ] Update `InitialModal` to use Matrix upload
- [ ] Update `MessageFileModal` to use Matrix upload
- [ ] Update user avatar upload (profile settings)

### Phase 4: Display Components
- [ ] Update `NavigationItem` for server avatars
- [ ] Update `ChatItem` for message attachments
- [ ] Update `UserAvatar` for profile images
- [ ] Update `MembersModal` for member avatars

### Phase 5: Testing & Polish
- [ ] Write unit tests for hooks
- [ ] Write integration tests for upload flow
- [ ] Write E2E tests for user flows
- [ ] Handle error states gracefully
- [ ] Add loading states and progress indicators

---

## Appendix B: Synapse Configuration

```yaml
# homeserver.yaml

# Media storage configuration
media_store_path: "/data/media_store"

# Upload limits
max_upload_size: 50M

# Thumbnail generation
dynamic_thumbnails: true
thumbnail_sizes:
  - width: 32
    height: 32
    method: crop
  - width: 96
    height: 96
    method: crop
  - width: 320
    height: 240
    method: scale
  - width: 640
    height: 480
    method: scale
  - width: 800
    height: 600
    method: scale

# URL preview (optional)
url_preview_enabled: true
url_preview_ip_range_blacklist:
  - '127.0.0.0/8'
  - '10.0.0.0/8'
  - '172.16.0.0/12'
  - '192.168.0.0/16'

# Media retention (optional)
media_retention:
  local_media_lifetime: 90d
  remote_media_lifetime: 14d
```

---

## Appendix C: Error Handling Reference

| Matrix Error Code | Meaning | User Message |
|-------------------|---------|--------------|
| `M_TOO_LARGE` | File exceeds server limit | "File is too large to upload" |
| `M_FORBIDDEN` | Not authorized | "You don't have permission to upload" |
| `M_UNKNOWN_TOKEN` | Invalid/expired token | "Session expired, please log in again" |
| `M_LIMIT_EXCEEDED` | Rate limited | "Too many uploads, please wait" |
| `M_NOT_FOUND` | Media not found | "Media no longer available" |
| Network error | Connection failed | "Upload failed, please try again" |

---

*Document generated for HAOS v2 audit. Last updated: 2025-02-11*
