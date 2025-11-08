import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { LeetCodeService } from '@/lib/services/LeetCodeService'
import { LeetCodeRepository } from '@/lib/repositories/LeetCodeRepository'
import { UserRepository } from '@/lib/repositories/UserRepository'
import prisma from '@/lib/db'

/**
 * API Route: Fetch and Save LeetCode Submissions
 * GET /api/leetcode/submissions
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user to check if they have a LeetCode username
    const userRepository = new UserRepository(prisma)
    const user = await userRepository.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.leetcodeUsername) {
      return NextResponse.json(
        { error: 'LeetCode account not linked' },
        { status: 400 }
      )
    }

    // Use service layer
    const leetCodeRepository = new LeetCodeRepository(prisma)
    const leetCodeService = new LeetCodeService(leetCodeRepository)

    // Fetch recent submissions from LeetCode
    const submissions = await leetCodeService.fetchRecentSubmissions(
      user.leetcodeUsername,
      5
    )

    // Save submissions to database
    const savedSubmissions = await leetCodeService.saveUserSubmissions(
      user.id,
      submissions
    )

    return NextResponse.json({
      success: true,
      count: savedSubmissions.length,
      submissions: savedSubmissions.map((sub) => ({
        id: sub.id,
        title: sub.title,
        titleSlug: sub.titleSlug,
        lang: sub.lang,
        statusDisplay: sub.statusDisplay,
        runtime: sub.runtime,
        memory: sub.memory,
        timestamp: sub.timestamp,
      })),
    })
  } catch (error) {
    console.error('Error fetching LeetCode submissions:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
