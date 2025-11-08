import { User } from '@/lib/models/User'
import { UserType, IUser } from '@/lib/types'

describe('User Model', () => {
  const validGuestUserData: IUser = {
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

  const validGoogleUserData: IUser = {
    id: '2',
    email: 'test@example.com',
    name: 'John Doe',
    image: 'https://example.com/photo.jpg',
    userType: UserType.GOOGLE,
    googleId: 'google123',
    leetcodeUsername: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  describe('Construction and Validation', () => {
    test('should create a valid guest user', () => {
      const user = new User(validGuestUserData)

      expect(user.id).toBe('1')
      expect(user.email).toBeNull()
      expect(user.name).toBe('Guest User')
      expect(user.userType).toBe(UserType.GUEST)
      expect(user.googleId).toBeNull()
    })

    test('should create a valid Google user', () => {
      const user = new User(validGoogleUserData)

      expect(user.id).toBe('2')
      expect(user.email).toBe('test@example.com')
      expect(user.name).toBe('John Doe')
      expect(user.userType).toBe(UserType.GOOGLE)
      expect(user.googleId).toBe('google123')
    })

    test('should throw error when Google user has no googleId', () => {
      const invalidData = {
        ...validGoogleUserData,
        googleId: null,
      }

      expect(() => new User(invalidData)).toThrow('Google users must have a googleId')
    })

    test('should throw error when Google user has no email', () => {
      const invalidData = {
        ...validGoogleUserData,
        email: null,
      }

      expect(() => new User(invalidData)).toThrow('Google users must have an email')
    })

    test('should throw error for invalid email format', () => {
      const invalidData = {
        ...validGoogleUserData,
        email: 'invalid-email',
      }

      expect(() => new User(invalidData)).toThrow('Invalid email format')
    })

    test('should accept valid email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.co.uk',
        'user+tag@example.com',
      ]

      validEmails.forEach(email => {
        const data = { ...validGoogleUserData, email }
        expect(() => new User(data)).not.toThrow()
      })
    })
  })

  describe('Business Logic Methods', () => {
    test('isGuest() should return true for guest users', () => {
      const user = new User(validGuestUserData)
      expect(user.isGuest()).toBe(true)
      expect(user.isGoogleUser()).toBe(false)
    })

    test('isGoogleUser() should return true for Google users', () => {
      const user = new User(validGoogleUserData)
      expect(user.isGoogleUser()).toBe(true)
      expect(user.isGuest()).toBe(false)
    })

    test('hasLeetCodeAccount() should return false when no username', () => {
      const user = new User(validGuestUserData)
      expect(user.hasLeetCodeAccount()).toBe(false)
    })

    test('hasLeetCodeAccount() should return true when username exists', () => {
      const data = {
        ...validGuestUserData,
        leetcodeUsername: 'leetcode_user',
      }
      const user = new User(data)
      expect(user.hasLeetCodeAccount()).toBe(true)
    })

    test('hasLeetCodeAccount() should return false for empty string', () => {
      const data = {
        ...validGuestUserData,
        leetcodeUsername: '',
      }
      const user = new User(data)
      expect(user.hasLeetCodeAccount()).toBe(false)
    })

    test('canConnectLeetCode() should return true for all users', () => {
      const guestUser = new User(validGuestUserData)
      const googleUser = new User(validGoogleUserData)

      expect(guestUser.canConnectLeetCode()).toBe(true)
      expect(googleUser.canConnectLeetCode()).toBe(true)
    })
  })

  describe('Serialization', () => {
    test('toJSON() should return valid IUser object', () => {
      const user = new User(validGoogleUserData)
      const json = user.toJSON()

      expect(json).toEqual({
        id: validGoogleUserData.id,
        email: validGoogleUserData.email,
        name: validGoogleUserData.name,
        image: validGoogleUserData.image,
        userType: validGoogleUserData.userType,
        googleId: validGoogleUserData.googleId,
        leetcodeUsername: validGoogleUserData.leetcodeUsername,
        createdAt: validGoogleUserData.createdAt,
        updatedAt: validGoogleUserData.updatedAt,
      })
    })
  })
})
