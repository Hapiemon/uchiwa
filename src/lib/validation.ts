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
  displayName: z.string().optional().or(z.literal('')),
  bio: z.string().max(500).optional().or(z.literal('')),
  timezone: z.string(),
});

export const diaryEntrySchema = z.object({
  title: z.string().max(200).optional().nullable(),
  content: z.string().min(1, 'Content cannot be empty').max(10000),
  date: z.string().optional(),
});

export const anniversarySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date',
  }),
  repeatInterval: z.enum(['NONE', 'WEEKLY', 'MONTHLY', 'YEARLY']),
  notes: z.string().max(500).optional(),
});

export const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(5000),
  conversationId: z.string().min(1),
});
