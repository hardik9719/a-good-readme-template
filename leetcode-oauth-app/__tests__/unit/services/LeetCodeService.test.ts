import { LeetCodeService } from '@/lib/services/LeetCodeService'
import { ILeetCodeRepository, LeetCodeSubmissionDTO } from '@/lib/types'
import { mockDeep, MockProxy } from 'jest-mock-extended'

// Mock the LeetCode adapter
jest.mock('@/lib/adapters/LeetCodeAdapter')

import { LeetCodeAdapter } from '@/lib/adapters/LeetCodeAdapter'

const MockLeetCodeAdapter = LeetCodeAdapter as jest.MockedClass<typeof LeetCodeAdapter>

describe('LeetCodeService', () => {
  let leetCodeService: LeetCodeService
  let mockLeetCodeRepository: MockProxy<ILeetCodeRepository>
  let mockAdapter: MockProxy<LeetCodeAdapter>

  beforeEach(() => {
    jest.clearAllMocks()
    mockLeetCodeRepository = mockDeep<ILeetCodeRepository>()
    mockAdapter = mockDeep<LeetCodeAdapter>()
    MockLeetCodeAdapter.mockImplementation(() => mockAdapter as any)
    leetCodeService = new LeetCodeService(mockLeetCodeRepository)
  })

  const mockSubmissions: LeetCodeSubmissionDTO[] = [
    {
      submissionId: '1',
      title: 'Two Sum',
      titleSlug: 'two-sum',
      lang: 'typescript',
      timestamp: '1704067200',
      statusDisplay: 'Accepted',
      runtime: '52 ms',
      memory: '44.3 MB',
    },
    {
      submissionId: '2',
      title: 'Add Two Numbers',
      titleSlug: 'add-two-numbers',
      lang: 'python',
      timestamp: '1704153600',
      statusDisplay: 'Accepted',
      runtime: '60 ms',
      memory: '45 MB',
    },
  ]

  const mockStoredSubmissions = mockSubmissions.map((sub, index) => ({
    id: `stored-${index + 1}`,
    userId: 'user123',
    ...sub,
    code: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }))

  describe('fetchRecentSubmissions', () => {
    test('should fetch submissions from LeetCode API', async () => {
      mockAdapter.getRecentSubmissions.mockResolvedValue(mockSubmissions)

      const result = await leetCodeService.fetchRecentSubmissions('test_user', 5)

      expect(result).toHaveLength(2)
      expect(result[0].title).toBe('Two Sum')
      expect(mockAdapter.getRecentSubmissions).toHaveBeenCalledWith('test_user', 5)
    })

    test('should handle username with special characters', async () => {
      mockAdapter.getRecentSubmissions.mockResolvedValue([])

      await leetCodeService.fetchRecentSubmissions('user.name-123', 5)

      expect(mockAdapter.getRecentSubmissions).toHaveBeenCalledWith('user.name-123', 5)
    })

    test('should use default limit when not specified', async () => {
      mockAdapter.getRecentSubmissions.mockResolvedValue(mockSubmissions)

      await leetCodeService.fetchRecentSubmissions('test_user', 5)

      expect(mockAdapter.getRecentSubmissions).toHaveBeenCalledWith('test_user', 5)
    })

    test('should handle empty results from API', async () => {
      mockAdapter.getRecentSubmissions.mockResolvedValue([])

      const result = await leetCodeService.fetchRecentSubmissions('test_user', 5)

      expect(result).toEqual([])
    })

    test('should handle API errors', async () => {
      mockAdapter.getRecentSubmissions.mockRejectedValue(
        new Error('LeetCode API error')
      )

      await expect(
        leetCodeService.fetchRecentSubmissions('test_user', 5)
      ).rejects.toThrow('LeetCode API error')
    })

    test('should handle network timeout', async () => {
      mockAdapter.getRecentSubmissions.mockRejectedValue(new Error('Network timeout'))

      await expect(
        leetCodeService.fetchRecentSubmissions('test_user', 5)
      ).rejects.toThrow('Network timeout')
    })
  })

  describe('saveUserSubmissions', () => {
    test('should save multiple submissions to database', async () => {
      mockLeetCodeRepository.create
        .mockResolvedValueOnce(mockStoredSubmissions[0])
        .mockResolvedValueOnce(mockStoredSubmissions[1])

      const result = await leetCodeService.saveUserSubmissions('user123', mockSubmissions)

      expect(result).toHaveLength(2)
      expect(mockLeetCodeRepository.create).toHaveBeenCalledTimes(2)
      expect(mockLeetCodeRepository.create).toHaveBeenCalledWith('user123', mockSubmissions[0])
      expect(mockLeetCodeRepository.create).toHaveBeenCalledWith('user123', mockSubmissions[1])
    })

    test('should handle empty submissions array', async () => {
      const result = await leetCodeService.saveUserSubmissions('user123', [])

      expect(result).toEqual([])
      expect(mockLeetCodeRepository.create).not.toHaveBeenCalled()
    })

    test('should handle repository errors', async () => {
      mockLeetCodeRepository.create.mockRejectedValue(new Error('Database error'))

      await expect(
        leetCodeService.saveUserSubmissions('user123', mockSubmissions)
      ).rejects.toThrow('Database error')
    })

    test('should save submissions with partial data', async () => {
      const partialSubmissions: LeetCodeSubmissionDTO[] = [
        {
          submissionId: '3',
          title: 'Test Problem',
          titleSlug: 'test-problem',
          lang: 'java',
          timestamp: '1704240000',
          statusDisplay: 'Wrong Answer',
        },
      ]

      const stored = {
        id: 'stored-3',
        userId: 'user123',
        ...partialSubmissions[0],
        runtime: null,
        memory: null,
        code: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockLeetCodeRepository.create.mockResolvedValue(stored)

      const result = await leetCodeService.saveUserSubmissions('user123', partialSubmissions)

      expect(result).toHaveLength(1)
      expect(result[0].runtime).toBeNull()
      expect(result[0].memory).toBeNull()
    })
  })

  describe('getUserSubmissions', () => {
    test('should retrieve user submissions with default limit', async () => {
      mockLeetCodeRepository.findByUserId.mockResolvedValue(mockStoredSubmissions)

      const result = await leetCodeService.getUserSubmissions('user123')

      expect(result).toHaveLength(2)
      expect(result[0].title).toBe('Two Sum')
      expect(mockLeetCodeRepository.findByUserId).toHaveBeenCalledWith('user123', undefined)
    })

    test('should retrieve user submissions with custom limit', async () => {
      mockLeetCodeRepository.findByUserId.mockResolvedValue([mockStoredSubmissions[0]])

      const result = await leetCodeService.getUserSubmissions('user123', 1)

      expect(result).toHaveLength(1)
      expect(mockLeetCodeRepository.findByUserId).toHaveBeenCalledWith('user123', 1)
    })

    test('should return empty array when user has no submissions', async () => {
      mockLeetCodeRepository.findByUserId.mockResolvedValue([])

      const result = await leetCodeService.getUserSubmissions('user123')

      expect(result).toEqual([])
    })

    test('should handle repository errors', async () => {
      mockLeetCodeRepository.findByUserId.mockRejectedValue(new Error('Database error'))

      await expect(leetCodeService.getUserSubmissions('user123')).rejects.toThrow(
        'Database error'
      )
    })
  })
})
