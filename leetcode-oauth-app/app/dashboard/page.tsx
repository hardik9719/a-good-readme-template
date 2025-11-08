import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/DashboardClient'
import prisma from '@/lib/db'

export default async function Dashboard() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Fetch user's LeetCode submissions from database
  const submissions = session.user.leetcodeUsername
    ? await prisma.leetCodeSubmission.findMany({
        where: { userId: session.user.id },
        orderBy: { timestamp: 'desc' },
        take: 5,
      })
    : []

  return (
    <DashboardClient
      user={session.user}
      initialSubmissions={submissions.map((sub) => ({
        id: sub.id,
        title: sub.title,
        titleSlug: sub.titleSlug,
        lang: sub.lang,
        statusDisplay: sub.statusDisplay,
        runtime: sub.runtime,
        memory: sub.memory,
        timestamp: sub.timestamp,
      }))}
    />
  )
}
