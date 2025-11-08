import { UserType, IUser } from '../types'

/**
 * User Domain Model
 * Implements business logic and validation rules
 */
export class User implements IUser {
  id: string
  email: string | null
  name: string | null
  image: string | null
  userType: UserType
  googleId: string | null
  leetcodeUsername: string | null
  createdAt: Date
  updatedAt: Date

  constructor(data: IUser) {
    this.id = data.id
    this.email = data.email
    this.name = data.name
    this.image = data.image
    this.userType = data.userType
    this.googleId = data.googleId
    this.leetcodeUsername = data.leetcodeUsername
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt

    this.validate()
  }

  private validate(): void {
    if (this.userType === UserType.GOOGLE && !this.googleId) {
      throw new Error('Google users must have a googleId')
    }

    if (this.userType === UserType.GOOGLE && !this.email) {
      throw new Error('Google users must have an email')
    }

    if (this.email && !this.isValidEmail(this.email)) {
      throw new Error('Invalid email format')
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  isGuest(): boolean {
    return this.userType === UserType.GUEST
  }

  isGoogleUser(): boolean {
    return this.userType === UserType.GOOGLE
  }

  hasLeetCodeAccount(): boolean {
    return this.leetcodeUsername !== null && this.leetcodeUsername.length > 0
  }

  canConnectLeetCode(): boolean {
    return true // All users can connect their LeetCode account
  }

  toJSON(): IUser {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      image: this.image,
      userType: this.userType,
      googleId: this.googleId,
      leetcodeUsername: this.leetcodeUsername,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
