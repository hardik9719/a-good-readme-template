import { LeetCodeSubmission } from '@/lib/models/LeetCodeSubmission'
import { ILeetCodeSubmission } from '@/lib/types'

describe('LeetCodeSubmission Model', () => {
  const validSubmissionData: ILeetCodeSubmission = {
    id: '1',
    userId: 'user123',
    submissionId: 'sub123',
    title: 'Two Sum',
    titleSlug: 'two-sum',
    lang: 'typescript',
    timestamp: '1704067200',
    statusDisplay: 'Accepted',
    runtime: '52 ms',
    memory: '44.3 MB',
    code: 'function twoSum() { }',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  describe('Construction and Validation', () => {
    test('should create a valid submission', () => {
      const submission = new LeetCodeSubmission(validSubmissionData)

      expect(submission.id).toBe('1')
      expect(submission.userId).toBe('user123')
      expect(submission.submissionId).toBe('sub123')
      expect(submission.title).toBe('Two Sum')
      expect(submission.lang).toBe('typescript')
      expect(submission.statusDisplay).toBe('Accepted')
    })

    test('should throw error when submissionId is missing', () => {
      const invalidData = {
        ...validSubmissionData,
        submissionId: '',
      }

      expect(() => new LeetCodeSubmission(invalidData)).toThrow('Submission ID is required')
    })

    test('should throw error when title is missing', () => {
      const invalidData = {
        ...validSubmissionData,
        title: '',
      }

      expect(() => new LeetCodeSubmission(invalidData)).toThrow('Title is required')
    })

    test('should throw error when lang is missing', () => {
      const invalidData = {
        ...validSubmissionData,
        lang: '',
      }

      expect(() => new LeetCodeSubmission(invalidData)).toThrow('Language is required')
    })

    test('should allow null runtime and memory', () => {
      const data = {
        ...validSubmissionData,
        runtime: null,
        memory: null,
      }

      expect(() => new LeetCodeSubmission(data)).not.toThrow()
    })
  })

  describe('Business Logic Methods', () => {
    test('isAccepted() should return true for accepted submissions', () => {
      const submission = new LeetCodeSubmission(validSubmissionData)
      expect(submission.isAccepted()).toBe(true)
    })

    test('isAccepted() should return false for non-accepted submissions', () => {
      const data = {
        ...validSubmissionData,
        statusDisplay: 'Wrong Answer',
      }
      const submission = new LeetCodeSubmission(data)
      expect(submission.isAccepted()).toBe(false)
    })

    test('isAccepted() should be case insensitive', () => {
      const testCases = ['Accepted', 'ACCEPTED', 'accepted']

      testCases.forEach(status => {
        const data = { ...validSubmissionData, statusDisplay: status }
        const submission = new LeetCodeSubmission(data)
        expect(submission.isAccepted()).toBe(true)
      })
    })

    test('getFormattedTimestamp() should format Unix timestamp correctly', () => {
      const submission = new LeetCodeSubmission(validSubmissionData)
      const formatted = submission.getFormattedTimestamp()

      expect(formatted).toBeTruthy()
      expect(typeof formatted).toBe('string')
      // Check that it contains date-like content
      expect(formatted).toMatch(/\d/)
    })
  })

  describe('Serialization', () => {
    test('toJSON() should return valid ILeetCodeSubmission object', () => {
      const submission = new LeetCodeSubmission(validSubmissionData)
      const json = submission.toJSON()

      expect(json).toEqual({
        id: validSubmissionData.id,
        userId: validSubmissionData.userId,
        submissionId: validSubmissionData.submissionId,
        title: validSubmissionData.title,
        titleSlug: validSubmissionData.titleSlug,
        lang: validSubmissionData.lang,
        timestamp: validSubmissionData.timestamp,
        statusDisplay: validSubmissionData.statusDisplay,
        runtime: validSubmissionData.runtime,
        memory: validSubmissionData.memory,
        code: validSubmissionData.code,
        createdAt: validSubmissionData.createdAt,
        updatedAt: validSubmissionData.updatedAt,
      })
    })
  })
})
