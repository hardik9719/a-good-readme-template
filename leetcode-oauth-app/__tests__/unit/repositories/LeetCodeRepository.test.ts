import { LeetCodeRepository } from '@/lib/repositories/LeetCodeRepository'
import { LeetCodeSubmissionDTO } from '@/lib/types'
import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}))

import prisma from '@/lib/db'

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

describe('LeetCodeRepository', () => {
  let repository: LeetCodeRepository

  beforeEach(() => {
    mockReset(prismaMock)
    repository = new LeetCodeRepository(prismaMock)
  })

  const mockSubmission = {
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
    code: 'function twoSum() {}',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  describe('findByUserId', () => {
    test('should return submissions for user with default limit', async () => {
      prismaMock.leetCodeSubmission.findMany.mockResolvedValue([mockSubmission])

      const result = await repository.findByUserId('user123')

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Two Sum')
      expect(prismaMock.leetCodeSubmission.findMany).toHaveBeenCalledWith({
        where: { userId: 'user123' },
        orderBy: { timestamp: 'desc' },
        take: 5,
      })
    })

    test('should return submissions with custom limit', async () => {
      prismaMock.leetCodeSubmission.findMany.mockResolvedValue([
        mockSubmission,
        { ...mockSubmission, id: '2' },
        { ...mockSubmission, id: '3' },
      ])

      const result = await repository.findByUserId('user123', 10)

      expect(result).toHaveLength(3)
      expect(prismaMock.leetCodeSubmission.findMany).toHaveBeenCalledWith({
        where: { userId: 'user123' },
        orderBy: { timestamp: 'desc' },
        take: 10,
      })
    })

    test('should return empty array when no submissions found', async () => {
      prismaMock.leetCodeSubmission.findMany.mockResolvedValue([])

      const result = await repository.findByUserId('user123')

      expect(result).toEqual([])
    })
  })

  describe('create', () => {
    test('should create a new submission', async () => {
      const submissionDTO: LeetCodeSubmissionDTO = {
        submissionId: 'sub456',
        title: 'Add Two Numbers',
        titleSlug: 'add-two-numbers',
        lang: 'python',
        timestamp: '1704153600',
        statusDisplay: 'Accepted',
        runtime: '60 ms',
        memory: '45 MB',
      }

      const createdSubmission = {
        ...mockSubmission,
        id: '2',
        ...submissionDTO,
        userId: 'user456',
      }

      prismaMock.leetCodeSubmission.create.mockResolvedValue(createdSubmission)

      const result = await repository.create('user456', submissionDTO)

      expect(result.submissionId).toBe('sub456')
      expect(result.userId).toBe('user456')
      expect(prismaMock.leetCodeSubmission.create).toHaveBeenCalledWith({
        data: {
          userId: 'user456',
          ...submissionDTO,
        },
      })
    })

    test('should create submission without optional fields', async () => {
      const submissionDTO: LeetCodeSubmissionDTO = {
        submissionId: 'sub789',
        title: 'Longest Substring',
        titleSlug: 'longest-substring',
        lang: 'javascript',
        timestamp: '1704240000',
        statusDisplay: 'Wrong Answer',
      }

      const createdSubmission = {
        ...mockSubmission,
        id: '3',
        ...submissionDTO,
        runtime: null,
        memory: null,
        code: null,
      }

      prismaMock.leetCodeSubmission.create.mockResolvedValue(createdSubmission)

      const result = await repository.create('user123', submissionDTO)

      expect(result.runtime).toBeNull()
      expect(result.memory).toBeNull()
      expect(result.code).toBeNull()
    })
  })

  describe('deleteByUserId', () => {
    test('should delete all submissions for a user', async () => {
      prismaMock.leetCodeSubmission.deleteMany.mockResolvedValue({ count: 5 })

      await repository.deleteByUserId('user123')

      expect(prismaMock.leetCodeSubmission.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user123' },
      })
    })

    test('should handle deletion when no submissions exist', async () => {
      prismaMock.leetCodeSubmission.deleteMany.mockResolvedValue({ count: 0 })

      await expect(repository.deleteByUserId('user999')).resolves.not.toThrow()
    })
  })
})
