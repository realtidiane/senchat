# SenChat — Design Specification

**Date:** 2026-04-29
**Status:** Approved
**Author:** Claude (brainstorming session)

---

## 1. Overview

SenChat is a real-time messaging application inspired by WhatsApp, with a distinct Senegalese visual identity. The MVP delivers core chat functionality — 1:1 and group conversations, text and file sharing, presence indicators, and message status tracking — with a polished dark-mode-first UI using Senegal's national colors.

**Target users:** Senegalese diaspora and local users wanting a familiar chat experience with cultural identity.

**Primary language:** French (i18n-ready structure for Wolof in v2).

---

## 2. MVP Scope

### In Scope

| Feature | Description |
|---|---|
| **Authentication** | Email + password registration/login, JWT access (15min) + refresh (7d httpOnly cookie) |
| **User profiles** | Display name, avatar upload, bio, custom status |
| **1:1 conversations** | Direct messaging between two users |
| **Group conversations** | Up to 256 members, roles (owner/admin/member) |
| **Text messages** | Real-time delivery via Socket.IO |
| **File sharing** | Images and files up to 25 MB, stored locally |
| **Message status** | Sent (single check = stored on server), read (blue double check = recipient opened conversation). Note: no separate "delivered" state for MVP — requires offline message queue which is out of scope. |
| **Presence** | Online/offline indicators, "last seen" timestamp |
| **Typing indicators** | Real-time "is typing..." display |
| **Message search** | Full-text search within conversations |
| **Dark/Light mode** | Dark mode default, toggle in settings |
| **Responsive design** | Mobile-first, works on desktop |

### Out of Scope (v2+)

- Voice/video calls (WebRTC + STUN/TURN + mediasoup)
- End-to-end encryption (Signal Protocol)
- Wolof language support
- Stories / status updates
- Message reactions and threaded replies
- Voice messages
- Push notifications (mobile)
- Admin dashboard
- Read receipts privacy settings

---

## 3. Architecture

### 3.1 Monorepo Structure

```
senchat/
├── backend/                 # NestJS application
│   ├── src/
│   │   ├── auth/            # JWT authentication, guards, strategies
│   │   ├── users/           # User profiles, search, presence
│   │   ├── conversations/   # Conversation CRUD, member management
│   │   ├── messages/        # Message CRUD, status tracking
│   │   ├── files/           # File upload/download
│   │   ├── gateway/         # Socket.IO gateway (all real-time events)
│   │   └── common/          # Shared filters, pipes, decorators, DTOs
│   ├── prisma/
│   │   └── schema.prisma
│   ├── uploads/             # Local file storage (gitignored)
│   └── test/
├── frontend/                # React 18 + Vite application
│   ├── src/
│   │   ├── components/      # Reusable UI components (shadcn/ui based)
│   │   ├── features/        # Feature modules: auth/, chat/, settings/
│   │   ├── hooks/           # Custom hooks: useSocket, useAuth, useMessages
│   │   ├── stores/          # Zustand stores: auth, conversations, ui
│   │   ├── lib/             # API client (axios), socket client, utilities
│   │   └── styles/          # Tailwind config, design tokens, global CSS
│   └── public/
├── shared/                  # Shared TypeScript types and socket event definitions
│   ├── types/               # User, Conversation, Message interfaces
│   └── events/              # Socket.IO event name constants + payloads
├── docker-compose.yml       # MySQL 8 + (dev) Mailhog
├── package.json             # npm workspaces root
├── tsconfig.base.json       # Shared TS config
└── .env.example
```

### 3.2 Technology Stack

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| **Runtime** | Node.js | 20 LTS | Stable, long-term support |
| **Backend framework** | NestJS | 10.x | Modular, guards, gateways, excellent DX |
| **ORM** | Prisma | 6.x | Type-safe queries, migrations, schema-first |
| **Database** | MySQL | 8.x | User's choice, mature, Prisma support |
| **Real-time** | Socket.IO | 4.x | Rooms, namespaces, automatic reconnection |
| **Frontend framework** | React | 18.x | Component model, ecosystem, hooks |
| **Build tool** | Vite | 6.x | Fast HMR, ESBuild bundling |
| **CSS** | Tailwind CSS | 3.x | Utility-first, design token friendly |
| **UI components** | shadcn/ui | latest | Copy-paste components, fully customizable |
| **Client state** | Zustand | 5.x | Lightweight, no boilerplate |
| **Server state** | TanStack Query | 5.x | Caching, pagination, optimistic updates |
| **Validation** | class-validator | latest | DTO validation in NestJS pipes |
| **Auth** | @nestjs/jwt + passport-jwt | latest | Standard JWT strategy |

---

## 4. Backend Design

### 4.1 Module Breakdown

#### AuthModule
- **Register:** Validate email uniqueness, hash password (bcrypt 12 rounds), create user, return tokens
- **Login:** Verify credentials, issue access token (JWT, 15min) + refresh token (httpOnly cookie, 7d)
- **Refresh:** Validate refresh token, rotate (invalidate old, issue new pair)
- **Logout:** Invalidate refresh token, clear cookie
- **Guards:** `JwtAuthGuard` (global), `@Public()` decorator to bypass

#### UsersModule
- **Get profile:** Own profile or another user's public profile
- **Update profile:** Display name, bio, status (validated, sanitized)
- **Upload avatar:** Multer, image only (jpg/png/webp), max 5 MB, resize to 256x256
- **Search users:** By display name or email (paginated, debounced on frontend)
- **Presence:** Updated via Socket.IO connect/disconnect events

#### ConversationsModule
- **Create direct:** Find or create 1:1 conversation (idempotent — same pair always returns same conversation)
- **Create group:** Name required, creator becomes OWNER
- **List conversations:** Paginated, sorted by last message timestamp, includes last message preview and unread count
- **Manage members:** Add/remove (ADMIN+ only), promote/demote (OWNER only), leave group

#### MessagesModule
- **Send message:** Via Socket.IO (not REST) for real-time delivery
- **Get history:** REST endpoint, cursor-based pagination (infinite scroll)
- **Message status:** Track per-recipient delivery and read status via ConversationMember.lastReadAt
- **Search:** Full-text search within a conversation, paginated results
- **Delete:** Soft delete (sets deletedAt, shows "message deleted" to others)

#### FilesModule
- **Upload:** Multer middleware, whitelist MIME types, max 25 MB, sanitize filename, store in `uploads/{conversationId}/{uuid}.{ext}`
- **Download:** Serve file with proper Content-Type and Content-Disposition headers
- **Access control:** Only conversation members can download files from that conversation

#### GatewayModule (Socket.IO)
- **Connection:** JWT verified at handshake via `WsJwtGuard`. Socket joins user's personal room + all conversation rooms.
- **Rooms:** One room per conversation ID. User joins on connection, server broadcasts to room on new messages.

### 4.2 Socket.IO Events

| Direction | Event | Payload | Description |
|---|---|---|---|
| Client → Server | `message:send` | `{ conversationId, type, content?, fileUrl? }` | Send a new message |
| Client → Server | `message:read` | `{ conversationId, messageId }` | Mark messages as read up to messageId |
| Client → Server | `typing:start` | `{ conversationId }` | User started typing |
| Client → Server | `typing:stop` | `{ conversationId }` | User stopped typing |
| Server → Client | `message:new` | `Message` object | New message in a conversation |
| Server → Client | `message:status` | `{ messageId, userId, status }` | Delivery/read status update |
| Server → Client | `typing:update` | `{ conversationId, userId, isTyping }` | Typing indicator |
| Server → Client | `presence:change` | `{ userId, isOnline, lastSeen }` | User online/offline |
| Server → Client | `conversation:updated` | `Conversation` partial | Conversation metadata changed |
| Server → Client | `member:added` / `member:removed` | `{ conversationId, userId }` | Group membership changes |

### 4.3 REST API Endpoints

```
POST   /auth/register          # Create account
POST   /auth/login             # Login, get tokens
POST   /auth/refresh           # Refresh access token
POST   /auth/logout            # Invalidate refresh token

GET    /users/me               # Own profile
PATCH  /users/me               # Update profile
POST   /users/me/avatar        # Upload avatar
GET    /users/search?q=        # Search users
GET    /users/:id              # Public profile

POST   /conversations          # Create conversation
GET    /conversations          # List my conversations
GET    /conversations/:id      # Get conversation details
PATCH  /conversations/:id      # Update group (name, avatar)
POST   /conversations/:id/members     # Add member
DELETE /conversations/:id/members/:uid # Remove member
DELETE /conversations/:id/leave        # Leave group

GET    /conversations/:id/messages     # Message history (cursor pagination)
GET    /conversations/:id/messages/search?q=  # Search messages
DELETE /messages/:id                   # Soft delete message

POST   /files/upload           # Upload file (multipart)
GET    /files/:id              # Download file
```

---

## 5. Frontend Design

### 5.1 State Architecture

```
┌─────────────────────────────────────────────┐
│                   React UI                   │
├──────────────┬──────────────┬───────────────┤
│  Zustand     │ TanStack     │  Socket.IO    │
│  (client     │  Query       │  Client       │
│   state)     │ (server      │  (real-time   │
│              │  cache)      │   events)     │
│  • auth      │ • convos     │ • message:new │
│  • ui theme  │ • messages   │ • typing      │
│  • active    │ • user       │ • presence    │
│    convo     │   search     │ • status      │
└──────┬───────┴──────┬───────┴───────┬───────┘
       │              │               │
       │         REST API        WebSocket
       │              │               │
       └──────────────┴───────────────┘
                      │
               NestJS Backend
```

**Key pattern:** Socket.IO events update TanStack Query cache directly. When `message:new` arrives, it's pushed into the messages query cache for that conversation + the conversations list cache (last message preview, unread count, sort order). No refetch needed.

### 5.2 Pages & Routing

| Route | Component | Layout |
|---|---|---|
| `/login` | `LoginPage` | Auth layout (centered form, SenChat branding) |
| `/register` | `RegisterPage` | Auth layout |
| `/` | `ChatLayout` | Sidebar + Chat panel (or just sidebar on mobile) |
| `/settings` | `SettingsPage` | Full-screen settings (profile, theme, logout) |

### 5.3 Chat Layout

**Desktop (≥768px):**
```
┌──────────────────────────────────────────────┐
│  SenChat                          [settings] │
├─────────────┬────────────────────────────────┤
│ [search]    │  Conversation Header           │
│─────────────│  (name, avatar, online status) │
│ Conv 1   ●  │────────────────────────────────│
│ Conv 2      │                                │
│ Conv 3      │     Messages (scrollable)      │
│ Conv 4      │                                │
│             │                                │
│             │────────────────────────────────│
│             │ [attach] [message input] [send]│
├─────────────┴────────────────────────────────┤
│  width: 300px        flex: 1                 │
└──────────────────────────────────────────────┘
```

**Mobile (<768px):**
- Sidebar fills screen. Tap conversation → full-screen chat with back button.
- Swipe or button to return to conversation list.

### 5.4 Key Components

| Component | Description |
|---|---|
| `ConversationList` | Sorted list with last message preview, unread badge, online dot |
| `ConversationItem` | Avatar, name, last message, timestamp, unread count |
| `ChatPanel` | Message list + input, manages scroll position and infinite scroll |
| `MessageBubble` | Outgoing (green) or incoming (dark surface), status checks, timestamp |
| `MessageInput` | Text area with auto-resize, file attach button, send button (or Enter) |
| `UserSearch` | Debounced search input, results list, click to start conversation |
| `GroupCreate` | Multi-select users, set group name/avatar, create |
| `ProfileCard` | Avatar, display name, bio, status — used in settings and user preview |

---

## 6. Database Schema

### 6.1 Models

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

enum ConversationType {
  DIRECT
  GROUP
}

enum MemberRole {
  OWNER
  ADMIN
  MEMBER
}

enum MessageType {
  TEXT
  IMAGE
  FILE
  SYSTEM
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  password      String
  displayName   String    @db.VarChar(100)
  avatar        String?
  bio           String?   @db.VarChar(500)
  isOnline      Boolean   @default(false)
  lastSeen      DateTime  @default(now())
  createdAt     DateTime  @default(now())

  memberships   ConversationMember[]
  messages      Message[]
  refreshTokens RefreshToken[]

  @@index([displayName])
  @@index([email])
}

model Conversation {
  id        String             @id @default(uuid())
  type      ConversationType
  name      String?            @db.VarChar(100)
  avatar    String?
  createdAt DateTime           @default(now())
  updatedAt DateTime           @updatedAt

  members   ConversationMember[]
  messages  Message[]

  @@index([updatedAt])
}

model ConversationMember {
  id             String       @id @default(uuid())
  conversationId String
  userId         String
  role           MemberRole   @default(MEMBER)
  joinedAt       DateTime     @default(now())
  lastReadAt     DateTime     @default(now())

  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([conversationId, userId])
  @@index([userId])
}

model Message {
  id             String      @id @default(uuid())
  conversationId String
  senderId       String
  type           MessageType @default(TEXT)
  content        String?     @db.Text
  fileUrl        String?
  fileName       String?     @db.VarChar(255)
  fileSize       Int?
  createdAt      DateTime    @default(now())
  editedAt       DateTime?
  deletedAt      DateTime?

  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender         User         @relation(fields: [senderId], references: [id], onDelete: Cascade)

  @@index([conversationId, createdAt])
  @@index([conversationId, content(length: 100)])
}

model RefreshToken {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique @db.VarChar(500)
  expiresAt DateTime
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
}
```

### 6.2 Key Queries

- **Conversation list:** Join ConversationMember → Conversation → latest Message, count unread (messages after lastReadAt), order by Conversation.updatedAt DESC.
- **Message history:** Where conversationId, cursor-based pagination on createdAt (before cursor, limit 50), order by createdAt DESC.
- **Unread count:** Count messages in conversation where createdAt > member's lastReadAt AND senderId != current user.
- **User search:** Where displayName LIKE '%query%' OR email LIKE '%query%', limit 20.
- **Message search (MVP):** LIKE '%query%' on content field with prefix index. Adequate for small-medium datasets. MySQL FULLTEXT index upgrade planned for v2.

---

## 7. Design System

### 7.1 Color Tokens

| Token | Light Mode | Dark Mode (default) | Usage |
|---|---|---|---|
| `--color-primary` | `#00853F` | `#00853F` | Primary actions, send button, online indicator, read checks |
| `--color-accent` | `#C7A500` | `#FDEF42` | Unread badges, starred items, highlights |
| `--color-danger` | `#E31B23` | `#E31B23` | Errors, delete actions, logout |
| `--color-bg` | `#FFFFFF` | `#0B141A` | Page background |
| `--color-surface` | `#F0F2F5` | `#1F2C34` | Sidebar, cards, input backgrounds |
| `--color-input` | `#FFFFFF` | `#233039` | Input fields |
| `--color-bubble-out` | `#D9FDD3` | `#005C4B` | Outgoing message bubble |
| `--color-bubble-in` | `#FFFFFF` | `#1F2C34` | Incoming message bubble |
| `--color-text-primary` | `#111B21` | `#E9EDEF` | Primary text |
| `--color-text-secondary` | `#667781` | `#8696A0` | Secondary text, timestamps |
| `--color-border` | `#E9EDEF` | `#2A3942` | Dividers, borders |

### 7.2 Typography

- **Font family:** `Inter` (loaded via Google Fonts or self-hosted)
- **Scale:** 12px (caption), 14px (body), 16px (subtitle), 20px (title), 24px (heading)
- **Font weight:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### 7.3 Spacing & Sizing

- Base unit: 4px
- Sidebar width: 300px (desktop), 100vw (mobile)
- Avatar sizes: 40px (list), 48px (header), 80px (profile), 128px (settings)
- Message bubble: max-width 65%, padding 8px 12px, border-radius 8px
- Input height: 40px minimum, auto-expand up to 120px

### 7.4 Senegalese Identity

The Senegalese identity is expressed through **color, not ornament**:
- The green `#00853F` dominates interactive elements — it IS the app's personality
- Gold `#FDEF42` appears sparingly for delight moments (unread badges glow, star animations)
- Red `#E31B23` is reserved for destructive actions — it carries weight
- No flags, patterns, or cultural imagery in the UI — the colors alone do the work
- App name "SenChat" and a minimal logo (speech bubble in SN green) provide branding

---

## 8. Security

| Concern | Mitigation |
|---|---|
| **Password storage** | bcrypt, 12 salt rounds |
| **Token theft** | Access token: short-lived (15min), in memory only. Refresh token: httpOnly, Secure, SameSite=Strict cookie |
| **Token rotation** | Refresh tokens are single-use — issuing a new pair invalidates the old refresh token |
| **Input validation** | `class-validator` + `class-transformer` on all DTOs via global ValidationPipe |
| **Rate limiting** | `@nestjs/throttler` — login: 5 req/min, register: 3 req/min, messages: 30 req/min, file upload: 10 req/min |
| **File uploads** | MIME type whitelist (image/jpeg, image/png, image/webp, application/pdf, etc.), 25 MB max, UUID filename (no path traversal) |
| **XSS** | React auto-escapes by default. No `dangerouslySetInnerHTML`. Sanitize user-generated content server-side with basic HTML entity encoding. |
| **CORS** | Strict origin whitelist: `http://localhost:5173` (dev), production domain |
| **WebSocket auth** | JWT verified at handshake only. Invalid/expired token = connection refused. No per-message auth needed (connection is stateful). |
| **Authorization** | Conversation membership checked on every message send, file download, and history fetch. Group admin actions require role check. |
| **SQL injection** | Prisma parameterizes all queries by default |

---

## 9. Error Handling

### Backend
- Global `HttpExceptionFilter` returns consistent `{ statusCode, message, error }` shape
- Prisma errors mapped to appropriate HTTP status codes (e.g., unique constraint → 409)
- Socket.IO errors emitted as `error` event with `{ code, message }` payload
- All unhandled exceptions logged and returned as 500 with generic message (no stack trace in production)

### Frontend
- TanStack Query `onError` callbacks show toast notifications
- Socket.IO `connect_error` triggers reconnection UI
- Form validation errors displayed inline (per-field)
- Network errors show a non-blocking toast with retry option
- 401 responses trigger automatic token refresh; if refresh fails, redirect to login

---

## 10. Testing Strategy

| Layer | Tool | Coverage target |
|---|---|---|
| **Backend unit** | Jest | Services, guards, pipes — 80%+ |
| **Backend e2e** | Jest + supertest | Auth flow, message flow, file upload |
| **Frontend unit** | Vitest | Stores, hooks, utility functions |
| **Frontend component** | Vitest + Testing Library | Key components (MessageBubble, ConversationList) |
| **Frontend e2e** | Playwright | Critical paths: register → login → send message → receive message |

---

## 11. Development Environment

```yaml
# docker-compose.yml
services:
  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: senchat_root
      MYSQL_DATABASE: senchat
      MYSQL_USER: senchat
      MYSQL_PASSWORD: senchat_dev
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

**Dev workflow:**
1. `docker-compose up -d` — start MySQL
2. `npm run dev:backend` — NestJS on port 3000 (watch mode)
3. `npm run dev:frontend` — Vite on port 5173 (HMR)
4. Prisma Studio on port 5555 for DB inspection

---

## 12. Non-Functional Requirements

| Requirement | Target |
|---|---|
| **Message delivery latency** | < 200ms (same region) |
| **Conversation list load** | < 500ms for 100 conversations |
| **Message history pagination** | 50 messages per page, < 300ms |
| **File upload** | Progress indicator, < 10s for 10 MB on broadband |
| **Concurrent connections** | 500+ per single server instance (Socket.IO) |
| **Bundle size** | < 300 KB gzipped (initial load) |
