import { PrismaClient } from '@prisma/client'
import { ILeetCodeRepository, ILeetCodeSubmission, LeetCodeSubmissionDTO } from '../types'

/**
 * LeetCodeRepository - Repository Pattern Implementation
 * Handles all database operations for LeetCode submissions
 */
export class LeetCodeRepository implements ILeetCodeRepository {
  constructor(private prisma: PrismaClient) {}

  async findByUserId(userId: string, limit: number = 5): Promise<ILeetCodeSubmission[]> {
    const submissions = await this.prisma.leetCodeSubmission.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    })
    return submissions
  }

  async create(userId: string, submission: LeetCodeSubmissionDTO): Promise<ILeetCodeSubmission> {
    const created = await this.prisma.leetCodeSubmission.create({
      data: {
        userId,
        ...submission,
      },
    })
    return created
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.leetCodeSubmission.deleteMany({
      where: { userId },
    })
  }
}
