# SenChat MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a real-time messaging app (WhatsApp-like) with Senegalese visual identity — auth, 1:1 and group conversations, text + file sharing, presence, typing indicators, dark-mode-first UI.

**Architecture:** npm workspaces monorepo — `backend/` (NestJS 10 + Prisma + MySQL 8 + Socket.IO), `frontend/` (React 18 + Vite + Tailwind + shadcn/ui + Zustand + TanStack Query), `shared/` (TypeScript types + socket event contracts).

**Tech Stack:** Node 20, NestJS 10, Prisma 6, MySQL 8, Socket.IO 4, React 18, Vite 6, Tailwind 3, shadcn/ui, Zustand 5, TanStack Query 5, Jest, Vitest.

**Spec:** `docs/superpowers/specs/2026-04-29-senchat-design.md`

---

## File Map

```
senchat/
├── package.json                          # npm workspaces root
├── tsconfig.base.json                    # shared TS config
├── docker-compose.yml                    # MySQL 8
├── .env.example
├── .gitignore
│
├── shared/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                      # barrel export
│       ├── types/
│       │   ├── user.ts                   # User, PublicUser, UserStatus
│       │   ├── conversation.ts           # Conversation, ConversationMember, etc.
│       │   ├── message.ts                # Message, MessageType, SendMessagePayload
│       │   └── index.ts                  # barrel
│       └── events/
│           ├── socket-events.ts          # event name constants + payload types
│           └── index.ts                  # barrel
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.build.json
│   ├── nest-cli.json
│   ├── .env
│   ├── .env.example
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── main.ts                       # bootstrap, CORS, validation pipe, cookie parser
│   │   ├── app.module.ts                 # root module wiring
│   │   ├── prisma/
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts
│   │   ├── common/
│   │   │   ├── decorators/
│   │   │   │   ├── public.decorator.ts   # @Public() to skip auth
│   │   │   │   └── current-user.decorator.ts  # @CurrentUser() param decorator
│   │   │   └── filters/
│   │   │       └── http-exception.filter.ts   # global exception filter
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.service.spec.ts
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts
│   │   │   └── dto/
│   │   │       ├── register.dto.ts
│   │   │       └── login.dto.ts
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.service.spec.ts
│   │   │   └── dto/
│   │   │       └── update-profile.dto.ts
│   │   ├── conversations/
│   │   │   ├── conversations.module.ts
│   │   │   ├── conversations.controller.ts
│   │   │   ├── conversations.service.ts
│   │   │   ├── conversations.service.spec.ts
│   │   │   └── dto/
│   │   │       ├── create-conversation.dto.ts
│   │   │       └── add-member.dto.ts
│   │   ├── messages/
│   │   │   ├── messages.module.ts
│   │   │   ├── messages.controller.ts
│   │   │   ├── messages.service.ts
│   │   │   ├── messages.service.spec.ts
│   │   │   └── dto/
│   │   │       └── messages-query.dto.ts
│   │   ├── files/
│   │   │   ├── files.module.ts
│   │   │   ├── files.controller.ts
│   │   │   └── files.service.ts
│   │   └── gateway/
│   │       ├── gateway.module.ts
│   │       ├── chat.gateway.ts
│   │       └── ws-jwt.guard.ts
│   └── test/
│       ├── jest-e2e.json
│       └── auth.e2e-spec.ts
│
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── postcss.config.js
    ├── components.json                   # shadcn/ui config
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── index.css                     # tailwind + design tokens
        ├── vite-env.d.ts
        ├── lib/
        │   ├── api.ts                    # axios instance + interceptors
        │   ├── socket.ts                 # socket.io client singleton
        │   └── utils.ts                  # cn(), formatDate(), etc.
        ├── stores/
        │   ├── auth.store.ts             # user, token, login/logout actions
        │   ├── conversation.store.ts     # activeConversationId
        │   └── ui.store.ts               # theme, sidebar open
        ├── hooks/
        │   ├── useSocket.ts              # socket connect/disconnect lifecycle
        │   ├── useAuth.ts                # login, register, refresh mutations
        │   └── useMessages.ts            # infinite query + socket cache updates
        ├── components/
        │   ├── ui/                       # shadcn/ui primitives (button, input, avatar, etc.)
        │   ├── ConversationList.tsx
        │   ├── ConversationItem.tsx
        │   ├── ChatPanel.tsx
        │   ├── MessageBubble.tsx
        │   ├── MessageInput.tsx
        │   ├── UserSearch.tsx
        │   ├── GroupCreate.tsx
        │   └── ProfileCard.tsx
        └── features/
            ├── auth/
            │   ├── LoginPage.tsx
            │   └── RegisterPage.tsx
            ├── chat/
            │   └── ChatLayout.tsx
            └── settings/
                └── SettingsPage.tsx
```

---

## Phase 1: Bootstrap

### Task 1: Root monorepo + git + gitignore

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `.env.example`

- [ ] **Step 1: Create root package.json with workspaces**

```json
{
  "name": "senchat",
  "private": true,
  "workspaces": ["shared", "backend", "frontend"],
  "scripts": {
    "dev:backend": "npm run dev --workspace=backend",
    "dev:frontend": "npm run dev --workspace=frontend",
    "build": "npm run build --workspace=shared && npm run build --workspaces --if-present",
    "lint": "npm run lint --workspaces --if-present"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

- [ ] **Step 2: Create .gitignore**

```gitignore
node_modules/
dist/
.env
*.env.local
uploads/
.DS_Store
Thumbs.db
*.log
coverage/
.turbo/
```

- [ ] **Step 3: Create .env.example**

```env
# Database
DATABASE_URL="mysql://senchat:senchat_dev@localhost:3306/senchat"

# JWT
JWT_SECRET="change-me-in-production-min-32-chars!!"
JWT_REFRESH_SECRET="change-me-too-in-production-min-32!!"

# App
BACKEND_PORT=3000
FRONTEND_URL=http://localhost:5173
```

- [ ] **Step 4: Commit**

```bash
git add package.json .gitignore .env.example
git commit -m "chore: init monorepo with npm workspaces"
```

---

### Task 2: Shared TypeScript config + shared package

**Files:**
- Create: `tsconfig.base.json`
- Create: `shared/package.json`
- Create: `shared/tsconfig.json`
- Create: `shared/src/index.ts`

- [ ] **Step 1: Create tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

- [ ] **Step 2: Create shared package**

`shared/package.json`:
```json
{
  "name": "@senchat/shared",
  "version": "0.0.1",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.5.0"
  }
}
```

`shared/tsconfig.json`:
```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create shared types**

`shared/src/types/user.ts`:
```typescript
export interface User {
  id: string;
  email: string;
  displayName: string;
  avatar: string | null;
  bio: string | null;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
}

export type PublicUser = Omit<User, 'email'>;

export interface AuthResponse {
  accessToken: string;
  user: User;
}
```

`shared/src/types/conversation.ts`:
```typescript
export type ConversationType = 'DIRECT' | 'GROUP';
export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface ConversationMember {
  id: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
  lastReadAt: string;
  user: {
    id: string;
    displayName: string;
    avatar: string | null;
    isOnline: boolean;
  };
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string | null;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
  members: ConversationMember[];
  lastMessage: MessagePreview | null;
  unreadCount: number;
}

export interface MessagePreview {
  id: string;
  content: string | null;
  type: string;
  senderId: string;
  senderName: string;
  createdAt: string;
}
```

`shared/src/types/message.ts`:
```typescript
export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
  sender: {
    id: string;
    displayName: string;
    avatar: string | null;
  };
}

export interface PaginatedMessages {
  messages: Message[];
  nextCursor: string | null;
  hasMore: boolean;
}
```

`shared/src/types/index.ts`:
```typescript
export * from './user';
export * from './conversation';
export * from './message';
```

- [ ] **Step 4: Create shared socket events**

`shared/src/events/socket-events.ts`:
```typescript
import type { Message, MessageType } from '../types/message';

// --- Event name constants ---
export const SOCKET_EVENTS = {
  // Client → Server
  MESSAGE_SEND: 'message:send',
  MESSAGE_READ: 'message:read',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',

  // Server → Client
  MESSAGE_NEW: 'message:new',
  MESSAGE_STATUS: 'message:status',
  TYPING_UPDATE: 'typing:update',
  PRESENCE_CHANGE: 'presence:change',
  CONVERSATION_UPDATED: 'conversation:updated',
  MEMBER_ADDED: 'member:added',
  MEMBER_REMOVED: 'member:removed',
  ERROR: 'error',
} as const;

// --- Payload types ---
export interface SendMessagePayload {
  conversationId: string;
  type: MessageType;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface ReadMessagePayload {
  conversationId: string;
  messageId: string;
}

export interface TypingPayload {
  conversationId: string;
}

export interface TypingUpdatePayload {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface PresencePayload {
  userId: string;
  isOnline: boolean;
  lastSeen: string;
}

export interface MessageStatusPayload {
  messageId: string;
  conversationId: string;
  userId: string;
  readAt: string;
}

export interface MemberChangePayload {
  conversationId: string;
  userId: string;
}

export interface SocketErrorPayload {
  code: string;
  message: string;
}
```

`shared/src/events/index.ts`:
```typescript
export * from './socket-events';
```

`shared/src/index.ts`:
```typescript
export * from './types';
export * from './events';
```

- [ ] **Step 5: Commit**

```bash
git add tsconfig.base.json shared/
git commit -m "feat: add shared package with types and socket event contracts"
```

---

### Task 3: Docker Compose + MySQL

**Files:**
- Create: `docker-compose.yml`

- [ ] **Step 1: Create docker-compose.yml**

```yaml
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
    command: --default-authentication-plugin=mysql_native_password

volumes:
  mysql_data:
```

- [ ] **Step 2: Start MySQL and verify**

```bash
docker-compose up -d
docker-compose ps
```

Expected: mysql container running, port 3306 mapped.

- [ ] **Step 3: Commit**

```bash
git add docker-compose.yml
git commit -m "infra: add docker-compose with MySQL 8"
```

---

### Task 4: Backend NestJS bootstrap

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/tsconfig.build.json`
- Create: `backend/nest-cli.json`
- Create: `backend/.env`
- Create: `backend/.env.example`
- Create: `backend/src/main.ts`
- Create: `backend/src/app.module.ts`

- [ ] **Step 1: Initialize backend package**

```bash
cd backend
npm init -y
```

Then replace `backend/package.json` with:

```json
{
  "name": "@senchat/backend",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "nest start",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,test}/**/*.ts\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:seed": "ts-node prisma/seed.ts"
  },
  "dependencies": {
    "@nestjs/common": "^10.4.0",
    "@nestjs/core": "^10.4.0",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/platform-express": "^10.4.0",
    "@nestjs/platform-socket.io": "^10.4.0",
    "@nestjs/throttler": "^6.0.0",
    "@nestjs/websockets": "^10.4.0",
    "@prisma/client": "^6.0.0",
    "@senchat/shared": "*",
    "bcrypt": "^5.1.1",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "cookie-parser": "^1.4.7",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1",
    "uuid": "^10.0.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.4.0",
    "@nestjs/schematics": "^10.1.0",
    "@nestjs/testing": "^10.4.0",
    "@types/bcrypt": "^5.0.2",
    "@types/cookie-parser": "^1.4.7",
    "@types/express": "^5.0.0",
    "@types/jest": "^29.5.0",
    "@types/multer": "^1.4.12",
    "@types/node": "^20.0.0",
    "@types/passport-jwt": "^4.0.1",
    "@types/uuid": "^10.0.0",
    "jest": "^29.7.0",
    "prisma": "^6.0.0",
    "supertest": "^7.0.0",
    "ts-jest": "^29.2.0",
    "ts-node": "^10.9.0",
    "typescript": "^5.5.0"
  },
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": { "^.+\\.(t|j)s$": "ts-jest" },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node",
    "moduleNameMapper": {
      "^@senchat/shared$": "<rootDir>/../../shared/src"
    }
  }
}
```

- [ ] **Step 2: Create TypeScript configs**

`backend/tsconfig.json`:
```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "module": "commonjs",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "paths": {
      "@senchat/shared": ["../shared/src"]
    }
  },
  "include": ["src"]
}
```

`backend/tsconfig.build.json`:
```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*.spec.ts"]
}
```

`backend/nest-cli.json`:
```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "tsConfigPath": "tsconfig.build.json"
  }
}
```

- [ ] **Step 3: Create .env files**

`backend/.env`:
```env
DATABASE_URL="mysql://senchat:senchat_dev@localhost:3306/senchat"
JWT_SECRET="dev-jwt-secret-change-in-production-32chars"
JWT_REFRESH_SECRET="dev-refresh-secret-change-in-prod-32chars"
BACKEND_PORT=3000
FRONTEND_URL=http://localhost:5173
```

`backend/.env.example`:
```env
DATABASE_URL="mysql://senchat:senchat_dev@localhost:3306/senchat"
JWT_SECRET="change-me"
JWT_REFRESH_SECRET="change-me"
BACKEND_PORT=3000
FRONTEND_URL=http://localhost:5173
```

- [ ] **Step 4: Create app.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    PrismaModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
```

- [ ] **Step 5: Create main.ts**

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  const port = process.env.BACKEND_PORT || 3000;
  await app.listen(port);
  console.log(`SenChat backend running on http://localhost:${port}`);
}
bootstrap();
```

- [ ] **Step 6: Install deps and verify compilation**

```bash
cd backend && npm install
npx nest build
```

Expected: compiles without errors (PrismaModule not yet created — will error). That's expected; we fix it in Task 5.

- [ ] **Step 7: Commit**

```bash
git add backend/
git commit -m "feat: bootstrap NestJS backend with validation, CORS, rate limiting"
```

---

### Task 5: Prisma setup + schema + migration

**Files:**
- Create: `backend/prisma/schema.prisma`
- Create: `backend/src/prisma/prisma.module.ts`
- Create: `backend/src/prisma/prisma.service.ts`

- [ ] **Step 1: Create Prisma schema**

`backend/prisma/schema.prisma`:
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
  fileSize        Int?
  createdAt      DateTime    @default(now())
  editedAt       DateTime?
  deletedAt      DateTime?

  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender         User         @relation(fields: [senderId], references: [id], onDelete: Cascade)

  @@index([conversationId, createdAt])
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

- [ ] **Step 2: Create PrismaService**

`backend/src/prisma/prisma.service.ts`:
```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

`backend/src/prisma/prisma.module.ts`:
```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- [ ] **Step 3: Generate Prisma client + run migration**

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

Expected: migration created, Prisma client generated. MySQL tables created.

- [ ] **Step 4: Verify NestJS compiles and starts**

```bash
cd backend && npx nest build && node dist/main.js
```

Expected: `SenChat backend running on http://localhost:3000`. Ctrl+C to stop.

- [ ] **Step 5: Commit**

```bash
git add backend/prisma/ backend/src/prisma/
git commit -m "feat: add Prisma schema with all models and run initial migration"
```

---

### Task 6: Frontend Vite + React + Tailwind bootstrap

**Files:**
- Create: `frontend/` (Vite scaffold)
- Create: `frontend/tailwind.config.ts`
- Create: `frontend/src/index.css`
- Create: `frontend/src/lib/utils.ts`

- [ ] **Step 1: Scaffold Vite React project**

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend && npm install
```

- [ ] **Step 2: Install dependencies**

```bash
cd frontend
npm install axios socket.io-client zustand @tanstack/react-query react-router-dom lucide-react clsx tailwind-merge
npm install -D tailwindcss postcss autoprefixer @types/node
npx tailwindcss init -p --ts
```

- [ ] **Step 3: Update frontend/package.json — add workspace dep + scripts**

Add to `dependencies` in `frontend/package.json`:
```json
"@senchat/shared": "*"
```

Update `scripts`:
```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "lint": "eslint ."
}
```

- [ ] **Step 4: Configure Tailwind with SenChat design tokens**

`frontend/tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sn: {
          green: '#00853F',
          gold: '#FDEF42',
          'gold-dark': '#C7A500',
          red: '#E31B23',
        },
        dark: {
          bg: '#0B141A',
          surface: '#1F2C34',
          input: '#233039',
          border: '#2A3942',
        },
        light: {
          bg: '#FFFFFF',
          surface: '#F0F2F5',
          border: '#E9EDEF',
        },
        bubble: {
          'out-dark': '#005C4B',
          'out-light': '#D9FDD3',
          'in-dark': '#1F2C34',
          'in-light': '#FFFFFF',
        },
        text: {
          primary: {
            dark: '#E9EDEF',
            light: '#111B21',
          },
          secondary: {
            dark: '#8696A0',
            light: '#667781',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 5: Create global CSS with design tokens**

`frontend/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

@layer base {
  :root {
    --color-primary: #00853F;
    --color-accent: #C7A500;
    --color-danger: #E31B23;
    --color-bg: #FFFFFF;
    --color-surface: #F0F2F5;
    --color-input: #FFFFFF;
    --color-bubble-out: #D9FDD3;
    --color-bubble-in: #FFFFFF;
    --color-text-primary: #111B21;
    --color-text-secondary: #667781;
    --color-border: #E9EDEF;
  }

  .dark {
    --color-accent: #FDEF42;
    --color-bg: #0B141A;
    --color-surface: #1F2C34;
    --color-input: #233039;
    --color-bubble-out: #005C4B;
    --color-bubble-in: #1F2C34;
    --color-text-primary: #E9EDEF;
    --color-text-secondary: #8696A0;
    --color-border: #2A3942;
  }

  body {
    @apply bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans;
  }
}
```

- [ ] **Step 6: Create utils**

`frontend/src/lib/utils.ts`:
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) {
    return date.toLocaleDateString('fr-FR', { weekday: 'long' });
  }
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + '…';
}
```

- [ ] **Step 7: Update App.tsx with placeholder**

`frontend/src/App.tsx`:
```tsx
function App() {
  return (
    <div className="dark min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-sn-green mb-2">SenChat</h1>
        <p className="text-[var(--color-text-secondary)]">Messagerie sénégalaise</p>
      </div>
    </div>
  );
}

export default App;
```

- [ ] **Step 8: Verify frontend starts**

```bash
cd frontend && npm run dev
```

Expected: Vite serves on `http://localhost:5173`, page shows "SenChat" in green with dark background.

- [ ] **Step 9: Commit**

```bash
git add frontend/
git commit -m "feat: bootstrap React frontend with Vite, Tailwind, SenChat design tokens"
```

---

## Phase 2: Backend Auth

### Task 7: Common decorators + exception filter

**Files:**
- Create: `backend/src/common/decorators/public.decorator.ts`
- Create: `backend/src/common/decorators/current-user.decorator.ts`
- Create: `backend/src/common/filters/http-exception.filter.ts`

- [ ] **Step 1: Create @Public() decorator**

`backend/src/common/decorators/public.decorator.ts`:
```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

- [ ] **Step 2: Create @CurrentUser() decorator**

`backend/src/common/decorators/current-user.decorator.ts`:
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
```

- [ ] **Step 3: Create global exception filter**

`backend/src/common/filters/http-exception.filter.ts`:
```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        message = (res as any).message || exception.message;
        error = (res as any).error || 'Error';
      } else {
        message = res as string;
      }
    } else {
      this.logger.error('Unhandled exception', exception);
    }

    response.status(status).json({
      statusCode: status,
      message,
      error,
    });
  }
}
```

- [ ] **Step 4: Register filter in main.ts**

Add to `backend/src/main.ts` inside `bootstrap()`, after `app.setGlobalPrefix('api')`:
```typescript
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

// ... inside bootstrap():
app.useGlobalFilters(new GlobalExceptionFilter());
```

- [ ] **Step 5: Commit**

```bash
git add backend/src/common/ backend/src/main.ts
git commit -m "feat: add @Public, @CurrentUser decorators and global exception filter"
```

---

### Task 8: Auth module — JWT strategy + guard

**Files:**
- Create: `backend/src/auth/auth.module.ts`
- Create: `backend/src/auth/auth.service.ts`
- Create: `backend/src/auth/auth.controller.ts`
- Create: `backend/src/auth/strategies/jwt.strategy.ts`
- Create: `backend/src/auth/dto/register.dto.ts`
- Create: `backend/src/auth/dto/login.dto.ts`

- [ ] **Step 1: Create DTOs**

`backend/src/auth/dto/register.dto.ts`:
```typescript
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  displayName: string;
}
```

`backend/src/auth/dto/login.dto.ts`:
```typescript
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
```

- [ ] **Step 2: Create JWT strategy**

`backend/src/auth/strategies/jwt.strategy.ts`:
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret',
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatar: true,
        bio: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
```

- [ ] **Step 3: Create AuthService**

`backend/src/auth/auth.service.ts`:
```typescript
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        displayName: dto.displayName,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatar: true,
        bio: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email);

    return { user, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password, ...userWithoutPassword } = user;
    const tokens = await this.generateTokens(user.id, user.email);

    return { user: userWithoutPassword, ...tokens };
  }

  async refresh(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotate: delete old token
    await this.prisma.refreshToken.delete({ where: { id: stored.id } });

    const { password, ...user } = stored.user;
    const tokens = await this.generateTokens(user.id, user.email);

    return { user, ...tokens };
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  private async generateTokens(userId: string, email: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId, email },
      { secret: process.env.JWT_SECRET, expiresIn: '15m' },
    );

    const refreshTokenValue = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshTokenValue,
        expiresAt,
      },
    });

    return { accessToken, refreshToken: refreshTokenValue };
  }
}
```

- [ ] **Step 4: Create AuthController**

`backend/src/auth/auth.controller.ts`:
```typescript
import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }
    const result = await this.authService.refresh(refreshToken);
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    res.clearCookie('refreshToken');
    return { message: 'Logged out' };
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/auth',
    });
  }
}
```

- [ ] **Step 5: Create AuthModule and wire into AppModule**

`backend/src/auth/auth.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
```

Update `backend/src/app.module.ts` — add AuthModule + JwtAuthGuard as global guard:

```typescript
import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { IS_PUBLIC_KEY } from './common/decorators/public.decorator';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    PrismaModule,
    AuthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
```

- [ ] **Step 6: Verify compilation**

```bash
cd backend && npx nest build
```

Expected: compiles without errors.

- [ ] **Step 7: Commit**

```bash
git add backend/src/auth/ backend/src/app.module.ts
git commit -m "feat: add auth module with register, login, refresh, logout + JWT guard"
```

---

### Task 9: Auth unit tests

**Files:**
- Create: `backend/src/auth/auth.service.spec.ts`

- [ ] **Step 1: Write auth service tests**

`backend/src/auth/auth.service.spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwt: any;

  const mockUser = {
    id: 'user-1',
    email: 'test@test.com',
    password: '$2b$12$hashedpassword',
    displayName: 'Test User',
    avatar: null,
    bio: null,
    isOnline: false,
    lastSeen: new Date(),
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      refreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    jwt = {
      sign: jest.fn().mockReturnValue('mock-access-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should create a new user and return tokens', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const { password, ...userWithoutPassword } = mockUser;
      prisma.user.create.mockResolvedValue(userWithoutPassword);
      prisma.refreshToken.create.mockResolvedValue({ id: 'rt-1' });

      const result = await service.register({
        email: 'test@test.com',
        password: 'password123',
        displayName: 'Test User',
      });

      expect(result.user.email).toBe('test@test.com');
      expect(result.accessToken).toBe('mock-access-token');
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'test@test.com',
          password: 'password123',
          displayName: 'Test User',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const hashed = await bcrypt.hash('password123', 12);
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, password: hashed });
      prisma.refreshToken.create.mockResolvedValue({ id: 'rt-1' });

      const result = await service.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result.accessToken).toBe('mock-access-token');
      expect(result.user.email).toBe('test@test.com');
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const hashed = await bcrypt.hash('password123', 12);
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, password: hashed });

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for unknown email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@test.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should delete the refresh token', async () => {
      prisma.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

      await service.logout('some-refresh-token');

      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { token: 'some-refresh-token' },
      });
    });
  });
});
```

- [ ] **Step 2: Run tests**

```bash
cd backend && npx jest src/auth/auth.service.spec.ts --verbose
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add backend/src/auth/auth.service.spec.ts
git commit -m "test: add auth service unit tests (register, login, logout)"
```

---

## Phase 3: Users + Conversations Backend

### Task 10: Users module

**Files:**
- Create: `backend/src/users/users.module.ts`
- Create: `backend/src/users/users.service.ts`
- Create: `backend/src/users/users.controller.ts`
- Create: `backend/src/users/dto/update-profile.dto.ts`

- [ ] **Step 1: Create DTO**

`backend/src/users/dto/update-profile.dto.ts`:
```typescript
import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;
}
```

- [ ] **Step 2: Create UsersService**

`backend/src/users/users.service.ts`:
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

const PUBLIC_USER_SELECT = {
  id: true,
  email: true,
  displayName: true,
  avatar: true,
  bio: true,
  isOnline: true,
  lastSeen: true,
  createdAt: true,
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: PUBLIC_USER_SELECT,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: PUBLIC_USER_SELECT,
    });
  }

  async updateAvatar(userId: string, avatarPath: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarPath },
      select: PUBLIC_USER_SELECT,
    });
  }

  async search(query: string, currentUserId: string) {
    return this.prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUserId } },
          {
            OR: [
              { displayName: { contains: query } },
              { email: { contains: query } },
            ],
          },
        ],
      },
      select: {
        id: true,
        displayName: true,
        avatar: true,
        isOnline: true,
      },
      take: 20,
    });
  }

  async setOnlineStatus(userId: string, isOnline: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isOnline,
        lastSeen: new Date(),
      },
    });
  }
}
```

- [ ] **Step 3: Create UsersController**

`backend/src/users/users.controller.ts`:
```typescript
import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Patch('me')
  updateMe(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (_req, file, cb) => {
          const name = uuidv4() + extname(file.originalname);
          cb(null, name);
        },
      }),
    }),
  )
  async uploadAvatar(
    @CurrentUser('id') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const avatarPath = `/uploads/avatars/${file.filename}`;
    return this.usersService.updateAvatar(userId, avatarPath);
  }

  @Get('search')
  search(
    @Query('q') query: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.usersService.search(query || '', userId);
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.usersService.getProfile(id);
  }
}
```

- [ ] **Step 4: Create UsersModule and wire in**

`backend/src/users/users.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

Add to `backend/src/app.module.ts` imports:
```typescript
import { UsersModule } from './users/users.module';

// In @Module imports array, add:
UsersModule,
```

- [ ] **Step 5: Create uploads directory**

```bash
mkdir -p backend/uploads/avatars
echo "*\n!.gitkeep" > backend/uploads/.gitignore
touch backend/uploads/avatars/.gitkeep
```

- [ ] **Step 6: Verify compilation**

```bash
cd backend && npx nest build
```

- [ ] **Step 7: Commit**

```bash
git add backend/src/users/ backend/src/app.module.ts backend/uploads/
git commit -m "feat: add users module with profile CRUD, avatar upload, search"
```

---

### Task 11: Conversations module

**Files:**
- Create: `backend/src/conversations/conversations.module.ts`
- Create: `backend/src/conversations/conversations.service.ts`
- Create: `backend/src/conversations/conversations.controller.ts`
- Create: `backend/src/conversations/dto/create-conversation.dto.ts`
- Create: `backend/src/conversations/dto/add-member.dto.ts`

- [ ] **Step 1: Create DTOs**

`backend/src/conversations/dto/create-conversation.dto.ts`:
```typescript
import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  ArrayMinSize,
  ArrayMaxSize,
  MaxLength,
} from 'class-validator';

export class CreateConversationDto {
  @IsEnum(['DIRECT', 'GROUP'])
  type: 'DIRECT' | 'GROUP';

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(255)
  @IsString({ each: true })
  memberIds: string[];
}
```

`backend/src/conversations/dto/add-member.dto.ts`:
```typescript
import { IsString } from 'class-validator';

export class AddMemberDto {
  @IsString()
  userId: string;
}
```

- [ ] **Step 2: Create ConversationsService**

`backend/src/conversations/conversations.service.ts`:
```typescript
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateConversationDto, creatorId: string) {
    if (dto.type === 'DIRECT') {
      if (dto.memberIds.length !== 1) {
        throw new BadRequestException('Direct conversation requires exactly one other member');
      }
      // Check if direct conversation already exists
      const existing = await this.findDirectConversation(creatorId, dto.memberIds[0]);
      if (existing) return existing;
    }

    if (dto.type === 'GROUP' && !dto.name) {
      throw new BadRequestException('Group conversation requires a name');
    }

    const allMemberIds = [creatorId, ...dto.memberIds.filter((id) => id !== creatorId)];

    const conversation = await this.prisma.conversation.create({
      data: {
        type: dto.type,
        name: dto.name || null,
        members: {
          create: allMemberIds.map((userId, index) => ({
            userId,
            role: index === 0 ? 'OWNER' : 'MEMBER',
          })),
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, displayName: true, avatar: true, isOnline: true },
            },
          },
        },
      },
    });

    return { ...conversation, lastMessage: null, unreadCount: 0 };
  }

  async listForUser(userId: string, cursor?: string, limit = 20) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, displayName: true, avatar: true, isOnline: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          where: { deletedAt: null },
          include: {
            sender: {
              select: { id: true, displayName: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    // Compute unread counts
    const result = await Promise.all(
      conversations.map(async (conv) => {
        const membership = conv.members.find((m) => m.userId === userId);
        const unreadCount = membership
          ? await this.prisma.message.count({
              where: {
                conversationId: conv.id,
                createdAt: { gt: membership.lastReadAt },
                senderId: { not: userId },
                deletedAt: null,
              },
            })
          : 0;

        const lastMsg = conv.messages[0] || null;
        const lastMessage = lastMsg
          ? {
              id: lastMsg.id,
              content: lastMsg.content,
              type: lastMsg.type,
              senderId: lastMsg.senderId,
              senderName: lastMsg.sender.displayName,
              createdAt: lastMsg.createdAt.toISOString(),
            }
          : null;

        const { messages, ...rest } = conv;
        return { ...rest, lastMessage, unreadCount };
      }),
    );

    return result;
  }

  async getById(conversationId: string, userId: string) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, displayName: true, avatar: true, isOnline: true },
            },
          },
        },
      },
    });

    if (!conv) throw new NotFoundException('Conversation not found');
    if (!conv.members.some((m) => m.userId === userId)) {
      throw new ForbiddenException('Not a member of this conversation');
    }

    return conv;
  }

  async addMember(conversationId: string, targetUserId: string, actorId: string) {
    const conv = await this.getById(conversationId, actorId);

    if (conv.type !== 'GROUP') {
      throw new BadRequestException('Cannot add members to direct conversation');
    }

    const actor = conv.members.find((m) => m.userId === actorId);
    if (!actor || actor.role === 'MEMBER') {
      throw new ForbiddenException('Only admins or owner can add members');
    }

    if (conv.members.length >= 256) {
      throw new BadRequestException('Group is full (max 256 members)');
    }

    return this.prisma.conversationMember.create({
      data: {
        conversationId,
        userId: targetUserId,
        role: 'MEMBER',
      },
      include: {
        user: {
          select: { id: true, displayName: true, avatar: true, isOnline: true },
        },
      },
    });
  }

  async removeMember(conversationId: string, targetUserId: string, actorId: string) {
    const conv = await this.getById(conversationId, actorId);

    if (conv.type !== 'GROUP') {
      throw new BadRequestException('Cannot remove members from direct conversation');
    }

    const actor = conv.members.find((m) => m.userId === actorId);
    if (!actor || actor.role === 'MEMBER') {
      throw new ForbiddenException('Only admins or owner can remove members');
    }

    const target = conv.members.find((m) => m.userId === targetUserId);
    if (!target) throw new NotFoundException('Member not found');
    if (target.role === 'OWNER') throw new ForbiddenException('Cannot remove the owner');

    await this.prisma.conversationMember.delete({ where: { id: target.id } });
    return { removed: true };
  }

  async leave(conversationId: string, userId: string) {
    const conv = await this.getById(conversationId, userId);
    const member = conv.members.find((m) => m.userId === userId);
    if (!member) throw new NotFoundException('Not a member');

    if (member.role === 'OWNER' && conv.type === 'GROUP') {
      // Transfer ownership to the next admin, or first member
      const next =
        conv.members.find((m) => m.userId !== userId && m.role === 'ADMIN') ||
        conv.members.find((m) => m.userId !== userId);
      if (next) {
        await this.prisma.conversationMember.update({
          where: { id: next.id },
          data: { role: 'OWNER' },
        });
      }
    }

    await this.prisma.conversationMember.delete({ where: { id: member.id } });
    return { left: true };
  }

  async updateGroup(conversationId: string, userId: string, data: { name?: string }) {
    const conv = await this.getById(conversationId, userId);
    if (conv.type !== 'GROUP') throw new BadRequestException('Not a group');

    const member = conv.members.find((m) => m.userId === userId);
    if (!member || member.role === 'MEMBER') {
      throw new ForbiddenException('Only admins or owner can update group');
    }

    return this.prisma.conversation.update({
      where: { id: conversationId },
      data,
    });
  }

  private async findDirectConversation(userA: string, userB: string) {
    const conv = await this.prisma.conversation.findFirst({
      where: {
        type: 'DIRECT',
        AND: [
          { members: { some: { userId: userA } } },
          { members: { some: { userId: userB } } },
        ],
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, displayName: true, avatar: true, isOnline: true },
            },
          },
        },
      },
    });
    return conv ? { ...conv, lastMessage: null, unreadCount: 0 } : null;
  }
}
```

- [ ] **Step 3: Create ConversationsController**

`backend/src/conversations/conversations.controller.ts`:
```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('conversations')
export class ConversationsController {
  constructor(private conversationsService: ConversationsService) {}

  @Post()
  create(
    @Body() dto: CreateConversationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.conversationsService.create(dto, userId);
  }

  @Get()
  list(
    @CurrentUser('id') userId: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.conversationsService.listForUser(userId, cursor);
  }

  @Get(':id')
  getOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.conversationsService.getById(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: { name?: string },
  ) {
    return this.conversationsService.updateGroup(id, userId, body);
  }

  @Post(':id/members')
  addMember(
    @Param('id') id: string,
    @Body() dto: AddMemberDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.conversationsService.addMember(id, dto.userId, userId);
  }

  @Delete(':id/members/:uid')
  removeMember(
    @Param('id') id: string,
    @Param('uid') uid: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.conversationsService.removeMember(id, uid, userId);
  }

  @Delete(':id/leave')
  leave(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.conversationsService.leave(id, userId);
  }
}
```

- [ ] **Step 4: Create module and wire in**

`backend/src/conversations/conversations.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';

@Module({
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
```

Add to `backend/src/app.module.ts` imports:
```typescript
import { ConversationsModule } from './conversations/conversations.module';
// In @Module imports array:
ConversationsModule,
```

- [ ] **Step 5: Verify compilation**

```bash
cd backend && npx nest build
```

- [ ] **Step 6: Commit**

```bash
git add backend/src/conversations/ backend/src/app.module.ts
git commit -m "feat: add conversations module with direct/group CRUD, member management"
```

---

## Phase 4: Messages + Files Backend

### Task 12: Messages module

**Files:**
- Create: `backend/src/messages/messages.module.ts`
- Create: `backend/src/messages/messages.service.ts`
- Create: `backend/src/messages/messages.controller.ts`
- Create: `backend/src/messages/dto/messages-query.dto.ts`

- [ ] **Step 1: Create DTO**

`backend/src/messages/dto/messages-query.dto.ts`:
```typescript
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class MessagesQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}

export class SearchMessagesDto {
  @IsString()
  q: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
```

- [ ] **Step 2: Create MessagesService**

`backend/src/messages/messages.service.ts`:
```typescript
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { MessageType } from '@prisma/client';

export interface CreateMessageData {
  conversationId: string;
  senderId: string;
  type: MessageType;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateMessageData) {
    // Verify sender is a member
    const membership = await this.prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId: data.conversationId,
          userId: data.senderId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Not a member of this conversation');
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId: data.conversationId,
        senderId: data.senderId,
        type: data.type,
        content: data.content || null,
        fileUrl: data.fileUrl || null,
        fileName: data.fileName || null,
        fileSize: data.fileSize || null,
      },
      include: {
        sender: {
          select: { id: true, displayName: true, avatar: true },
        },
      },
    });

    // Update conversation's updatedAt
    await this.prisma.conversation.update({
      where: { id: data.conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async getHistory(conversationId: string, userId: string, cursor?: string, limit = 50) {
    // Verify membership
    const membership = await this.prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Not a member of this conversation');
    }

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: { id: true, displayName: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1, // fetch one extra to determine hasMore
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = messages.length > limit;
    const sliced = hasMore ? messages.slice(0, limit) : messages;

    return {
      messages: sliced,
      nextCursor: hasMore ? sliced[sliced.length - 1].id : null,
      hasMore,
    };
  }

  async search(conversationId: string, userId: string, query: string, limit = 20) {
    const membership = await this.prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Not a member of this conversation');
    }

    return this.prisma.message.findMany({
      where: {
        conversationId,
        content: { contains: query },
        deletedAt: null,
      },
      include: {
        sender: {
          select: { id: true, displayName: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async softDelete(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) throw new NotFoundException('Message not found');
    if (message.senderId !== userId) {
      throw new ForbiddenException('Can only delete your own messages');
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date() },
    });
  }

  async markRead(conversationId: string, userId: string) {
    return this.prisma.conversationMember.update({
      where: {
        conversationId_userId: { conversationId, userId },
      },
      data: { lastReadAt: new Date() },
    });
  }
}
```

- [ ] **Step 3: Create MessagesController**

`backend/src/messages/messages.controller.ts`:
```typescript
import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesQueryDto, SearchMessagesDto } from './dto/messages-query.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller()
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get('conversations/:id/messages')
  getHistory(
    @Param('id') conversationId: string,
    @Query() query: MessagesQueryDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.messagesService.getHistory(
      conversationId,
      userId,
      query.cursor,
      query.limit,
    );
  }

  @Get('conversations/:id/messages/search')
  search(
    @Param('id') conversationId: string,
    @Query() query: SearchMessagesDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.messagesService.search(conversationId, userId, query.q, query.limit);
  }

  @Delete('messages/:id')
  deleteMessage(
    @Param('id') messageId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.messagesService.softDelete(messageId, userId);
  }
}
```

- [ ] **Step 4: Create module and wire in**

`backend/src/messages/messages.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';

@Module({
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
```

Add to `app.module.ts`:
```typescript
import { MessagesModule } from './messages/messages.module';
// In imports: MessagesModule,
```

- [ ] **Step 5: Commit**

```bash
git add backend/src/messages/ backend/src/app.module.ts
git commit -m "feat: add messages module with history, search, soft delete, read marking"
```

---

### Task 13: Files module

**Files:**
- Create: `backend/src/files/files.module.ts`
- Create: `backend/src/files/files.service.ts`
- Create: `backend/src/files/files.controller.ts`

- [ ] **Step 1: Create FilesService**

`backend/src/files/files.service.ts`:
```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'application/zip',
];

const MAX_SIZE = 25 * 1024 * 1024; // 25 MB

@Injectable()
export class FilesService {
  validateFile(file: Express.Multer.File) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} not allowed`);
    }
    if (file.size > MAX_SIZE) {
      throw new BadRequestException(`File too large (max ${MAX_SIZE / 1024 / 1024}MB)`);
    }
  }

  generateFilename(originalname: string): string {
    return uuidv4() + extname(originalname);
  }
}
```

- [ ] **Step 2: Create FilesController**

`backend/src/files/files.controller.ts`:
```typescript
import {
  Controller,
  Post,
  Get,
  Param,
  Res,
  UploadedFile,
  UseInterceptors,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { FilesService } from './files.service';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('files')
export class FilesController {
  constructor(
    private filesService: FilesService,
    private prisma: PrismaService,
  ) {}

  @Post('upload')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/files',
        filename: (_req, file, cb) => {
          cb(null, uuidv4() + extname(file.originalname));
        },
      }),
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: string,
  ) {
    this.filesService.validateFile(file);

    return {
      fileUrl: `/uploads/files/${file.filename}`,
      fileName: file.originalname,
      fileSize: file.size,
    };
  }

  @Get(':filename')
  async download(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filePath = join(process.cwd(), 'uploads', 'files', filename);

    if (!existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    return res.sendFile(filePath);
  }
}
```

- [ ] **Step 3: Create module and wire in**

`backend/src/files/files.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';

@Module({
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
```

Add to `app.module.ts`:
```typescript
import { FilesModule } from './files/files.module';
// In imports: FilesModule,
```

- [ ] **Step 4: Ensure uploads/files dir exists**

```bash
mkdir -p backend/uploads/files
touch backend/uploads/files/.gitkeep
```

- [ ] **Step 5: Add static file serving to main.ts**

Add to `backend/src/main.ts` inside `bootstrap()`:
```typescript
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

// Change NestFactory.create to:
const app = await NestFactory.create<NestExpressApplication>(AppModule);

// After setGlobalPrefix:
app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });
```

- [ ] **Step 6: Commit**

```bash
git add backend/src/files/ backend/src/main.ts backend/src/app.module.ts backend/uploads/files/
git commit -m "feat: add files module with upload, download, MIME validation"
```

---

## Phase 5: Socket.IO Gateway

### Task 14: Chat gateway with auth + all events

**Files:**
- Create: `backend/src/gateway/gateway.module.ts`
- Create: `backend/src/gateway/chat.gateway.ts`
- Create: `backend/src/gateway/ws-jwt.guard.ts`

- [ ] **Step 1: Create WS JWT guard**

`backend/src/gateway/ws-jwt.guard.ts`:
```typescript
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      throw new WsException('Missing authentication token');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          displayName: true,
          avatar: true,
        },
      });

      if (!user) {
        throw new WsException('User not found');
      }

      (client as any).user = user;
      return true;
    } catch {
      throw new WsException('Invalid token');
    }
  }
}
```

- [ ] **Step 2: Create ChatGateway**

`backend/src/gateway/chat.gateway.ts`:
```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { UseGuards, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { SOCKET_EVENTS } from '@senchat/shared';
import type {
  SendMessagePayload,
  ReadMessagePayload,
  TypingPayload,
} from '@senchat/shared';
import { PrismaService } from '../prisma/prisma.service';
import { MessagesService } from '../messages/messages.service';
import { UsersService } from '../users/users.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger(ChatGateway.name);

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private messagesService: MessagesService,
    private usersService: UsersService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, displayName: true },
      });

      if (!user) {
        client.disconnect();
        return;
      }

      (client as any).userId = user.id;

      // Join personal room
      client.join(`user:${user.id}`);

      // Join all conversation rooms
      const memberships = await this.prisma.conversationMember.findMany({
        where: { userId: user.id },
        select: { conversationId: true },
      });
      for (const m of memberships) {
        client.join(`conv:${m.conversationId}`);
      }

      // Set online
      await this.usersService.setOnlineStatus(user.id, true);
      this.server.emit(SOCKET_EVENTS.PRESENCE_CHANGE, {
        userId: user.id,
        isOnline: true,
        lastSeen: new Date().toISOString(),
      });

      this.logger.log(`Client connected: ${user.id}`);
    } catch {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = (client as any).userId;
    if (!userId) return;

    await this.usersService.setOnlineStatus(userId, false);
    this.server.emit(SOCKET_EVENTS.PRESENCE_CHANGE, {
      userId,
      isOnline: false,
      lastSeen: new Date().toISOString(),
    });

    this.logger.log(`Client disconnected: ${userId}`);
  }

  @SubscribeMessage(SOCKET_EVENTS.MESSAGE_SEND)
  async handleMessageSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessagePayload,
  ) {
    const userId = (client as any).userId;
    if (!userId) return;

    try {
      const message = await this.messagesService.create({
        conversationId: payload.conversationId,
        senderId: userId,
        type: payload.type as any,
        content: payload.content,
        fileUrl: payload.fileUrl,
        fileName: payload.fileName,
        fileSize: payload.fileSize,
      });

      this.server
        .to(`conv:${payload.conversationId}`)
        .emit(SOCKET_EVENTS.MESSAGE_NEW, message);
    } catch (error) {
      client.emit(SOCKET_EVENTS.ERROR, {
        code: 'MESSAGE_SEND_FAILED',
        message: error.message || 'Failed to send message',
      });
    }
  }

  @SubscribeMessage(SOCKET_EVENTS.MESSAGE_READ)
  async handleMessageRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ReadMessagePayload,
  ) {
    const userId = (client as any).userId;
    if (!userId) return;

    try {
      await this.messagesService.markRead(payload.conversationId, userId);

      this.server.to(`conv:${payload.conversationId}`).emit(
        SOCKET_EVENTS.MESSAGE_STATUS,
        {
          conversationId: payload.conversationId,
          userId,
          readAt: new Date().toISOString(),
        },
      );
    } catch (error) {
      this.logger.error('Failed to mark read', error);
    }
  }

  @SubscribeMessage(SOCKET_EVENTS.TYPING_START)
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: TypingPayload,
  ) {
    const userId = (client as any).userId;
    if (!userId) return;

    client.to(`conv:${payload.conversationId}`).emit(SOCKET_EVENTS.TYPING_UPDATE, {
      conversationId: payload.conversationId,
      userId,
      isTyping: true,
    });
  }

  @SubscribeMessage(SOCKET_EVENTS.TYPING_STOP)
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: TypingPayload,
  ) {
    const userId = (client as any).userId;
    if (!userId) return;

    client.to(`conv:${payload.conversationId}`).emit(SOCKET_EVENTS.TYPING_UPDATE, {
      conversationId: payload.conversationId,
      userId,
      isTyping: false,
    });
  }

  // Utility: emit to a specific conversation room (used by other services)
  emitToConversation(conversationId: string, event: string, data: any) {
    this.server.to(`conv:${conversationId}`).emit(event, data);
  }

  // Utility: add a user's socket to a conversation room (when added to group)
  async joinUserToConversation(userId: string, conversationId: string) {
    const sockets = await this.server.in(`user:${userId}`).fetchSockets();
    for (const socket of sockets) {
      socket.join(`conv:${conversationId}`);
    }
  }
}
```

- [ ] **Step 3: Create GatewayModule and wire in**

`backend/src/gateway/gateway.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatGateway } from './chat.gateway';
import { WsJwtGuard } from './ws-jwt.guard';
import { MessagesModule } from '../messages/messages.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
    }),
    MessagesModule,
    UsersModule,
  ],
  providers: [ChatGateway, WsJwtGuard],
  exports: [ChatGateway],
})
export class GatewayModule {}
```

Add to `app.module.ts`:
```typescript
import { GatewayModule } from './gateway/gateway.module';
// In imports: GatewayModule,
```

- [ ] **Step 4: Verify full backend compiles**

```bash
cd backend && npx nest build
```

Expected: compiles without errors.

- [ ] **Step 5: Commit**

```bash
git add backend/src/gateway/ backend/src/app.module.ts
git commit -m "feat: add Socket.IO gateway with JWT auth, messaging, typing, presence events"
```

---

### Task 15: Prisma seed script

**Files:**
- Create: `backend/prisma/seed.ts`

- [ ] **Step 1: Create seed with test users**

`backend/prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 12);

  const alice = await prisma.user.upsert({
    where: { email: 'alice@senchat.sn' },
    update: {},
    create: {
      email: 'alice@senchat.sn',
      password,
      displayName: 'Alice Diallo',
      bio: 'Développeuse à Dakar 🇸🇳',
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@senchat.sn' },
    update: {},
    create: {
      email: 'bob@senchat.sn',
      password,
      displayName: 'Bob Ndiaye',
      bio: 'Designer UI/UX',
    },
  });

  const charlie = await prisma.user.upsert({
    where: { email: 'charlie@senchat.sn' },
    update: {},
    create: {
      email: 'charlie@senchat.sn',
      password,
      displayName: 'Charlie Sow',
      bio: 'Product Manager',
    },
  });

  // Create a direct conversation between Alice and Bob
  const direct = await prisma.conversation.create({
    data: {
      type: 'DIRECT',
      members: {
        create: [
          { userId: alice.id, role: 'MEMBER' },
          { userId: bob.id, role: 'MEMBER' },
        ],
      },
    },
  });

  // Create a group conversation
  const group = await prisma.conversation.create({
    data: {
      type: 'GROUP',
      name: 'Equipe SenChat',
      members: {
        create: [
          { userId: alice.id, role: 'OWNER' },
          { userId: bob.id, role: 'ADMIN' },
          { userId: charlie.id, role: 'MEMBER' },
        ],
      },
    },
  });

  // Add some messages
  await prisma.message.createMany({
    data: [
      {
        conversationId: direct.id,
        senderId: alice.id,
        type: 'TEXT',
        content: 'Salut Bob, comment ça va ?',
      },
      {
        conversationId: direct.id,
        senderId: bob.id,
        type: 'TEXT',
        content: 'Ça va bien ! Et toi ?',
      },
      {
        conversationId: group.id,
        senderId: alice.id,
        type: 'TEXT',
        content: 'Bienvenue dans le groupe SenChat !',
      },
      {
        conversationId: group.id,
        senderId: charlie.id,
        type: 'TEXT',
        content: 'Merci ! Content de rejoindre le projet.',
      },
    ],
  });

  console.log('Seed complete: 3 users, 2 conversations, 4 messages');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 2: Add seed command to package.json**

In `backend/package.json`, add to the `prisma` section:
```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

- [ ] **Step 3: Run seed**

```bash
cd backend && npx prisma db seed
```

Expected: `Seed complete: 3 users, 2 conversations, 4 messages`

- [ ] **Step 4: Commit**

```bash
git add backend/prisma/seed.ts backend/package.json
git commit -m "feat: add Prisma seed with test users, conversations, messages"
```

---

## Phase 6: Frontend Core

### Task 16: API client + Auth store

**Files:**
- Create: `frontend/src/lib/api.ts`
- Create: `frontend/src/stores/auth.store.ts`

- [ ] **Step 1: Create API client with interceptors**

`frontend/src/lib/api.ts`:
```typescript
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // send cookies
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}> = [];

const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh');
        localStorage.setItem('accessToken', data.accessToken);
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
```

- [ ] **Step 2: Create auth store**

`frontend/src/stores/auth.store.ts`:
```typescript
import { create } from 'zustand';
import type { User } from '@senchat/shared';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),

  setAuth: (user, accessToken) => {
    localStorage.setItem('accessToken', accessToken);
    set({ user, accessToken, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.removeItem('accessToken');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
}));
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/api.ts frontend/src/stores/auth.store.ts
git commit -m "feat: add API client with auto-refresh interceptor and auth store"
```

---

### Task 17: Socket client + conversation/ui stores

**Files:**
- Create: `frontend/src/lib/socket.ts`
- Create: `frontend/src/stores/conversation.store.ts`
- Create: `frontend/src/stores/ui.store.ts`

- [ ] **Step 1: Create socket client**

`frontend/src/lib/socket.ts`:
```typescript
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(token: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected');
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket] Connection error:', error.message);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
```

- [ ] **Step 2: Create conversation store**

`frontend/src/stores/conversation.store.ts`:
```typescript
import { create } from 'zustand';

interface ConversationState {
  activeConversationId: string | null;
  typingUsers: Record<string, string[]>; // conversationId -> userId[]
  setActiveConversation: (id: string | null) => void;
  addTypingUser: (conversationId: string, userId: string) => void;
  removeTypingUser: (conversationId: string, userId: string) => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
  activeConversationId: null,
  typingUsers: {},

  setActiveConversation: (id) => set({ activeConversationId: id }),

  addTypingUser: (conversationId, userId) =>
    set((state) => {
      const current = state.typingUsers[conversationId] || [];
      if (current.includes(userId)) return state;
      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: [...current, userId],
        },
      };
    }),

  removeTypingUser: (conversationId, userId) =>
    set((state) => {
      const current = state.typingUsers[conversationId] || [];
      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: current.filter((id) => id !== userId),
        },
      };
    }),
}));
```

- [ ] **Step 3: Create UI store**

`frontend/src/stores/ui.store.ts`:
```typescript
import { create } from 'zustand';

type Theme = 'dark' | 'light';

interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: (localStorage.getItem('theme') as Theme) || 'dark',
  sidebarOpen: true,

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      return { theme: next };
    }),

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/lib/socket.ts frontend/src/stores/
git commit -m "feat: add socket client, conversation store, UI store with theme toggle"
```

---

### Task 18: React Router + Auth pages

**Files:**
- Create: `frontend/src/hooks/useAuth.ts`
- Create: `frontend/src/features/auth/LoginPage.tsx`
- Create: `frontend/src/features/auth/RegisterPage.tsx`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/main.tsx`

- [ ] **Step 1: Create useAuth hook**

`frontend/src/hooks/useAuth.ts`:
```typescript
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/auth.store';
import { disconnectSocket } from '../lib/socket';
import type { AuthResponse } from '@senchat/shared';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await api.post<AuthResponse>('/auth/login', data);
      return res.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      displayName: string;
    }) => {
      const res = await api.post<AuthResponse>('/auth/register', data);
      return res.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      disconnectSocket();
      clearAuth();
    },
  });
}

export function useRefreshAuth() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async () => {
      const res = await api.post<AuthResponse>('/auth/refresh');
      return res.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
    },
  });
}
```

- [ ] **Step 2: Create LoginPage**

`frontend/src/features/auth/LoginPage.tsx`:
```tsx
import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../../hooks/useAuth';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    login.mutate(
      { email, password },
      { onSuccess: () => navigate('/') },
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-sn-green mb-2">SenChat</h1>
          <p className="text-[var(--color-text-secondary)]">
            Connectez-vous pour continuer
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-[var(--color-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-sn-green"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 rounded-lg bg-[var(--color-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-sn-green"
              placeholder="••••••••"
            />
          </div>

          {login.error && (
            <p className="text-sn-red text-sm">
              {(login.error as any)?.response?.data?.message || 'Erreur de connexion'}
            </p>
          )}

          <button
            type="submit"
            disabled={login.isPending}
            className="w-full py-3 bg-sn-green text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {login.isPending ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center mt-6 text-[var(--color-text-secondary)]">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-sn-green hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create RegisterPage**

`frontend/src/features/auth/RegisterPage.tsx`:
```tsx
import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '../../hooks/useAuth';

export function RegisterPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const register = useRegister();
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    register.mutate(
      { email, password, displayName },
      { onSuccess: () => navigate('/') },
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-sn-green mb-2">SenChat</h1>
          <p className="text-[var(--color-text-secondary)]">
            Créez votre compte
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
              Nom d'affichage
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              minLength={2}
              maxLength={100}
              className="w-full px-4 py-3 rounded-lg bg-[var(--color-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-sn-green"
              placeholder="Votre nom"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-[var(--color-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-sn-green"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 rounded-lg bg-[var(--color-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-sn-green"
              placeholder="8 caractères minimum"
            />
          </div>

          {register.error && (
            <p className="text-sn-red text-sm">
              {(register.error as any)?.response?.data?.message || "Erreur d'inscription"}
            </p>
          )}

          <button
            type="submit"
            disabled={register.isPending}
            className="w-full py-3 bg-sn-green text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {register.isPending ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center mt-6 text-[var(--color-text-secondary)]">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-sn-green hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Update App.tsx with routing**

`frontend/src/App.tsx`:
```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { ChatLayout } from './features/chat/ChatLayout';
import { SettingsPage } from './features/settings/SettingsPage';
import { useAuthStore } from './stores/auth.store';
import { useUIStore } from './stores/ui.store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  const theme = useUIStore((s) => s.theme);

  return (
    <div className={theme}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ChatLayout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </div>
  );
}

export default App;
```

- [ ] **Step 5: Create placeholder ChatLayout and SettingsPage**

`frontend/src/features/chat/ChatLayout.tsx`:
```tsx
export function ChatLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] flex items-center justify-center">
      <p>Chat — en construction</p>
    </div>
  );
}
```

`frontend/src/features/settings/SettingsPage.tsx`:
```tsx
export function SettingsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] flex items-center justify-center">
      <p>Settings — en construction</p>
    </div>
  );
}
```

- [ ] **Step 6: Update main.tsx**

`frontend/src/main.tsx`:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 7: Verify frontend runs and routing works**

```bash
cd frontend && npm run dev
```

Expected: `http://localhost:5173` redirects to `/login`. Login form renders with SenChat branding on dark background.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/
git commit -m "feat: add auth pages, routing, TanStack Query provider, protected routes"
```

---

## Phase 7: Chat UI

### Task 19: useSocket hook + useMessages hook

**Files:**
- Create: `frontend/src/hooks/useSocket.ts`
- Create: `frontend/src/hooks/useMessages.ts`

- [ ] **Step 1: Create useSocket hook**

`frontend/src/hooks/useSocket.ts`:
```tsx
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { connectSocket, disconnectSocket, getSocket } from '../lib/socket';
import { useAuthStore } from '../stores/auth.store';
import { useConversationStore } from '../stores/conversation.store';
import { SOCKET_EVENTS } from '@senchat/shared';
import type { Message, Conversation, PresencePayload, TypingUpdatePayload } from '@senchat/shared';

export function useSocket() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();
  const addTypingUser = useConversationStore((s) => s.addTypingUser);
  const removeTypingUser = useConversationStore((s) => s.removeTypingUser);
  const initialized = useRef(false);

  useEffect(() => {
    if (!accessToken || initialized.current) return;
    initialized.current = true;

    const socket = connectSocket(accessToken);

    socket.on(SOCKET_EVENTS.MESSAGE_NEW, (message: Message) => {
      // Update messages cache for the conversation
      queryClient.setQueryData(
        ['messages', message.conversationId],
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any, index: number) =>
              index === 0
                ? { ...page, messages: [message, ...page.messages] }
                : page,
            ),
          };
        },
      );

      // Invalidate conversations list to update last message + order
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    socket.on(SOCKET_EVENTS.PRESENCE_CHANGE, (payload: PresencePayload) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    socket.on(SOCKET_EVENTS.TYPING_UPDATE, (payload: TypingUpdatePayload) => {
      if (payload.isTyping) {
        addTypingUser(payload.conversationId, payload.userId);
        // Auto-remove after 3 seconds
        setTimeout(() => {
          removeTypingUser(payload.conversationId, payload.userId);
        }, 3000);
      } else {
        removeTypingUser(payload.conversationId, payload.userId);
      }
    });

    socket.on(SOCKET_EVENTS.MESSAGE_STATUS, () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    return () => {
      disconnectSocket();
      initialized.current = false;
    };
  }, [accessToken, queryClient, addTypingUser, removeTypingUser]);
}
```

- [ ] **Step 2: Create useMessages hook**

`frontend/src/hooks/useMessages.ts`:
```tsx
import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { getSocket } from '../lib/socket';
import { SOCKET_EVENTS } from '@senchat/shared';
import type { PaginatedMessages, SendMessagePayload, MessageType } from '@senchat/shared';

export function useMessages(conversationId: string | null) {
  return useInfiniteQuery<PaginatedMessages>({
    queryKey: ['messages', conversationId],
    queryFn: async ({ pageParam }) => {
      const params: any = { limit: 50 };
      if (pageParam) params.cursor = pageParam;
      const res = await api.get(
        `/conversations/${conversationId}/messages`,
        { params },
      );
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
    enabled: !!conversationId,
  });
}

export function sendMessage(payload: {
  conversationId: string;
  type: MessageType;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}) {
  const socket = getSocket();
  if (!socket) return;
  socket.emit(SOCKET_EVENTS.MESSAGE_SEND, payload);
}

export function markAsRead(conversationId: string, messageId: string) {
  const socket = getSocket();
  if (!socket) return;
  socket.emit(SOCKET_EVENTS.MESSAGE_READ, { conversationId, messageId });
}

export function emitTyping(conversationId: string, isTyping: boolean) {
  const socket = getSocket();
  if (!socket) return;
  socket.emit(
    isTyping ? SOCKET_EVENTS.TYPING_START : SOCKET_EVENTS.TYPING_STOP,
    { conversationId },
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/hooks/
git commit -m "feat: add useSocket hook (real-time cache updates) and useMessages hook"
```

---

### Task 20: ConversationList + ConversationItem components

**Files:**
- Create: `frontend/src/components/ConversationList.tsx`
- Create: `frontend/src/components/ConversationItem.tsx`

- [ ] **Step 1: Create ConversationItem**

`frontend/src/components/ConversationItem.tsx`:
```tsx
import type { Conversation } from '@senchat/shared';
import { useAuthStore } from '../stores/auth.store';
import { formatTime, getInitials, truncate } from '../lib/utils';

interface Props {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export function ConversationItem({ conversation, isActive, onClick }: Props) {
  const currentUser = useAuthStore((s) => s.user);

  const displayName =
    conversation.type === 'DIRECT'
      ? conversation.members.find((m) => m.userId !== currentUser?.id)?.user
          .displayName || 'Utilisateur'
      : conversation.name || 'Groupe';

  const avatar =
    conversation.type === 'DIRECT'
      ? conversation.members.find((m) => m.userId !== currentUser?.id)?.user
          .avatar
      : conversation.avatar;

  const isOnline =
    conversation.type === 'DIRECT' &&
    conversation.members.find((m) => m.userId !== currentUser?.id)?.user
      .isOnline;

  const lastMsg = conversation.lastMessage;

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--color-surface)] transition ${
        isActive ? 'bg-[var(--color-surface)]' : ''
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {avatar ? (
          <img
            src={avatar}
            alt={displayName}
            className="w-[48px] h-[48px] rounded-full object-cover"
          />
        ) : (
          <div className="w-[48px] h-[48px] rounded-full bg-sn-green/20 text-sn-green flex items-center justify-center font-semibold text-sm">
            {getInitials(displayName)}
          </div>
        )}
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-sn-green rounded-full border-2 border-[var(--color-bg)]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <span className="font-medium text-[var(--color-text-primary)] truncate">
            {displayName}
          </span>
          {lastMsg && (
            <span className="text-xs text-[var(--color-text-secondary)] ml-2 flex-shrink-0">
              {formatTime(lastMsg.createdAt)}
            </span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-[var(--color-text-secondary)] truncate">
            {lastMsg
              ? lastMsg.type === 'TEXT'
                ? truncate(lastMsg.content || '', 40)
                : lastMsg.type === 'IMAGE'
                  ? '📷 Photo'
                  : '📎 Fichier'
              : 'Aucun message'}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="ml-2 bg-sn-green text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create ConversationList**

`frontend/src/components/ConversationList.tsx`:
```tsx
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useConversationStore } from '../stores/conversation.store';
import { ConversationItem } from './ConversationItem';
import type { Conversation } from '@senchat/shared';

export function ConversationList() {
  const activeId = useConversationStore((s) => s.activeConversationId);
  const setActive = useConversationStore((s) => s.setActiveConversation);

  const { data: conversations, isLoading } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await api.get('/conversations');
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-6 h-6 border-2 border-sn-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!conversations?.length) {
    return (
      <div className="text-center py-8 px-4 text-[var(--color-text-secondary)]">
        <p className="text-lg mb-1">Aucune conversation</p>
        <p className="text-sm">Recherchez un utilisateur pour démarrer</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto">
      {conversations.map((conv) => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          isActive={conv.id === activeId}
          onClick={() => setActive(conv.id)}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ConversationList.tsx frontend/src/components/ConversationItem.tsx
git commit -m "feat: add ConversationList and ConversationItem components"
```

---

### Task 21: MessageBubble + MessageInput components

**Files:**
- Create: `frontend/src/components/MessageBubble.tsx`
- Create: `frontend/src/components/MessageInput.tsx`

- [ ] **Step 1: Create MessageBubble**

`frontend/src/components/MessageBubble.tsx`:
```tsx
import type { Message } from '@senchat/shared';
import { useAuthStore } from '../stores/auth.store';
import { formatTime } from '../lib/utils';

interface Props {
  message: Message;
}

export function MessageBubble({ message }: Props) {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const isOwn = message.senderId === currentUserId;
  const isDeleted = !!message.deletedAt;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1 px-4`}>
      <div
        className={`max-w-[65%] rounded-lg px-3 py-2 ${
          isOwn
            ? 'bg-[var(--color-bubble-out)] rounded-tr-none'
            : 'bg-[var(--color-bubble-in)] rounded-tl-none'
        }`}
      >
        {/* Sender name (group conversations) */}
        {!isOwn && (
          <p className="text-xs font-semibold text-sn-green mb-0.5">
            {message.sender.displayName}
          </p>
        )}

        {/* Content */}
        {isDeleted ? (
          <p className="text-sm italic text-[var(--color-text-secondary)]">
            Message supprimé
          </p>
        ) : message.type === 'IMAGE' && message.fileUrl ? (
          <div>
            <img
              src={message.fileUrl}
              alt={message.fileName || 'image'}
              className="max-w-full rounded-md mb-1"
              loading="lazy"
            />
            {message.content && (
              <p className="text-sm text-[var(--color-text-primary)]">
                {message.content}
              </p>
            )}
          </div>
        ) : message.type === 'FILE' && message.fileUrl ? (
          <a
            href={message.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-sn-green hover:underline"
          >
            <span>📎</span>
            <span>{message.fileName || 'Fichier'}</span>
            {message.fileSize && (
              <span className="text-[var(--color-text-secondary)] text-xs">
                ({(message.fileSize / 1024).toFixed(0)} Ko)
              </span>
            )}
          </a>
        ) : (
          <p className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}

        {/* Timestamp + status */}
        <div className="flex items-center justify-end gap-1 mt-0.5">
          <span className="text-[10px] text-[var(--color-text-secondary)]">
            {formatTime(message.createdAt)}
          </span>
          {isOwn && !isDeleted && (
            <span className="text-sn-green text-xs">✓</span>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create MessageInput**

`frontend/src/components/MessageInput.tsx`:
```tsx
import { useState, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { sendMessage, emitTyping } from '../hooks/useMessages';
import { api } from '../lib/api';

interface Props {
  conversationId: string;
}

export function MessageInput({ conversationId }: Props) {
  const [text, setText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    sendMessage({
      conversationId,
      type: 'TEXT',
      content: trimmed,
    });

    setText('');
    emitTyping(conversationId, false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);

    // Typing indicator
    emitTyping(conversationId, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(conversationId, false);
    }, 2000);
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/files/upload', formData);

      const isImage = file.type.startsWith('image/');
      sendMessage({
        conversationId,
        type: isImage ? 'IMAGE' : 'FILE',
        fileUrl: res.data.fileUrl,
        fileName: res.data.fileName,
        fileSize: res.data.fileSize,
      });
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-end gap-2 p-3 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
      {/* File attach */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="p-2 text-[var(--color-text-secondary)] hover:text-sn-green transition"
      >
        <Paperclip size={20} />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
      />

      {/* Text input */}
      <textarea
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder="Écrivez un message..."
        className="flex-1 resize-none bg-[var(--color-input)] text-[var(--color-text-primary)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-sn-green max-h-[120px] overflow-y-auto"
        style={{ minHeight: '40px' }}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = 'auto';
          target.style.height = Math.min(target.scrollHeight, 120) + 'px';
        }}
      />

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={!text.trim() && !isUploading}
        className="p-2 bg-sn-green text-white rounded-full hover:opacity-90 transition disabled:opacity-30"
      >
        <Send size={18} />
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/MessageBubble.tsx frontend/src/components/MessageInput.tsx
git commit -m "feat: add MessageBubble and MessageInput components with file upload"
```

---

### Task 22: ChatPanel component

**Files:**
- Create: `frontend/src/components/ChatPanel.tsx`

- [ ] **Step 1: Create ChatPanel with infinite scroll**

`frontend/src/components/ChatPanel.tsx`:
```tsx
import { useEffect, useRef, useCallback } from 'react';
import { useMessages, markAsRead } from '../hooks/useMessages';
import { useConversationStore } from '../stores/conversation.store';
import { useAuthStore } from '../stores/auth.store';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Conversation } from '@senchat/shared';
import { getInitials } from '../lib/utils';

export function ChatPanel() {
  const conversationId = useConversationStore((s) => s.activeConversationId);
  const typingUsers = useConversationStore((s) =>
    conversationId ? s.typingUsers[conversationId] || [] : [],
  );
  const currentUserId = useAuthStore((s) => s.user?.id);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useMessages(conversationId);

  const { data: conversation } = useQuery<Conversation>({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      const res = await api.get(`/conversations/${conversationId}`);
      return res.data;
    },
    enabled: !!conversationId,
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.pages?.[0]?.messages?.length]);

  // Mark as read when conversation is opened
  useEffect(() => {
    if (conversationId && data?.pages?.[0]?.messages?.[0]) {
      markAsRead(conversationId, data.pages[0].messages[0].id);
    }
  }, [conversationId, data?.pages?.[0]?.messages?.[0]?.id]);

  // Infinite scroll: load more when scrolled to top
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    if (el.scrollTop < 100 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--color-bg)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-sn-green mb-2">SenChat</h2>
          <p className="text-[var(--color-text-secondary)]">
            Sélectionnez une conversation pour commencer
          </p>
        </div>
      </div>
    );
  }

  const otherMember = conversation?.members.find(
    (m) => m.userId !== currentUserId,
  );
  const displayName =
    conversation?.type === 'DIRECT'
      ? otherMember?.user.displayName || 'Utilisateur'
      : conversation?.name || 'Groupe';

  const allMessages = data?.pages.flatMap((p) => p.messages).reverse() || [];

  return (
    <div className="flex-1 flex flex-col bg-[var(--color-bg)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="w-10 h-10 rounded-full bg-sn-green/20 text-sn-green flex items-center justify-center font-semibold text-sm">
          {getInitials(displayName)}
        </div>
        <div>
          <p className="font-semibold text-[var(--color-text-primary)]">
            {displayName}
          </p>
          {typingUsers.length > 0 ? (
            <p className="text-xs text-sn-green">en train d'écrire...</p>
          ) : conversation?.type === 'DIRECT' && otherMember?.user.isOnline ? (
            <p className="text-xs text-sn-green">En ligne</p>
          ) : (
            <p className="text-xs text-[var(--color-text-secondary)]">
              {conversation?.type === 'GROUP'
                ? `${conversation.members.length} membres`
                : 'Hors ligne'}
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto py-2"
      >
        {isFetchingNextPage && (
          <div className="flex justify-center py-2">
            <div className="w-5 h-5 border-2 border-sn-green border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-sn-green border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          allMessages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput conversationId={conversationId} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/ChatPanel.tsx
git commit -m "feat: add ChatPanel with infinite scroll, typing indicator, auto read-mark"
```

---

### Task 23: UserSearch + GroupCreate + ChatLayout wiring

**Files:**
- Create: `frontend/src/components/UserSearch.tsx`
- Create: `frontend/src/components/GroupCreate.tsx`
- Modify: `frontend/src/features/chat/ChatLayout.tsx`

- [ ] **Step 1: Create UserSearch**

`frontend/src/components/UserSearch.tsx`:
```tsx
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { api } from '../lib/api';
import { useConversationStore } from '../stores/conversation.store';
import { useQueryClient } from '@tanstack/react-query';
import { getInitials } from '../lib/utils';

interface Props {
  onClose: () => void;
}

export function UserSearch({ onClose }: Props) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const setActive = useConversationStore((s) => s.setActiveConversation);
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: users, isLoading } = useQuery({
    queryKey: ['userSearch', debouncedQuery],
    queryFn: async () => {
      const res = await api.get('/users/search', {
        params: { q: debouncedQuery },
      });
      return res.data as Array<{
        id: string;
        displayName: string;
        avatar: string | null;
        isOnline: boolean;
      }>;
    },
    enabled: debouncedQuery.length >= 2,
  });

  const startConversation = async (userId: string) => {
    const res = await api.post('/conversations', {
      type: 'DIRECT',
      memberIds: [userId],
    });
    setActive(res.data.id);
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-[var(--color-bg)] z-10 flex flex-col">
      <div className="flex items-center gap-2 p-3 border-b border-[var(--color-border)]">
        <button onClick={onClose} className="text-[var(--color-text-secondary)]">
          <X size={20} />
        </button>
        <div className="flex-1 relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un utilisateur..."
            autoFocus
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--color-input)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-sn-green"
          />
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 border-2 border-sn-green border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {users?.map((user) => (
          <div
            key={user.id}
            onClick={() => startConversation(user.id)}
            className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--color-surface)] transition"
          >
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.displayName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-sn-green/20 text-sn-green flex items-center justify-center font-semibold text-sm">
                  {getInitials(user.displayName)}
                </div>
              )}
              {user.isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-sn-green rounded-full border-2 border-[var(--color-bg)]" />
              )}
            </div>
            <span className="text-[var(--color-text-primary)] font-medium">
              {user.displayName}
            </span>
          </div>
        ))}
        {debouncedQuery.length >= 2 && !isLoading && !users?.length && (
          <p className="text-center py-4 text-[var(--color-text-secondary)] text-sm">
            Aucun utilisateur trouvé
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create GroupCreate**

`frontend/src/components/GroupCreate.tsx`:
```tsx
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Check } from 'lucide-react';
import { api } from '../lib/api';
import { useConversationStore } from '../stores/conversation.store';
import { getInitials } from '../lib/utils';

interface Props {
  onClose: () => void;
}

export function GroupCreate({ onClose }: Props) {
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const setActive = useConversationStore((s) => s.setActiveConversation);
  const queryClient = useQueryClient();

  const { data: users } = useQuery({
    queryKey: ['userSearch', searchQuery],
    queryFn: async () => {
      const res = await api.get('/users/search', { params: { q: searchQuery } });
      return res.data as Array<{
        id: string;
        displayName: string;
        avatar: string | null;
        isOnline: boolean;
      }>;
    },
    enabled: searchQuery.length >= 2,
  });

  const toggleUser = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const createGroup = async () => {
    if (!name.trim() || selectedIds.length === 0) return;
    const res = await api.post('/conversations', {
      type: 'GROUP',
      name: name.trim(),
      memberIds: selectedIds,
    });
    setActive(res.data.id);
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-[var(--color-bg)] z-10 flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-[var(--color-border)]">
        <button onClick={onClose} className="text-[var(--color-text-secondary)]">
          <X size={20} />
        </button>
        <span className="font-semibold text-[var(--color-text-primary)]">
          Nouveau groupe
        </span>
        <button
          onClick={createGroup}
          disabled={!name.trim() || selectedIds.length === 0}
          className="text-sn-green disabled:opacity-30"
        >
          <Check size={20} />
        </button>
      </div>

      <div className="p-3 border-b border-[var(--color-border)]">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom du groupe"
          className="w-full px-4 py-2 rounded-lg bg-[var(--color-input)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-sn-green"
        />
      </div>

      {selectedIds.length > 0 && (
        <div className="px-3 py-2 text-xs text-[var(--color-text-secondary)]">
          {selectedIds.length} membre{selectedIds.length > 1 ? 's' : ''} sélectionné
          {selectedIds.length > 1 ? 's' : ''}
        </div>
      )}

      <div className="p-3">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher des membres..."
          className="w-full px-4 py-2 rounded-lg bg-[var(--color-input)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-sn-green"
        />
      </div>

      <div className="overflow-y-auto flex-1">
        {users?.map((user) => (
          <div
            key={user.id}
            onClick={() => toggleUser(user.id)}
            className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--color-surface)] transition"
          >
            <div className="w-10 h-10 rounded-full bg-sn-green/20 text-sn-green flex items-center justify-center font-semibold text-sm">
              {getInitials(user.displayName)}
            </div>
            <span className="flex-1 text-[var(--color-text-primary)]">
              {user.displayName}
            </span>
            {selectedIds.includes(user.id) && (
              <div className="w-5 h-5 bg-sn-green rounded-full flex items-center justify-center">
                <Check size={14} className="text-white" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Wire up ChatLayout**

`frontend/src/features/chat/ChatLayout.tsx`:
```tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Search, Users, MessageSquarePlus } from 'lucide-react';
import { ConversationList } from '../../components/ConversationList';
import { ChatPanel } from '../../components/ChatPanel';
import { UserSearch } from '../../components/UserSearch';
import { GroupCreate } from '../../components/GroupCreate';
import { useSocket } from '../../hooks/useSocket';
import { useConversationStore } from '../../stores/conversation.store';
import { useUIStore } from '../../stores/ui.store';
import { useRefreshAuth } from '../../hooks/useAuth';

export function ChatLayout() {
  const [showSearch, setShowSearch] = useState(false);
  const [showGroupCreate, setShowGroupCreate] = useState(false);
  const activeId = useConversationStore((s) => s.activeConversationId);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const navigate = useNavigate();
  const refreshAuth = useRefreshAuth();

  // Initialize socket connection
  useSocket();

  // Refresh auth on mount to get user data
  useEffect(() => {
    refreshAuth.mutate();
  }, []);

  // On mobile, hide sidebar when conversation is selected
  const showSidebar = sidebarOpen || !activeId;

  return (
    <div className="h-screen flex bg-[var(--color-bg)] overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          showSidebar ? 'flex' : 'hidden'
        } md:flex flex-col w-full md:w-[300px] md:min-w-[300px] border-r border-[var(--color-border)] bg-[var(--color-bg)] relative`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-surface)]">
          <h1 className="text-xl font-bold text-sn-green">SenChat</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGroupCreate(true)}
              className="p-2 text-[var(--color-text-secondary)] hover:text-sn-green transition"
              title="Nouveau groupe"
            >
              <Users size={20} />
            </button>
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 text-[var(--color-text-secondary)] hover:text-sn-green transition"
              title="Nouveau message"
            >
              <MessageSquarePlus size={20} />
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="p-2 text-[var(--color-text-secondary)] hover:text-sn-green transition"
              title="Paramètres"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Conversation list */}
        <ConversationList />

        {/* Overlays */}
        {showSearch && <UserSearch onClose={() => setShowSearch(false)} />}
        {showGroupCreate && (
          <GroupCreate onClose={() => setShowGroupCreate(false)} />
        )}
      </div>

      {/* Chat panel */}
      <div
        className={`${
          !showSidebar || activeId ? 'flex' : 'hidden'
        } md:flex flex-1 flex-col`}
      >
        {activeId && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden absolute top-3 left-3 z-10 p-1 text-[var(--color-text-secondary)]"
          >
            ←
          </button>
        )}
        <ChatPanel />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/UserSearch.tsx frontend/src/components/GroupCreate.tsx frontend/src/features/chat/ChatLayout.tsx
git commit -m "feat: add UserSearch, GroupCreate, and wire up ChatLayout with sidebar + chat panel"
```

---

### Task 24: Settings page + ProfileCard

**Files:**
- Create: `frontend/src/components/ProfileCard.tsx`
- Modify: `frontend/src/features/settings/SettingsPage.tsx`

- [ ] **Step 1: Create ProfileCard**

`frontend/src/components/ProfileCard.tsx`:
```tsx
import { getInitials } from '../lib/utils';

interface Props {
  displayName: string;
  avatar: string | null;
  bio: string | null;
  email?: string;
  size?: 'sm' | 'lg';
}

export function ProfileCard({ displayName, avatar, bio, email, size = 'lg' }: Props) {
  const avatarSize = size === 'lg' ? 'w-24 h-24 text-2xl' : 'w-12 h-12 text-sm';

  return (
    <div className="flex flex-col items-center gap-3">
      {avatar ? (
        <img
          src={avatar}
          alt={displayName}
          className={`${avatarSize} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${avatarSize} rounded-full bg-sn-green/20 text-sn-green flex items-center justify-center font-bold`}
        >
          {getInitials(displayName)}
        </div>
      )}
      <div className="text-center">
        <p className="font-semibold text-lg text-[var(--color-text-primary)]">
          {displayName}
        </p>
        {email && (
          <p className="text-sm text-[var(--color-text-secondary)]">{email}</p>
        )}
        {bio && (
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">{bio}</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build SettingsPage**

`frontend/src/features/settings/SettingsPage.tsx`:
```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { useUIStore } from '../../stores/ui.store';
import { useLogout } from '../../hooks/useAuth';
import { ProfileCard } from '../../components/ProfileCard';
import { api } from '../../lib/api';

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const navigate = useNavigate();
  const logout = useLogout();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch('/users/me', { displayName, bio });
      updateUser(res.data);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => navigate('/login'),
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 bg-[var(--color-surface)]">
          <button
            onClick={() => navigate('/')}
            className="text-[var(--color-text-secondary)]"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold">Paramètres</h1>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile */}
          <ProfileCard
            displayName={user.displayName}
            avatar={user.avatar}
            bio={user.bio}
            email={user.email}
          />

          {/* Edit fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                Nom
              </label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[var(--color-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-sn-green"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-[var(--color-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-sn-green resize-none"
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-2 bg-sn-green text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>

          {/* Theme toggle */}
          <div className="flex items-center justify-between p-4 bg-[var(--color-surface)] rounded-lg">
            <span>Thème</span>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-[var(--color-input)] text-[var(--color-text-primary)]"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full py-2 border border-sn-red text-sn-red rounded-lg font-medium hover:bg-sn-red hover:text-white transition"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ProfileCard.tsx frontend/src/features/settings/SettingsPage.tsx
git commit -m "feat: add SettingsPage with profile edit, theme toggle, logout"
```

---

## Phase 8: Integration & Final

### Task 25: Install all dependencies + verify full build

- [ ] **Step 1: Install all workspace dependencies**

```bash
cd C:\Users\odus\Documents\PROJETS\senchat
npm install
```

- [ ] **Step 2: Build shared package**

```bash
npm run build --workspace=shared 2>&1 || echo "Shared uses raw TS imports, no build step needed"
```

- [ ] **Step 3: Generate Prisma client**

```bash
cd backend && npx prisma generate
```

- [ ] **Step 4: Build backend**

```bash
cd backend && npx nest build
```

- [ ] **Step 5: Build frontend**

```bash
cd frontend && npm run build
```

- [ ] **Step 6: Fix any compilation errors**

Address TypeScript errors if any, then re-run builds.

- [ ] **Step 7: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve compilation errors across workspace"
```

---

### Task 26: End-to-end smoke test

- [ ] **Step 1: Start all services**

Terminal 1:
```bash
docker-compose up -d
```

Terminal 2:
```bash
cd backend && npx prisma migrate dev && npx prisma db seed && npm run dev
```

Terminal 3:
```bash
cd frontend && npm run dev
```

- [ ] **Step 2: Manual smoke test checklist**

1. Open `http://localhost:5173` → redirects to `/login`
2. Click "Créer un compte" → register with `test@senchat.sn` / `password123` / `Test User`
3. Redirected to `/` → sees "Aucune conversation"
4. Open second browser (incognito) → register `test2@senchat.sn`
5. In first browser: click search → search "test2" → click user → conversation created
6. Send message "Salut !" → message appears in real-time in second browser
7. Second browser replies "Hello !" → message appears in first browser
8. Verify typing indicator shows when typing
9. Verify online dot appears for other user
10. Go to Settings → change theme → verify toggle works
11. Logout → redirected to login

- [ ] **Step 3: Document any bugs found and fix them**

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "fix: address issues found during smoke testing"
```

---

### Task 27: Backend e2e auth test

**Files:**
- Create: `backend/test/jest-e2e.json`
- Create: `backend/test/auth.e2e-spec.ts`

- [ ] **Step 1: Create e2e jest config**

`backend/test/jest-e2e.json`:
```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": { "^.+\\.(t|j)s$": "ts-jest" },
  "moduleNameMapper": {
    "^@senchat/shared$": "<rootDir>/../../shared/src"
  }
}
```

- [ ] **Step 2: Create auth e2e test**

`backend/test/auth.e2e-spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api');
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.refreshToken.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.conversationMember.deleteMany({});
    await prisma.conversation.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: { contains: 'e2etest' } },
    });
    await app.close();
  });

  const testUser = {
    email: 'e2etest@senchat.sn',
    password: 'testpassword123',
    displayName: 'E2E Test User',
  };

  let accessToken: string;

  it('/api/auth/register (POST) — should register', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(testUser)
      .expect(201);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    accessToken = res.body.accessToken;
  });

  it('/api/auth/register (POST) — duplicate should fail', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(testUser)
      .expect(409);
  });

  it('/api/auth/login (POST) — should login', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
    accessToken = res.body.accessToken;
  });

  it('/api/auth/login (POST) — wrong password should fail', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' })
      .expect(401);
  });

  it('/api/users/me (GET) — should return profile with valid token', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.email).toBe(testUser.email);
    expect(res.body.displayName).toBe(testUser.displayName);
  });

  it('/api/users/me (GET) — should fail without token', async () => {
    await request(app.getHttpServer())
      .get('/api/users/me')
      .expect(401);
  });
});
```

- [ ] **Step 3: Run e2e tests (requires MySQL running)**

```bash
cd backend && npx jest --config test/jest-e2e.json --verbose --forceExit
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add backend/test/
git commit -m "test: add auth e2e tests (register, login, profile)"
```

---

## Summary

| Phase | Tasks | What it delivers |
|---|---|---|
| 1. Bootstrap | 1–6 | Monorepo, Docker MySQL, NestJS, Vite+React+Tailwind, shared types |
| 2. Auth | 7–9 | Register/login/refresh/logout, JWT guard, unit tests |
| 3. Users + Conversations | 10–11 | Profile CRUD, avatar upload, search, conversation CRUD, members |
| 4. Messages + Files | 12–13 | Message history, search, soft delete, file upload/download |
| 5. Socket.IO | 14–15 | Real-time gateway, presence, typing, seed data |
| 6. Frontend Core | 16–18 | API client, stores, auth pages, routing |
| 7. Chat UI | 19–24 | Full chat interface: conversations, messages, search, groups, settings |
| 8. Integration | 25–27 | Full build, smoke test, e2e tests |

**Total: 27 tasks, ~30-40h estimated for MVP.**
