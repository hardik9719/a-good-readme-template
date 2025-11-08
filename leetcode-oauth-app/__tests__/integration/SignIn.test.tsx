import { render, screen, fireEvent } from '@testing-library/react'
import SignIn from '@/app/auth/signin/page'
import { signIn } from 'next-auth/react'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}))

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>

describe('SignIn Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders sign-in page with title', () => {
    render(<SignIn />)
    expect(screen.getByText('Welcome to LeetCode Tracker')).toBeInTheDocument()
  })

  test('renders Google sign-in button', () => {
    render(<SignIn />)
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument()
  })

  test('renders guest sign-in button', () => {
    render(<SignIn />)
    expect(screen.getByText('Continue as Guest')).toBeInTheDocument()
  })

  test('calls signIn with google provider when Google button clicked', async () => {
    mockSignIn.mockResolvedValue(undefined as any)

    render(<SignIn />)
    const googleButton = screen.getByText('Sign in with Google')

    fireEvent.click(googleButton)

    expect(mockSignIn).toHaveBeenCalledWith('google', { callbackUrl: '/dashboard' })
  })

  test('calls signIn with guest provider when Guest button clicked', async () => {
    mockSignIn.mockResolvedValue(undefined as any)

    render(<SignIn />)
    const guestButton = screen.getByText('Continue as Guest')

    fireEvent.click(guestButton)

    expect(mockSignIn).toHaveBeenCalledWith('guest', { callbackUrl: '/dashboard' })
  })

  test('shows loading state when signing in', async () => {
    mockSignIn.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )

    render(<SignIn />)
    const googleButton = screen.getByText('Sign in with Google')

    fireEvent.click(googleButton)

    // Button should show loading text
    expect(await screen.findByText('Signing in...')).toBeInTheDocument()
  })

  test('disables buttons during sign-in', async () => {
    mockSignIn.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )

    render(<SignIn />)
    const googleButton = screen.getByText('Sign in with Google')
    const guestButton = screen.getByText('Continue as Guest')

    fireEvent.click(googleButton)

    // Both buttons should be disabled
    expect(googleButton.closest('button')).toBeDisabled()
    expect(guestButton.closest('button')).toBeDisabled()
  })
})
