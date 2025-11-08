import { z } from 'zod'

/**
 * LeetCode Validation Schemas
 * Input validation for LeetCode-related operations
 */

// LeetCode Submission DTO Schema
export const leetCodeSubmissionDTOSchema = z.object({
  submissionId: z
    .string()
    .min(1, 'Submission ID is required'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  titleSlug: z
    .string()
    .min(1, 'Title slug is required')
    .max(200, 'Title slug must be less than 200 characters')
    .regex(/^[a-z0-9-]+$/, 'Title slug must contain only lowercase letters, numbers, and hyphens'),
  lang: z
    .string()
    .min(1, 'Language is required')
    .max(50, 'Language must be less than 50 characters'),
  timestamp: z
    .string()
    .regex(/^\d+$/, 'Timestamp must be a numeric string'),
  statusDisplay: z
    .string()
    .min(1, 'Status is required')
    .max(50, 'Status must be less than 50 characters'),
  runtime: z
    .string()
    .max(50, 'Runtime must be less than 50 characters')
    .optional(),
  memory: z
    .string()
    .max(50, 'Memory must be less than 50 characters')
    .optional(),
  code: z
    .string()
    .max(100000, 'Code must be less than 100,000 characters')
    .optional(),
})

// Fetch Submissions Request Schema
export const fetchSubmissionsSchema = z.object({
  limit: z
    .number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(20, 'Limit cannot exceed 20')
    .default(5)
    .optional(),
})

// LeetCode GraphQL Query Schema
export const leetCodeQuerySchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, dots, dashes, and underscores'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(20)
    .default(5),
})

// LeetCode GraphQL Response Schema
export const leetCodeGraphQLResponseSchema = z.object({
  data: z.object({
    recentSubmissionList: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        titleSlug: z.string(),
        lang: z.string(),
        timestamp: z.string(),
        statusDisplay: z.string(),
        runtime: z.string().optional().nullable(),
        memory: z.string().optional().nullable(),
      })
    ),
  }),
})

// Submission ID Parameter Schema
export const submissionIdSchema = z.object({
  id: z
    .string()
    .min(1, 'Submission ID is required')
    .cuid('Invalid submission ID format'),
})

// Save Submissions Request Schema
export const saveSubmissionsSchema = z.object({
  userId: z
    .string()
    .cuid('Invalid user ID format'),
  submissions: z
    .array(leetCodeSubmissionDTOSchema)
    .min(1, 'At least one submission is required')
    .max(20, 'Cannot save more than 20 submissions at once'),
})

// Get User Submissions Query Schema
export const getUserSubmissionsSchema = z.object({
  userId: z
    .string()
    .cuid('Invalid user ID format'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(5)
    .optional(),
})

// LeetCode Username Validation (standalone)
export const leetCodeUsernameSchema = z
  .string()
  .min(1, 'LeetCode username is required')
  .max(50, 'Username must be less than 50 characters')
  .regex(
    /^[a-zA-Z0-9_.-]+$/,
    'Username can only contain letters, numbers, dots, dashes, and underscores'
  )
  .trim()

// Export types
export type LeetCodeSubmissionDTO = z.infer<typeof leetCodeSubmissionDTOSchema>
export type FetchSubmissionsInput = z.infer<typeof fetchSubmissionsSchema>
export type LeetCodeQueryInput = z.infer<typeof leetCodeQuerySchema>
export type LeetCodeGraphQLResponse = z.infer<typeof leetCodeGraphQLResponseSchema>
export type SubmissionIdInput = z.infer<typeof submissionIdSchema>
export type SaveSubmissionsInput = z.infer<typeof saveSubmissionsSchema>
export type GetUserSubmissionsInput = z.infer<typeof getUserSubmissionsSchema>
