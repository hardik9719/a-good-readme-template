import { z } from 'zod'
import { UserType } from '../types'

/**
 * Auth Validation Schemas
 * Comprehensive input validation using Zod
 */

// User Creation Schema
export const createUserSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .optional()
    .nullable(),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .optional()
    .nullable(),
  image: z
    .string()
    .url('Invalid image URL')
    .optional()
    .nullable(),
  userType: z.nativeEnum(UserType, {
    errorMap: () => ({ message: 'Invalid user type' }),
  }),
  googleId: z
    .string()
    .min(1, 'Google ID cannot be empty')
    .optional()
    .nullable(),
})

// User Update Schema
export const updateUserSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .optional()
    .nullable(),
  name: z
    .string()
    .min(1, 'Name cannot be empty')
    .max(100, 'Name must be less than 100 characters')
    .optional()
    .nullable(),
  image: z
    .string()
    .url('Invalid image URL')
    .optional()
    .nullable(),
  leetcodeUsername: z
    .string()
    .min(1, 'LeetCode username cannot be empty')
    .max(50, 'LeetCode username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Invalid LeetCode username format')
    .optional()
    .nullable(),
})

// Link LeetCode Account Schema
export const linkLeetCodeSchema = z.object({
  leetcodeUsername: z
    .string()
    .min(1, 'LeetCode username is required')
    .max(50, 'LeetCode username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, dots, dashes, and underscores')
    .trim(),
})

// User ID Parameter Schema
export const userIdSchema = z.object({
  id: z
    .string()
    .min(1, 'User ID is required')
    .cuid('Invalid user ID format'),
})

// Google OAuth Profile Schema
export const googleProfileSchema = z.object({
  sub: z.string(),
  name: z.string().optional(),
  email: z.string().email(),
  picture: z.string().url().optional(),
})

// Session Validation Schema
export const sessionSchema = z.object({
  user: z.object({
    id: z.string().cuid(),
    email: z.string().email().optional().nullable(),
    name: z.string().optional().nullable(),
    image: z.string().url().optional().nullable(),
    userType: z.nativeEnum(UserType).optional(),
    leetcodeUsername: z.string().optional().nullable(),
  }),
  expires: z.string().or(z.date()),
})

// Export types
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type LinkLeetCodeInput = z.infer<typeof linkLeetCodeSchema>
export type UserIdInput = z.infer<typeof userIdSchema>
export type GoogleProfileInput = z.infer<typeof googleProfileSchema>
export type SessionInput = z.infer<typeof sessionSchema>
