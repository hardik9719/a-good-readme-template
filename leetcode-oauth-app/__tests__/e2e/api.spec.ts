import { test, expect } from '@playwright/test'

test.describe('API Endpoints', () => {
  test('health check endpoint should return 200', async ({ request }) => {
    const response = await request.get('/api/health')

    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data.status).toBe('healthy')
    expect(data.database).toBe('connected')
    expect(data).toHaveProperty('timestamp')
    expect(data).toHaveProperty('uptime')
  })

  test('health check should return database status', async ({ request }) => {
    const response = await request.get('/api/health')
    const data = await response.json()

    expect(data.database).toMatch(/connected|disconnected/)
  })

  test('CSRF endpoint should return token', async ({ request }) => {
    const response = await request.get('/api/auth/csrf')

    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('csrfToken')
    expect(typeof data.csrfToken).toBe('string')
    expect(data.csrfToken.length).toBeGreaterThan(0)
  })

  test('session endpoint should work for unauthenticated users', async ({ request }) => {
    const response = await request.get('/api/auth/session')

    expect(response.status()).toBe(200)

    const data = await response.json()
    // Unauthenticated users should get empty session
    expect(data).toEqual({})
  })

  test('LeetCode link endpoint should require authentication', async ({ request }) => {
    const response = await request.post('/api/leetcode/link', {
      data: {
        leetcodeUsername: 'test_user',
      },
    })

    // Should return 401 for unauthenticated requests
    expect(response.status()).toBe(401)
  })

  test('LeetCode submissions endpoint should require authentication', async ({ request }) => {
    const response = await request.get('/api/leetcode/submissions')

    // Should return 401 for unauthenticated requests
    expect(response.status()).toBe(401)
  })
})
