// Core Domain Types

export enum UserType {
  GUEST = 'GUEST',
  GOOGLE = 'GOOGLE',
}

export interface IUser {
  id: string
  email: string | null
  name: string | null
  image: string | null
  userType: UserType
  googleId: string | null
  leetcodeUsername: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ILeetCodeSubmission {
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
}

// DTOs (Data Transfer Objects)
export interface CreateUserDTO {
  email?: string
  name?: string
  image?: string
  userType: UserType
  googleId?: string
}

export interface UpdateUserDTO {
  email?: string
  name?: string
  image?: string
  leetcodeUsername?: string
}

export interface LeetCodeSubmissionDTO {
  submissionId: string
  title: string
  titleSlug: string
  lang: string
  timestamp: string
  statusDisplay: string
  runtime?: string
  memory?: string
  code?: string
}

// Repository Interfaces
export interface IUserRepository {
  findById(id: string): Promise<IUser | null>
  findByEmail(email: string): Promise<IUser | null>
  findByGoogleId(googleId: string): Promise<IUser | null>
  create(data: CreateUserDTO): Promise<IUser>
  update(id: string, data: UpdateUserDTO): Promise<IUser>
  delete(id: string): Promise<void>
}

export interface ILeetCodeRepository {
  findByUserId(userId: string, limit?: number): Promise<ILeetCodeSubmission[]>
  create(userId: string, submission: LeetCodeSubmissionDTO): Promise<ILeetCodeSubmission>
  deleteByUserId(userId: string): Promise<void>
}

// Service Interfaces
export interface IAuthService {
  createGuestUser(): Promise<IUser>
  getUserById(id: string): Promise<IUser | null>
  linkLeetCodeAccount(userId: string, leetcodeUsername: string): Promise<IUser>
}

export interface ILeetCodeService {
  fetchRecentSubmissions(leetcodeUsername: string, limit: number): Promise<LeetCodeSubmissionDTO[]>
  saveUserSubmissions(userId: string, submissions: LeetCodeSubmissionDTO[]): Promise<ILeetCodeSubmission[]>
  getUserSubmissions(userId: string, limit?: number): Promise<ILeetCodeSubmission[]>
}

// External API Response Types
export interface LeetCodeGraphQLResponse {
  data: {
    recentSubmissionList: Array<{
      id: string
      title: string
      titleSlug: string
      lang: string
      timestamp: string
      statusDisplay: string
      runtime?: string
      memory?: string
    }>
  }
}
