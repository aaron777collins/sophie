# Bible Drawing Video Pipeline V2 - Architecture Document

**Version:** 2.0  
**Author:** Sophie (AI Assistant)  
**Date:** 2025-02-28  
**Status:** Draft

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Bible Drawing Video Pipeline V2                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Next.js    │  │   NextAuth   │  │   Video      │  │   Sophie     │    │
│  │   Frontend   │──│   Auth       │──│   Player     │──│   Chat       │    │
│  └──────┬───────┘  └──────────────┘  └──────────────┘  └──────┬───────┘    │
│         │                                                      │            │
│  ┌──────┴──────────────────────────────────────────────────────┴───────┐   │
│  │                         Next.js API Routes                           │   │
│  │  /api/auth  /api/upload  /api/process  /api/transcript  /api/chat   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│         │                                                                    │
│  ┌──────┴──────────────────────────────────────────────────────────────┐   │
│  │                        Processing Engine                             │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │   │
│  │  │ Upload  │─▶│ Process │─▶│Transcribe│─▶│ Segment │─▶│ Export  │   │   │
│  │  │ Handler │  │ Queue   │  │ (Whisper)│  │ Manager │  │ Engine  │   │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│         │                                                                    │
│  ┌──────┴──────────────────────────────────────────────────────────────┐   │
│  │                        Storage Layer                                 │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │   │
│  │  │   SQLite    │  │   File      │  │   Version   │                  │   │
│  │  │   Database  │  │   Storage   │  │   Store     │                  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│         │                                                                    │
│  ┌──────┴──────────────────────────────────────────────────────────────┐   │
│  │                        External Tools                                │   │
│  │  ┌─────────┐  ┌─────────────┐  ┌─────────┐  ┌─────────┐            │   │
│  │  │ FFmpeg  │  │ Auto-Editor │  │ Whisper │  │ Claude  │            │   │
│  │  └─────────┘  └─────────────┘  └─────────┘  │   API   │            │   │
│  │                                              └─────────┘            │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | Next.js 14+ (App Router) | SSR, API routes, modern React |
| Styling | Tailwind CSS | Utility-first, rapid development |
| State | React Context + Zustand | Simple, performant state management |
| Video Player | Video.js or custom HTML5 | Mature, accessible, customizable |
| Transcript Editor | Custom React component | Specialized needs for sync editing |
| Chat UI | Custom component | Integration with Sophie API |

### Backend
| Component | Technology | Rationale |
|-----------|------------|-----------|
| API | Next.js API Routes | Co-located with frontend, TypeScript |
| Auth | NextAuth.js + credentials | Secure, flexible, self-hosted |
| Queue | Bull + Redis OR SQLite queue | Job processing for video tasks |
| Database | SQLite (Drizzle ORM) | Simple, no external deps, file-based |
| File Storage | Local filesystem | Self-hosted requirement |

### Video Processing
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Transcoding | FFmpeg | Industry standard, full control |
| Silence Removal | Auto-Editor | Already in use, proven |
| Transcription | Whisper (local) | Accurate, privacy-preserving |
| AI Analysis | Claude API | Sophisticated text understanding |

### Testing
| Type | Technology | Coverage Target |
|------|------------|-----------------|
| Unit | Vitest | 80%+ |
| Integration | Vitest + Supertest | API endpoints |
| E2E | Playwright | All user flows |
| Visual | Playwright screenshots | 3 viewports |

---

## Directory Structure

```
bible-drawing-v2/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/
│   │   └── logout/
│   ├── (dashboard)/              # Protected routes
│   │   ├── projects/             # Project list
│   │   ├── project/[id]/         # Project detail
│   │   │   ├── editor/           # Transcript editor
│   │   │   ├── preview/          # Video preview
│   │   │   └── chat/             # Sophie chat
│   │   ├── upload/               # Upload interface
│   │   └── settings/             # User settings
│   ├── api/                      # API routes
│   │   ├── auth/[...nextauth]/   # NextAuth handlers
│   │   ├── upload/               # File upload
│   │   ├── process/              # Video processing
│   │   ├── transcript/           # Transcript CRUD
│   │   ├── export/               # Video export
│   │   ├── version/              # Version management
│   │   └── chat/                 # Sophie integration
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # React components
│   ├── ui/                       # Generic UI components
│   ├── transcript/               # Transcript editor
│   ├── video/                    # Video player
│   ├── chat/                     # Chat interface
│   └── upload/                   # Upload components
├── lib/                          # Core libraries
│   ├── auth/                     # Auth utilities
│   ├── db/                       # Database (Drizzle)
│   ├── processing/               # Video processing
│   │   ├── ffmpeg.ts             # FFmpeg wrapper
│   │   ├── auto-editor.ts        # Auto-Editor wrapper
│   │   ├── whisper.ts            # Whisper wrapper
│   │   └── queue.ts              # Job queue
│   ├── storage/                  # File storage
│   │   ├── files.ts              # File operations
│   │   └── versions.ts           # Version control
│   └── ai/                       # AI integration
│       └── claude.ts             # Claude API client
├── hooks/                        # React hooks
├── types/                        # TypeScript types
├── public/                       # Static assets
├── data/                         # Local data directory
│   ├── db/                       # SQLite database
│   ├── uploads/                  # Raw uploaded files
│   ├── processed/                # Processed videos
│   ├── transcripts/              # Transcript JSON files
│   └── versions/                 # Version snapshots
├── tests/                        # Test files
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   ├── e2e/                      # Playwright E2E tests
│   └── fixtures/                 # Test fixtures
├── scripts/                      # Utility scripts
├── drizzle/                      # Database migrations
├── playwright.config.ts
├── vitest.config.ts
├── next.config.js
├── tailwind.config.js
├── package.json
└── README.md
```

---

## Data Models

### SQLite Schema (Drizzle)

```typescript
// lib/db/schema.ts

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// Projects table
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status', { enum: ['uploading', 'processing', 'ready', 'exported', 'error'] }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// Video segments (source files)
export const segments = sqliteTable('segments', {
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => projects.id).notNull(),
  filename: text('filename').notNull(),
  originalPath: text('original_path').notNull(),
  processedPath: text('processed_path'),
  duration: real('duration'),
  order: integer('order').notNull(),
  status: text('status', { enum: ['pending', 'processing', 'ready', 'error'] }).notNull(),
  metadata: text('metadata', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// Transcripts
export const transcripts = sqliteTable('transcripts', {
  id: text('id').primaryKey(),
  segmentId: text('segment_id').references(() => segments.id).notNull(),
  content: text('content', { mode: 'json' }).notNull(), // Word-level timestamps
  editedContent: text('edited_content', { mode: 'json' }), // User edits
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// Versions (for rollback)
export const versions = sqliteTable('versions', {
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => projects.id).notNull(),
  name: text('name'),
  snapshotPath: text('snapshot_path').notNull(), // Path to version data
  parentId: text('parent_id').references(() => versions.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  message: text('message'),
});

// Processing jobs
export const jobs = sqliteTable('jobs', {
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => projects.id),
  segmentId: text('segment_id').references(() => segments.id),
  type: text('type', { enum: ['silence_removal', 'transcription', 'export', 'ai_analysis'] }).notNull(),
  status: text('status', { enum: ['pending', 'running', 'completed', 'failed'] }).notNull(),
  progress: integer('progress').default(0),
  result: text('result', { mode: 'json' }),
  error: text('error'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

// Chat messages (Sophie integration)
export const chatMessages = sqliteTable('chat_messages', {
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => projects.id).notNull(),
  role: text('role', { enum: ['user', 'assistant'] }).notNull(),
  content: text('content').notNull(),
  appliedChanges: text('applied_changes', { mode: 'json' }), // Record of edits made
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// Exports
export const exports = sqliteTable('exports', {
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => projects.id).notNull(),
  versionId: text('version_id').references(() => versions.id),
  outputPath: text('output_path').notNull(),
  format: text('format').notNull(),
  quality: text('quality').notNull(),
  duration: real('duration'),
  fileSize: integer('file_size'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
```

### Transcript JSON Structure

```typescript
// types/transcript.ts

interface Word {
  text: string;
  start: number;      // seconds
  end: number;        // seconds
  confidence: number; // 0-1
}

interface Segment {
  id: string;
  text: string;
  start: number;
  end: number;
  words: Word[];
}

interface Transcript {
  language: string;
  segments: Segment[];
}

interface EditedTranscript extends Transcript {
  edits: {
    segmentId: string;
    wordIndices: number[];  // Indices of removed words
    action: 'remove' | 'keep';
    editedAt: number;       // Timestamp
    editedBy: string;       // 'user' | 'ai'
    reason?: string;        // AI explanation
  }[];
}
```

---

## API Design

### Authentication
```
POST /api/auth/login         # Login with credentials
POST /api/auth/logout        # Logout
GET  /api/auth/session       # Get current session
POST /api/auth/password      # Change password
```

### Projects
```
GET    /api/projects              # List all projects
POST   /api/projects              # Create new project
GET    /api/projects/:id          # Get project details
PATCH  /api/projects/:id          # Update project
DELETE /api/projects/:id          # Delete project
```

### Upload & Processing
```
POST   /api/upload                # Upload file(s)
GET    /api/upload/:id/progress   # Get upload progress
POST   /api/process/:projectId    # Start processing
GET    /api/process/:projectId    # Get processing status
POST   /api/process/:id/cancel    # Cancel processing
```

### Transcripts
```
GET    /api/transcript/:segmentId          # Get transcript
PATCH  /api/transcript/:segmentId          # Update transcript (edits)
POST   /api/transcript/:segmentId/preview  # Preview video with edits
POST   /api/transcript/:segmentId/sync     # Sync playback position
```

### Versions
```
GET    /api/version/:projectId             # List versions
POST   /api/version/:projectId             # Create version (save point)
POST   /api/version/:projectId/restore/:id # Restore to version
GET    /api/version/:id/diff               # Get diff between versions
```

### Export
```
POST   /api/export/:projectId              # Start export
GET    /api/export/:projectId/status       # Get export status
GET    /api/export/:id/download            # Download exported file
```

### Chat (Sophie)
```
POST   /api/chat/:projectId                # Send message
GET    /api/chat/:projectId                # Get chat history
POST   /api/chat/:projectId/apply          # Apply suggested edit
POST   /api/chat/:projectId/undo           # Undo last AI edit
```

---

## Video Processing Pipeline

### Processing Stages

```
┌─────────┐    ┌─────────────┐    ┌─────────────┐    ┌──────────────┐
│ Upload  │───▶│   Stage 1   │───▶│   Stage 2   │───▶│   Stage 3    │
│ (Raw)   │    │ Validation  │    │ Pre-Process │    │ Silence Cut  │
└─────────┘    └─────────────┘    └─────────────┘    └──────────────┘
                     │                   │                   │
                     ▼                   ▼                   ▼
              • Format check       • Extract audio     • Auto-Editor
              • Codec detect       • Normalize         • Margin config
              • Duration get       • Noise reduce      • Generate cuts
              • Resolution         • Volume balance
                                                            │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│   Stage 6   │◀───│   Stage 5   │◀───│   Stage 4   │◀─────┘
│   Export    │    │   Ready     │    │ Transcribe  │
└─────────────┘    └─────────────┘    └─────────────┘
      │                   │                   │
      ▼                   ▼                   ▼
• Apply edits        • Await edits      • Whisper
• Final encode       • Preview ready    • Word timestamps
• Subtitles          • Playable         • Filler detect
• Thumbnail
```

### FFmpeg Wrapper

```typescript
// lib/processing/ffmpeg.ts

import { spawn } from 'child_process';

interface FFmpegProgress {
  frame: number;
  fps: number;
  time: number;
  speed: number;
  percent: number;
}

class FFmpegProcessor {
  async extractAudio(input: string, output: string): Promise<void> {
    return this.run([
      '-i', input,
      '-vn',
      '-acodec', 'pcm_s16le',
      '-ar', '16000',
      '-ac', '1',
      output
    ]);
  }

  async normalizeAudio(input: string, output: string): Promise<void> {
    // Two-pass loudness normalization
    const stats = await this.analyzeLoudness(input);
    return this.run([
      '-i', input,
      '-af', `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${stats.input_i}:measured_LRA=${stats.input_lra}:measured_TP=${stats.input_tp}:measured_thresh=${stats.input_thresh}:offset=${stats.target_offset}:linear=true,highpass=f=80,lowpass=f=12000`,
      '-c:v', 'copy',
      '-c:a', 'aac', '-b:a', '192k',
      output
    ]);
  }

  async applyEdits(input: string, edits: EditList, output: string): Promise<void> {
    // Generate concat filter from edit list
    const filter = this.generateConcatFilter(edits);
    return this.run([
      '-i', input,
      '-filter_complex', filter,
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
      '-c:a', 'aac', '-b:a', '192k',
      '-movflags', '+faststart',
      output
    ]);
  }

  async generateThumbnail(input: string, timestamp: number, output: string): Promise<void> {
    return this.run([
      '-ss', timestamp.toString(),
      '-i', input,
      '-vframes', '1',
      '-q:v', '2',
      output
    ]);
  }
}
```

### Auto-Editor Integration

```typescript
// lib/processing/auto-editor.ts

interface AutoEditorConfig {
  silenceThreshold: number;  // dB, default -35
  minSilence: number;        // seconds, default 0.5
  marginBefore: number;      // seconds, default 0.1
  marginAfter: number;       // seconds, default 0.15
}

class AutoEditorProcessor {
  async removeSilence(input: string, output: string, config: AutoEditorConfig): Promise<void> {
    await exec('auto-editor', [
      input,
      '--margin', `${config.marginBefore}s,${config.marginAfter}s`,
      '--edit', `audio:threshold=${config.silenceThreshold}dB,mincut=${config.minSilence}s`,
      '--output', output,
      '--no-open',
      '--progress', 'none'
    ]);
  }

  async getEditList(input: string, config: AutoEditorConfig): Promise<EditList> {
    // Get cuts as JSON instead of applying
    const result = await exec('auto-editor', [
      input,
      '--edit', `audio:threshold=${config.silenceThreshold}dB,mincut=${config.minSilence}s`,
      '--export', 'json',
      '--no-open'
    ]);
    return JSON.parse(result);
  }
}
```

### Whisper Integration

```typescript
// lib/processing/whisper.ts

interface WhisperConfig {
  model: 'tiny' | 'base' | 'small' | 'medium' | 'large';
  language: string;
  wordTimestamps: boolean;
}

class WhisperProcessor {
  async transcribe(audioPath: string, config: WhisperConfig): Promise<Transcript> {
    const outputDir = path.dirname(audioPath);
    
    await exec('whisper', [
      audioPath,
      '--model', config.model,
      '--output_format', 'json',
      '--output_dir', outputDir,
      '--word_timestamps', config.wordTimestamps ? 'True' : 'False',
      '--language', config.language
    ]);

    const jsonPath = audioPath.replace(/\.[^.]+$/, '.json');
    const content = await fs.readFile(jsonPath, 'utf-8');
    return JSON.parse(content);
  }

  async detectFillerWords(transcript: Transcript): Promise<FillerWord[]> {
    const FILLERS = ['um', 'uh', 'uhh', 'umm', 'hmm', 'hm', 'ah', 'er', 'err'];
    const fillers: FillerWord[] = [];

    for (const segment of transcript.segments) {
      for (const word of segment.words) {
        const cleaned = word.text.toLowerCase().replace(/[.,!?]/g, '').trim();
        if (FILLERS.includes(cleaned)) {
          fillers.push({
            word: cleaned,
            start: word.start,
            end: word.end,
            segmentId: segment.id
          });
        }
      }
    }

    return fillers;
  }
}
```

---

## Version Control System

### Design: Space-Efficient Git-Like Versioning

```
versions/
└── project-abc123/
    ├── v001/
    │   ├── manifest.json      # Full state snapshot
    │   └── transcript.json    # Transcript at this version
    ├── v002/
    │   ├── manifest.json
    │   └── delta.json         # Diff from v001
    └── v003/
        ├── manifest.json
        └── delta.json         # Diff from v002
```

### Version Manifest

```typescript
interface VersionManifest {
  id: string;
  projectId: string;
  version: number;
  parentVersion: number | null;
  createdAt: number;
  message: string;
  createdBy: 'user' | 'ai' | 'auto';
  
  // What changed
  changes: {
    type: 'transcript_edit' | 'segment_add' | 'segment_remove' | 'settings';
    description: string;
  }[];
  
  // For restoration
  storageType: 'full' | 'delta';
  transcriptPath: string;
}
```

### Delta Format

```typescript
interface TranscriptDelta {
  baseVersion: number;
  operations: DeltaOperation[];
}

type DeltaOperation = 
  | { op: 'remove'; segmentId: string; wordIndices: number[] }
  | { op: 'restore'; segmentId: string; wordIndices: number[] }
  | { op: 'reorder'; segmentOrder: string[] };
```

---

## AI Integration (Claude)

### Transcript Analysis Prompt

```typescript
// lib/ai/claude.ts

const ANALYSIS_SYSTEM_PROMPT = `You are an AI assistant helping edit Bible drawing video transcripts.

Your role:
1. Analyze transcript content for themes and topics
2. Identify the best segments for a coherent episode
3. Suggest cuts to create a focused ~10 minute video
4. Flag potential issues (audio problems, unclear speech)

When making suggestions, output structured JSON with:
- Suggested segments to keep (with timestamps)
- Segments to cut (with reasons)
- Estimated final duration
- Episode title suggestion
- Brief content summary`;

class ClaudeAssistant {
  async analyzeTranscript(transcript: Transcript, targetDuration: number = 600): Promise<AnalysisResult> {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: ANALYSIS_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Analyze this transcript and suggest edits for a ${targetDuration / 60} minute video:\n\n${JSON.stringify(transcript)}`
      }]
    });
    
    return this.parseAnalysisResponse(response);
  }

  async processEditRequest(
    transcript: Transcript,
    chatHistory: ChatMessage[],
    request: string
  ): Promise<EditSuggestion> {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: `You are editing a Bible drawing video transcript. Apply the user's edit request and return the specific changes to make.`,
      messages: [
        ...chatHistory.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: request }
      ]
    });
    
    return this.parseEditSuggestion(response);
  }
}
```

---

## Frontend Components

### Transcript Editor Architecture

```typescript
// components/transcript/TranscriptEditor.tsx

interface TranscriptEditorProps {
  transcript: EditedTranscript;
  currentTime: number;
  onEdit: (edit: TranscriptEdit) => void;
  onSeek: (time: number) => void;
}

// Core features:
// 1. Word-level clickable text
// 2. Strikethrough to remove
// 3. Grayed-out removed sections (expandable)
// 4. Current word highlighting during playback
// 5. Click to seek
// 6. Undo/redo support
```

### Video Player Integration

```typescript
// components/video/VideoPlayer.tsx

interface VideoPlayerProps {
  src: string;
  transcript: EditedTranscript;
  onTimeUpdate: (time: number) => void;
  onPlayStateChange: (playing: boolean) => void;
}

// Features:
// 1. Standard controls
// 2. Speed adjustment (0.5x - 2x)
// 3. Sync with transcript editor
// 4. Jump to edit points
// 5. Preview mode (skip removed sections)
```

### Chat Interface

```typescript
// components/chat/ChatInterface.tsx

interface ChatInterfaceProps {
  projectId: string;
  transcript: EditedTranscript;
  onApplyEdit: (edit: TranscriptEdit) => void;
}

// Features:
// 1. Message history
// 2. Real-time responses (streaming)
// 3. Edit suggestions with apply/reject
// 4. Context-aware of current project
```

---

## Security Considerations

### Authentication
- NextAuth.js with credentials provider
- Argon2 password hashing
- Secure session tokens (httpOnly cookies)
- CSRF protection
- Rate limiting on login (5 attempts/minute)

### File Security
- Upload validation (file type, size, magic bytes)
- Sanitized filenames
- Files stored outside web root
- No direct file access (served through API)

### API Security
- All endpoints require authentication
- Input validation with Zod
- SQL injection prevention (parameterized queries)
- Path traversal prevention

---

## Deployment

### Environment Variables

```bash
# .env.local
DATABASE_URL=file:./data/db/bible-drawing.db
NEXTAUTH_SECRET=<generate-secure-secret>
NEXTAUTH_URL=http://localhost:3000

# Storage paths
UPLOAD_DIR=./data/uploads
PROCESSED_DIR=./data/processed
TRANSCRIPT_DIR=./data/transcripts
VERSION_DIR=./data/versions

# External tools
FFMPEG_PATH=/usr/bin/ffmpeg
WHISPER_PATH=/usr/local/bin/whisper
AUTO_EDITOR_PATH=~/.local/bin/auto-editor

# AI (optional)
ANTHROPIC_API_KEY=<api-key>

# Processing
MAX_CONCURRENT_JOBS=2
MAX_UPLOAD_SIZE_MB=10240
```

### System Requirements
- Node.js 18+
- FFmpeg 4.4+
- Auto-Editor 23+
- Whisper (with models downloaded)
- 16GB+ RAM recommended
- SSD storage recommended

### Startup Script

```bash
#!/bin/bash
# scripts/start.sh

# Check dependencies
command -v ffmpeg >/dev/null || { echo "FFmpeg required"; exit 1; }
command -v whisper >/dev/null || { echo "Whisper required"; exit 1; }
command -v auto-editor >/dev/null || { echo "Auto-Editor required"; exit 1; }

# Create data directories
mkdir -p data/{db,uploads,processed,transcripts,versions}

# Run migrations
pnpm db:migrate

# Start app
pnpm start
```

---

## Testing Strategy

### Test Structure
```
tests/
├── unit/                    # Vitest unit tests
│   ├── lib/
│   │   ├── processing/
│   │   ├── storage/
│   │   └── ai/
│   └── components/
├── integration/             # API integration tests
│   ├── api/
│   │   ├── auth.test.ts
│   │   ├── upload.test.ts
│   │   └── transcript.test.ts
│   └── processing/
└── e2e/                     # Playwright E2E tests
    ├── auth.spec.ts
    ├── upload.spec.ts
    ├── editor.spec.ts
    ├── export.spec.ts
    └── fixtures/
        └── sample-video.mp4
```

### E2E Test Requirements (Playwright)

All E2E tests MUST:
1. Run in 3 viewports: desktop (1280x720), tablet (768x1024), mobile (375x667)
2. Capture screenshots at key interaction points
3. Test accessibility (keyboard navigation)
4. Run in CI pipeline

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login with valid credentials', async ({ page }) => {
    // Given I am on the login page
    await page.goto('/login');
    
    // When I enter valid credentials
    await page.fill('[data-testid="username"]', 'aaron');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    
    // Then I should be redirected to dashboard
    await expect(page).toHaveURL('/projects');
    await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
  });
});
```

---

*Architecture Document - Bible Drawing Video Pipeline V2*  
*Created: 2025-02-28*
