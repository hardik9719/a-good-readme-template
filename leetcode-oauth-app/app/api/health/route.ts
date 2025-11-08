import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import prisma from '@/lib/db'

/**
 * Health Check Endpoint
 * Used by Docker, Kubernetes, and monitoring systems
 * GET /api/health
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`

    const duration = Date.now() - startTime

    logger.debug({ type: 'health_check', duration, status: 'healthy' }, 'Health check passed')

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'connected',
        duration: `${duration}ms`,
      },
      { status: 200 }
    )
  } catch (error) {
    const duration = Date.now() - startTime

    logger.error(
      {
        type: 'health_check',
        duration,
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Health check failed'
    )

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`,
      },
      { status: 503 }
    )
  }
}
