import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should redirect to sign-in page when not authenticated', async ({ page }) => {
    await page.goto('/')

    // Should redirect to sign-in
    await expect(page).toHaveURL(/\/auth\/signin/)
  })

  test('should display sign-in options', async ({ page }) => {
    await page.goto('/auth/signin')

    // Check for Google sign-in button
    const googleButton = page.getByText('Sign in with Google')
    await expect(googleButton).toBeVisible()

    // Check for Guest sign-in button
    const guestButton = page.getByText('Continue as Guest')
    await expect(guestButton).toBeVisible()
  })

  test('should have proper page title', async ({ page }) => {
    await page.goto('/auth/signin')

    await expect(page).toHaveTitle(/LeetCode OAuth App/)
  })

  test('should display welcome message', async ({ page }) => {
    await page.goto('/auth/signin')

    const welcomeText = page.getByText('Welcome to LeetCode Tracker')
    await expect(welcomeText).toBeVisible()
  })
})
