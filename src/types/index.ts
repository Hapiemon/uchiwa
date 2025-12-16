import type { User as PrismaUser } from "@prisma/client";

export type User = PrismaUser;

export interface Session {
  user: {
    id: string;
    email: string;
    name: string;
  };
  expires: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  timezone: string;
}

export interface DiaryEntry {
  id: string;
  authorId: string;
  title?: string | null;
  content: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  author?: {
    id: string;
    displayName?: string | null;
    name: string;
  };
  editors?: Array<{
    user: {
      id: string;
      displayName?: string | null;
      name: string;
    };
    editedAt: string;
  }>;
}

export interface Anniversary {
  id: string;
  userId: string;
  title: string;
  date: Date;
  repeatInterval: "NONE" | "WEEKLY" | "MONTHLY" | "YEARLY";
  notes?: string | null;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  isDirect: boolean;
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  readAt?: Date | null;
  createdAt: Date;
}

export interface ConversationWithParticipants extends Conversation {
  participants: Array<{
    userId: string;
    user: {
      id: string;
      displayName?: string | null;
      avatarUrl?: string | null;
    };
    lastReadMessageId?: string | null;
  }>;
  messages: Message[];
}
