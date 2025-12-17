# Uchiwa Project Specification

## Overview

**Uchiwa** - A couple-focused web application for sharing moments, managing memories, and staying connected.

## Tech Stack

- **Framework**: Next.js 14.0
- **Runtime**: Node.js ≥20.0.0
- **Language**: TypeScript 5.3
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma 5.7
- **Auth**: NextAuth 4.24.13
- **Email**: Resend 6.6.0
- **UI**: React 18.2 + Tailwind CSS 3.3
- **Styling**: Tailwind CSS 3.3 + PostCSS
- **Icons**: Lucide React 0.294
- **Validation**: Zod 3.22
- **Password**: bcryptjs 2.4
- **Date Utils**: date-fns 2.30
- **Testing**: Vitest 1.0, Playwright 1.40
- **Analytics**: Vercel Analytics 1.6

## Deployment

- **Hosting**: Vercel
- **Domain**: ohayo.site (via Muumuu Domain registrar)
- **DNS**: Vercel Nameservers (ns1/ns2.vercel-dns.com)
- **Email Service**: Resend (notification@ohayo.site)

## Database Schema

### User

- `id` (CUID)
- `email`, `name`, `displayName`, `hashedPassword`, `bio`
- `avatarUrl`, `timezone` (default: Asia/Tokyo)
- `notificationEmails` (array), `emailNotificationsEnabled`
- Relations: diaryEntries, diaryEdits, anniversaries, conversations, messages

### DiaryEntry

- `id`, `authorId`, `title`, `content`, `date`
- Supports multiple editors via DiaryEditor junction
- Indexed: authorId, date

### DiaryEditor

- Junction model for collaborative diary editing
- Unique constraint: (diaryEntryId, userId)

### Anniversary

- `id`, `userId`, `title`, `date`, `notes`
- `repeatInterval`: NONE | WEEKLY | MONTHLY | YEARLY
- Shared across all users regardless of creator
- Used by cron job for email notifications

### Conversation

- Direct and group messaging support
- `isDirect` boolean flag
- Indexed: conversationId, userId

### ConversationParticipant

- `lastReadMessageId` for unread tracking
- Unique constraint: (conversationId, userId)

### Message

- `content`, `readAt` optional for read receipts
- Indexed: conversationId, senderId

### MemoryLink

- Ordered list of shared memory links
- `order` field for manual sorting

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   ├── api/                      # API routes
│   │   ├── auth/[...nextauth]/   # NextAuth routes
│   │   ├── cron/check-anniversaries/  # Daily email scheduler
│   │   ├── anniversaries/        # CRUD endpoints
│   │   ├── diary/                # Diary endpoints
│   │   ├── chat/                 # Chat endpoints
│   │   ├── memories/             # Memory links endpoints
│   │   ├── profile/              # User profile endpoints
│   │   ├── settings/             # Settings endpoints
│   │   └── users/                # User directory
│   ├── anniversaries/            # Anniversary management UI
│   ├── chat/                     # Chat UI
│   ├── diary/                    # Diary UI
│   ├── memories/                 # Memories UI
│   ├── profile/                  # User profile UI
│   ├── users/                    # User directory/profiles
│   ├── settings/                 # Admin settings
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # Reusable components
│   ├── AnniversaryCard.tsx
│   ├── Calendar.tsx
│   ├── Header.tsx
│   ├── LayoutContent.tsx
│   ├── LoginForm.tsx
│   ├── PuzzleGuard.tsx
│   ├── RegisterForm.tsx
│   ├── TabNav.tsx
│   └── Toast.tsx
├── lib/                          # Utilities
│   ├── auth.ts                   # NextAuth configuration
│   ├── db.ts                     # Prisma client
│   ├── rate-limit.ts             # Rate limiting
│   └── validation.ts             # Zod schemas
├── styles/                       # Global styles
│   ├── globals.css
│   └── globals.css.d.ts
└── types/                        # TypeScript definitions
    ├── index.ts
    └── next-auth.d.ts
```

## Core Features

### Authentication

- Email/password registration & login via NextAuth
- Session management with JWT
- Password hashing with bcryptjs

### Diary

- Create/edit diary entries with collaborative editing
- Track multiple editors per entry
- Date-based indexing

### Anniversaries

- Create shared anniversary records
- Optional repeat intervals (weekly/monthly/yearly)
- Daily cron job sends email notifications
- Email sent to all users with notifications enabled
- Email via Resend from notification@ohayo.site

### Chat

- Direct and group conversations
- Real-time messaging
- Unread message tracking
- Message read receipts

### User Directory

- Public user profiles with display name & bio
- Line break support in bio (whitespace-pre-wrap)
- Avatar display

### Settings

- Email notification preferences
- Multiple notification email addresses
- Timezone configuration

## Environment Variables

### Production (Vercel)

```
DATABASE_URL=postgresql://...  # Neon connection string
NEXTAUTH_URL=https://ohayo.site
NEXTAUTH_SECRET=<32+ char random string>
RESEND_API_KEY=re_...
RESEND_FROM=notification@ohayo.site
CRON_SECRET=<32+ char random string>
NODE_ENV=production
```

### Local Development (.env.local)

```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<32+ char random string>
RESEND_API_KEY=re_...
RESEND_FROM=onboarding@resend.dev
CRON_SECRET=<32+ char random string>
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

## Cron Jobs

### Daily Anniversary Email (GitHub Actions)

- **Schedule**: 0 0 \* \* \* (09:00 JST = 00:00 UTC)
- **Endpoint**: GET /api/cron/check-anniversaries
- **Authentication**: Bearer token via CRON_SECRET
- **Logic**:
  1. Query all anniversaries matching today's month/day
  2. Find users with emailNotificationsEnabled=true
  3. Send consolidated email listing all today's anniversaries
  4. Via Resend using RESEND_FROM address

## Scripts

| Command                  | Purpose                           |
| ------------------------ | --------------------------------- |
| `npm run dev`            | Start dev server (localhost:3000) |
| `npm run build`          | Build for production              |
| `npm start`              | Start production server           |
| `npm run lint`           | Run ESLint                        |
| `npm run type-check`     | TypeScript type checking          |
| `npm test`               | Run Vitest suite                  |
| `npm run test:ui`        | Vitest UI mode                    |
| `npm run test:e2e`       | Playwright E2E tests              |
| `npm run prisma:migrate` | Deploy Prisma migrations          |
| `npm run prisma:seed`    | Seed database                     |
| `npm run db:push`        | Sync schema to database           |

## Key Endpoints

| Endpoint                           | Method         | Purpose                            |
| ---------------------------------- | -------------- | ---------------------------------- |
| `/api/auth/[...nextauth]`          | -              | NextAuth handlers                  |
| `/api/auth/register`               | POST           | User registration                  |
| `/api/anniversaries`               | GET/POST       | List/create anniversaries          |
| `/api/anniversaries/[id]`          | PUT/DELETE     | Update/delete anniversary          |
| `/api/diary`                       | GET/POST       | Diary entries                      |
| `/api/diary/[id]`                  | GET/PUT/DELETE | Diary operations                   |
| `/api/chat/conversations`          | GET/POST       | Chat management                    |
| `/api/chat/messages`               | GET/POST       | Message handling                   |
| `/api/users`                       | GET            | User directory (display name, bio) |
| `/api/users/[id]`                  | GET            | Individual user profile            |
| `/api/profile`                     | GET/PUT        | Current user profile               |
| `/api/settings/notification-email` | GET/PUT        | Notification settings              |
| `/api/cron/check-anniversaries`    | GET            | Daily scheduler                    |

## Security

- **Authentication**: NextAuth with encrypted session tokens
- **Password**: bcryptjs hashing (no plaintext storage)
- **CSRF**: NextAuth automatic CSRF protection
- **Rate Limiting**: Implemented on auth endpoints
- **Cron Authentication**: Bearer token verification
- **Email Verification**: Resend domain DKIM/SPF/DMARC configured

## Development Workflow

1. **Local Setup**

   ```bash
   npm install
   npm run prisma:migrate
   npm run dev
   ```

2. **Database Changes**

   ```bash
   npx prisma migrate dev --name <migration_name>
   ```

3. **Testing**

   ```bash
   npm test              # Unit tests
   npm run test:e2e      # E2E tests
   npm run type-check    # Type validation
   npm run lint          # Linting
   ```

4. **Deployment**
   ```bash
   git push origin main
   # Vercel auto-deploys on push
   ```

## Notes

- Anniversaries use month/day matching (year-independent) for recurring dates
- Email notifications sent via Resend with custom domain authentication
- All timestamps stored in UTC (retrieved in user's timezone)
- Collaborative diary editing via DiaryEditor junction model
- User directory accessible to authenticated users only
