import axios from 'axios'
import { LeetCodeSubmissionDTO, LeetCodeGraphQLResponse } from '../types'

/**
 * LeetCodeAdapter - Adapter Pattern Implementation
 * Adapts external LeetCode GraphQL API to our application's interface
 * Isolates external API dependencies from business logic
 */
export class LeetCodeAdapter {
  private readonly LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql'

  /**
   * Fetches recent submissions for a given LeetCode username
   * Uses LeetCode's GraphQL API (unofficial)
   */
  async getRecentSubmissions(
    username: string,
    limit: number = 5
  ): Promise<LeetCodeSubmissionDTO[]> {
    const query = `
      query recentSubmissions($username: String!, $limit: Int!) {
        recentSubmissionList(username: $username, limit: $limit) {
          id
          title
          titleSlug
          timestamp
          statusDisplay
          lang
          runtime
          memory: __typename
        }
      }
    `

    try {
      const response = await axios.post<LeetCodeGraphQLResponse>(
        this.LEETCODE_GRAPHQL_URL,
        {
          query,
          variables: { username, limit },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Referer': 'https://leetcode.com',
          },
          timeout: 10000, // 10 second timeout
        }
      )

      if (!response.data || !response.data.data) {
        throw new Error('Invalid response from LeetCode API')
      }

      const submissions = response.data.data.recentSubmissionList || []

      return submissions.map((sub) => this.adaptSubmission(sub))
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Network timeout')
        }
        if (error.response?.status === 404) {
          throw new Error(`LeetCode user '${username}' not found`)
        }
        throw new Error(`LeetCode API error: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * Adapts LeetCode API response to our DTO format
   */
  private adaptSubmission(apiSubmission: any): LeetCodeSubmissionDTO {
    return {
      submissionId: apiSubmission.id,
      title: apiSubmission.title,
      titleSlug: apiSubmission.titleSlug,
      lang: apiSubmission.lang,
      timestamp: apiSubmission.timestamp,
      statusDisplay: apiSubmission.statusDisplay,
      runtime: apiSubmission.runtime || undefined,
      memory: apiSubmission.memory !== '__typename' ? apiSubmission.memory : undefined,
    }
  }
}
