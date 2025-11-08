import { AuthService } from '@/lib/services/AuthService'
import { IUserRepository, UserType } from '@/lib/types'
import { mockDeep, MockProxy } from 'jest-mock-extended'

describe('AuthService', () => {
  let authService: AuthService
  let mockUserRepository: MockProxy<IUserRepository>

  beforeEach(() => {
    mockUserRepository = mockDeep<IUserRepository>()
    authService = new AuthService(mockUserRepository)
  })

  const mockGuestUser = {
    id: '1',
    email: null,
    name: 'Guest User',
    image: null,
    userType: UserType.GUEST,
    googleId: null,
    leetcodeUsername: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockGoogleUser = {
    id: '2',
    email: 'test@example.com',
    name: 'Test User',
    image: 'https://example.com/photo.jpg',
    userType: UserType.GOOGLE,
    googleId: 'google123',
    leetcodeUsername: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  describe('createGuestUser', () => {
    test('should create a guest user with default name', async () => {
      mockUserRepository.create.mockResolvedValue(mockGuestUser)

      const result = await authService.createGuestUser()

      expect(result.userType).toBe(UserType.GUEST)
      expect(result.email).toBeNull()
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        name: 'Guest User',
        userType: UserType.GUEST,
      })
    })

    test('should create multiple unique guest users', async () => {
      const guest1 = { ...mockGuestUser, id: '1' }
      const guest2 = { ...mockGuestUser, id: '2' }

      mockUserRepository.create
        .mockResolvedValueOnce(guest1)
        .mockResolvedValueOnce(guest2)

      const result1 = await authService.createGuestUser()
      const result2 = await authService.createGuestUser()

      expect(result1.id).not.toBe(result2.id)
      expect(mockUserRepository.create).toHaveBeenCalledTimes(2)
    })

    test('should handle repository errors', async () => {
      mockUserRepository.create.mockRejectedValue(new Error('Database error'))

      await expect(authService.createGuestUser()).rejects.toThrow('Database error')
    })
  })

  describe('getUserById', () => {
    test('should return user when found', async () => {
      mockUserRepository.findById.mockResolvedValue(mockGoogleUser)

      const result = await authService.getUserById('2')

      expect(result).toBeDefined()
      expect(result?.id).toBe('2')
      expect(result?.email).toBe('test@example.com')
      expect(mockUserRepository.findById).toHaveBeenCalledWith('2')
    })

    test('should return null when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null)

      const result = await authService.getUserById('999')

      expect(result).toBeNull()
    })

    test('should handle repository errors', async () => {
      mockUserRepository.findById.mockRejectedValue(new Error('Database error'))

      await expect(authService.getUserById('1')).rejects.toThrow('Database error')
    })
  })

  describe('linkLeetCodeAccount', () => {
    test('should link LeetCode account to user', async () => {
      const updatedUser = {
        ...mockGuestUser,
        leetcodeUsername: 'my_leetcode',
      }

      mockUserRepository.update.mockResolvedValue(updatedUser)

      const result = await authService.linkLeetCodeAccount('1', 'my_leetcode')

      expect(result.leetcodeUsername).toBe('my_leetcode')
      expect(mockUserRepository.update).toHaveBeenCalledWith('1', {
        leetcodeUsername: 'my_leetcode',
      })
    })

    test('should update existing LeetCode username', async () => {
      const userWithLeetCode = {
        ...mockGoogleUser,
        leetcodeUsername: 'old_username',
      }

      const updatedUser = {
        ...mockGoogleUser,
        leetcodeUsername: 'new_username',
      }

      mockUserRepository.update.mockResolvedValue(updatedUser)

      const result = await authService.linkLeetCodeAccount('2', 'new_username')

      expect(result.leetcodeUsername).toBe('new_username')
    })

    test('should handle empty username', async () => {
      await expect(authService.linkLeetCodeAccount('1', '')).rejects.toThrow(
        'LeetCode username cannot be empty'
      )
    })

    test('should handle whitespace-only username', async () => {
      await expect(authService.linkLeetCodeAccount('1', '   ')).rejects.toThrow(
        'LeetCode username cannot be empty'
      )
    })

    test('should trim whitespace from username', async () => {
      const updatedUser = {
        ...mockGuestUser,
        leetcodeUsername: 'trimmed_user',
      }

      mockUserRepository.update.mockResolvedValue(updatedUser)

      await authService.linkLeetCodeAccount('1', '  trimmed_user  ')

      expect(mockUserRepository.update).toHaveBeenCalledWith('1', {
        leetcodeUsername: 'trimmed_user',
      })
    })

    test('should handle repository errors', async () => {
      mockUserRepository.update.mockRejectedValue(new Error('User not found'))

      await expect(authService.linkLeetCodeAccount('999', 'username')).rejects.toThrow()
    })
  })
})
