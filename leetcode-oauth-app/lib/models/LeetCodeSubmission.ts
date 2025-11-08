import { ILeetCodeSubmission } from '../types'

/**
 * LeetCodeSubmission Domain Model
 * Represents a LeetCode problem submission
 */
export class LeetCodeSubmission implements ILeetCodeSubmission {
  id: string
  userId: string
  submissionId: string
  title: string
  titleSlug: string
  lang: string
  timestamp: string
  statusDisplay: string
  runtime: string | null
  memory: string | null
  code: string | null
  createdAt: Date
  updatedAt: Date

  constructor(data: ILeetCodeSubmission) {
    this.id = data.id
    this.userId = data.userId
    this.submissionId = data.submissionId
    this.title = data.title
    this.titleSlug = data.titleSlug
    this.lang = data.lang
    this.timestamp = data.timestamp
    this.statusDisplay = data.statusDisplay
    this.runtime = data.runtime
    this.memory = data.memory
    this.code = data.code
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt

    this.validate()
  }

  private validate(): void {
    if (!this.submissionId) {
      throw new Error('Submission ID is required')
    }
    if (!this.title) {
      throw new Error('Title is required')
    }
    if (!this.lang) {
      throw new Error('Language is required')
    }
  }

  isAccepted(): boolean {
    return this.statusDisplay.toLowerCase() === 'accepted'
  }

  getFormattedTimestamp(): string {
    const timestamp = parseInt(this.timestamp) * 1000
    return new Date(timestamp).toLocaleString()
  }

  toJSON(): ILeetCodeSubmission {
    return {
      id: this.id,
      userId: this.userId,
      submissionId: this.submissionId,
      title: this.title,
      titleSlug: this.titleSlug,
      lang: this.lang,
      timestamp: this.timestamp,
      statusDisplay: this.statusDisplay,
      runtime: this.runtime,
      memory: this.memory,
      code: this.code,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
