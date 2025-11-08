'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { UserType } from '@/lib/types'

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  userType?: UserType
  leetcodeUsername?: string | null
}

interface Submission {
  id: string
  title: string
  titleSlug: string
  lang: string
  statusDisplay: string
  runtime: string | null
  memory: string | null
  timestamp: string
}

interface Props {
  user: User
  initialSubmissions: Submission[]
}

export default function DashboardClient({ user, initialSubmissions }: Props) {
  const [leetcodeUsername, setLeetcodeUsername] = useState(user.leetcodeUsername || '')
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/leetcode/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leetcodeUsername }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to link account')
      }

      setSuccess('LeetCode account linked successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleFetchSubmissions = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/leetcode/submissions')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch submissions')
      }

      setSubmissions(data.submissions)
      setSuccess(`Fetched ${data.count} submissions successfully!`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    if (status.toLowerCase() === 'accepted') return 'text-green-600 dark:text-green-400'
    if (status.toLowerCase().includes('wrong')) return 'text-red-600 dark:text-red-400'
    return 'text-yellow-600 dark:text-yellow-400'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {user.image && (
              <img
                src={user.image}
                alt={user.name || 'User'}
                className="h-10 w-10 rounded-full"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome, {user.name || 'Guest'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.userType === UserType.GOOGLE ? 'Google Account' : 'Guest User'}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        {/* LeetCode Account Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            LeetCode Account
          </h2>

          {!user.leetcodeUsername ? (
            <form onSubmit={handleLinkAccount} className="space-y-4">
              <div>
                <label
                  htmlFor="leetcodeUsername"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  LeetCode Username
                </label>
                <input
                  type="text"
                  id="leetcodeUsername"
                  value={leetcodeUsername}
                  onChange={(e) => setLeetcodeUsername(e.target.value)}
                  placeholder="Enter your LeetCode username"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Linking...' : 'Link Account'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Connected to:{' '}
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {user.leetcodeUsername}
                </span>
              </p>
              <button
                onClick={handleFetchSubmissions}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Fetching...' : 'Fetch Latest Submissions'}
              </button>
            </div>
          )}
        </div>

        {/* Submissions Section */}
        {submissions.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Recent Submissions (Last 5)
            </h2>
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {submission.title}
                    </h3>
                    <span
                      className={`text-sm font-semibold ${getStatusColor(
                        submission.statusDisplay
                      )}`}
                    >
                      {submission.statusDisplay}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      <span className="font-medium">Language:</span> {submission.lang}
                    </div>
                    {submission.runtime && (
                      <div>
                        <span className="font-medium">Runtime:</span> {submission.runtime}
                      </div>
                    )}
                    {submission.memory && (
                      <div>
                        <span className="font-medium">Memory:</span> {submission.memory}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Submitted:</span>{' '}
                      {new Date(parseInt(submission.timestamp) * 1000).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
