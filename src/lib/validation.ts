import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  displayName: z.string().optional(),
  bio: z.string().max(500).optional(),
  timezone: z.string(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  youtubeUrl: z.string().url().optional().or(z.literal('')),
  googlePhotosUrl: z.string().url().optional().or(z.literal('')),
});

export const diaryEntrySchema = z.object({
  content: z.string().min(1, 'Content cannot be empty').max(10000),
});

export const anniversarySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date',
  }),
  repeatInterval: z.enum(['NONE', 'YEARLY']),
  notes: z.string().max(500).optional(),
});

export const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(5000),
  conversationId: z.string().min(1),
});
