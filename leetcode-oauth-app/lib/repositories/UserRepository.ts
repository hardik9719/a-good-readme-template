import { PrismaClient } from '@prisma/client'
import { IUserRepository, IUser, CreateUserDTO, UpdateUserDTO } from '../types'

/**
 * UserRepository - Repository Pattern Implementation
 * Handles all database operations for User entity
 * Provides abstraction layer between business logic and data access
 */
export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<IUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })
    return user
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    })
    return user
  }

  async findByGoogleId(googleId: string): Promise<IUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { googleId },
    })
    return user
  }

  async create(data: CreateUserDTO): Promise<IUser> {
    const user = await this.prisma.user.create({
      data,
    })
    return user
  }

  async update(id: string, data: UpdateUserDTO): Promise<IUser> {
    const user = await this.prisma.user.update({
      where: { id },
      data,
    })
    return user
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    })
  }
}
