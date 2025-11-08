import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { AuthService } from '@/lib/services/AuthService'
import { UserRepository } from '@/lib/repositories/UserRepository'
import prisma from '@/lib/db'

/**
 * API Route: Link LeetCode Account
 * POST /api/leetcode/link
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { leetcodeUsername } = body

    if (!leetcodeUsername || typeof leetcodeUsername !== 'string') {
      return NextResponse.json(
        { error: 'LeetCode username is required' },
        { status: 400 }
      )
    }

    // Use service layer with dependency injection
    const userRepository = new UserRepository(prisma)
    const authService = new AuthService(userRepository)

    const updatedUser = await authService.linkLeetCodeAccount(
      session.user.id,
      leetcodeUsername
    )

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        leetcodeUsername: updatedUser.leetcodeUsername,
      },
    })
  } catch (error) {
    console.error('Error linking LeetCode account:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
