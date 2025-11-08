import {
  ILeetCodeService,
  ILeetCodeRepository,
  ILeetCodeSubmission,
  LeetCodeSubmissionDTO,
} from '../types'
import { LeetCodeAdapter } from '../adapters/LeetCodeAdapter'

/**
 * LeetCodeService - Service Layer Pattern
 * Handles business logic for LeetCode integration
 * Uses Adapter Pattern to interact with external LeetCode API
 */
export class LeetCodeService implements ILeetCodeService {
  private adapter: LeetCodeAdapter

  constructor(private leetCodeRepository: ILeetCodeRepository) {
    this.adapter = new LeetCodeAdapter()
  }

  async fetchRecentSubmissions(
    leetcodeUsername: string,
    limit: number
  ): Promise<LeetCodeSubmissionDTO[]> {
    const submissions = await this.adapter.getRecentSubmissions(leetcodeUsername, limit)
    return submissions
  }

  async saveUserSubmissions(
    userId: string,
    submissions: LeetCodeSubmissionDTO[]
  ): Promise<ILeetCodeSubmission[]> {
    const savedSubmissions: ILeetCodeSubmission[] = []

    for (const submission of submissions) {
      const saved = await this.leetCodeRepository.create(userId, submission)
      savedSubmissions.push(saved)
    }

    return savedSubmissions
  }

  async getUserSubmissions(
    userId: string,
    limit?: number
  ): Promise<ILeetCodeSubmission[]> {
    return await this.leetCodeRepository.findByUserId(userId, limit)
  }
}
