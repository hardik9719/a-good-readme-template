import { IAuthService, IUserRepository, IUser, UserType } from '../types'

/**
 * AuthService - Service Layer Pattern
 * Handles business logic for authentication and user management
 * Implements dependency injection for testability
 */
export class AuthService implements IAuthService {
  constructor(private userRepository: IUserRepository) {}

  async createGuestUser(): Promise<IUser> {
    const user = await this.userRepository.create({
      name: 'Guest User',
      userType: UserType.GUEST,
    })
    return user
  }

  async getUserById(id: string): Promise<IUser | null> {
    return await this.userRepository.findById(id)
  }

  async linkLeetCodeAccount(userId: string, leetcodeUsername: string): Promise<IUser> {
    const trimmedUsername = leetcodeUsername.trim()

    if (!trimmedUsername) {
      throw new Error('LeetCode username cannot be empty')
    }

    const user = await this.userRepository.update(userId, {
      leetcodeUsername: trimmedUsername,
    })

    return user
  }
}
