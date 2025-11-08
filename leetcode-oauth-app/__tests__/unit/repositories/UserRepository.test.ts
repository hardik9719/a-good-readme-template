import { UserRepository } from '@/lib/repositories/UserRepository'
import { UserType, CreateUserDTO, UpdateUserDTO } from '@/lib/types'
import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

// Mock Prisma Client
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}))

import prisma from '@/lib/db'

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

describe('UserRepository', () => {
  let repository: UserRepository

  beforeEach(() => {
    mockReset(prismaMock)
    repository = new UserRepository(prismaMock)
  })

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    image: null,
    userType: UserType.GOOGLE,
    googleId: 'google123',
    leetcodeUsername: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  describe('findById', () => {
    test('should return user when found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser)

      const result = await repository.findById('1')

      expect(result).toBeDefined()
      expect(result?.id).toBe('1')
      expect(result?.email).toBe('test@example.com')
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      })
    })

    test('should return null when user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null)

      const result = await repository.findById('999')

      expect(result).toBeNull()
    })

    test('should throw error when database fails', async () => {
      prismaMock.user.findUnique.mockRejectedValue(new Error('Database error'))

      await expect(repository.findById('1')).rejects.toThrow('Database error')
    })
  })

  describe('findByEmail', () => {
    test('should return user when found by email', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser)

      const result = await repository.findByEmail('test@example.com')

      expect(result).toBeDefined()
      expect(result?.email).toBe('test@example.com')
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      })
    })

    test('should return null when email not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null)

      const result = await repository.findByEmail('nonexistent@example.com')

      expect(result).toBeNull()
    })
  })

  describe('findByGoogleId', () => {
    test('should return user when found by googleId', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser)

      const result = await repository.findByGoogleId('google123')

      expect(result).toBeDefined()
      expect(result?.googleId).toBe('google123')
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { googleId: 'google123' },
      })
    })

    test('should return null when googleId not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null)

      const result = await repository.findByGoogleId('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('create', () => {
    test('should create a guest user', async () => {
      const createData: CreateUserDTO = {
        name: 'Guest',
        userType: UserType.GUEST,
      }

      const createdUser = {
        ...mockUser,
        id: '2',
        email: null,
        name: 'Guest',
        userType: UserType.GUEST,
        googleId: null,
      }

      prismaMock.user.create.mockResolvedValue(createdUser)

      const result = await repository.create(createData)

      expect(result.id).toBe('2')
      expect(result.userType).toBe(UserType.GUEST)
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: createData,
      })
    })

    test('should create a Google user', async () => {
      const createData: CreateUserDTO = {
        email: 'newuser@example.com',
        name: 'New User',
        image: 'https://example.com/photo.jpg',
        userType: UserType.GOOGLE,
        googleId: 'google456',
      }

      const createdUser = {
        ...mockUser,
        id: '3',
        ...createData,
      }

      prismaMock.user.create.mockResolvedValue(createdUser)

      const result = await repository.create(createData)

      expect(result.email).toBe('newuser@example.com')
      expect(result.googleId).toBe('google456')
      expect(result.userType).toBe(UserType.GOOGLE)
    })
  })

  describe('update', () => {
    test('should update user data', async () => {
      const updateData: UpdateUserDTO = {
        name: 'Updated Name',
        leetcodeUsername: 'leetcode_user',
      }

      const updatedUser = {
        ...mockUser,
        name: 'Updated Name',
        leetcodeUsername: 'leetcode_user',
      }

      prismaMock.user.update.mockResolvedValue(updatedUser)

      const result = await repository.update('1', updateData)

      expect(result.name).toBe('Updated Name')
      expect(result.leetcodeUsername).toBe('leetcode_user')
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
      })
    })

    test('should throw error when user not found', async () => {
      prismaMock.user.update.mockRejectedValue(new Error('User not found'))

      await expect(repository.update('999', { name: 'Test' })).rejects.toThrow()
    })
  })

  describe('delete', () => {
    test('should delete user by id', async () => {
      prismaMock.user.delete.mockResolvedValue(mockUser)

      await repository.delete('1')

      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      })
    })

    test('should throw error when user not found', async () => {
      prismaMock.user.delete.mockRejectedValue(new Error('User not found'))

      await expect(repository.delete('999')).rejects.toThrow()
    })
  })
})
