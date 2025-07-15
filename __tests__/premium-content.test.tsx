import { render, screen } from '@testing-library/react'
import { PremiumContent } from '@/components/premium-content'
import { useAuth } from '@/contexts/auth-context'

// Mock the auth context
jest.mock('@/contexts/auth-context', () => ({
  useAuth: jest.fn()
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('PremiumContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows premium content for premium users', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'test-user', email: 'test@example.com' } as any,
      userData: { isPremium: true } as any,
      isPremium: true,
      loading: false,
      logout: jest.fn(),
      refreshUserData: jest.fn()
    })

    render(
      <PremiumContent>
        <div>Premium content</div>
      </PremiumContent>
    )

    expect(screen.getByText('Premium content')).toBeInTheDocument()
  })

  it('shows upgrade prompt for non-premium users', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'test-user', email: 'test@example.com' } as any,
      userData: { isPremium: false } as any,
      isPremium: false,
      loading: false,
      logout: jest.fn(),
      refreshUserData: jest.fn()
    })

    render(
      <PremiumContent>
        <div>Premium content</div>
      </PremiumContent>
    )

    expect(screen.getByText('Unlock Premium Content')).toBeInTheDocument()
    expect(screen.queryByText('Premium content')).not.toBeInTheDocument()
  })

  it('shows sign in prompt for unauthenticated users', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      userData: null,
      isPremium: false,
      loading: false,
      logout: jest.fn(),
      refreshUserData: jest.fn()
    })

    render(
      <PremiumContent>
        <div>Premium content</div>
      </PremiumContent>
    )

    expect(screen.getByText('Please sign in to access this content')).toBeInTheDocument()
    expect(screen.queryByText('Premium content')).not.toBeInTheDocument()
  })

  it('shows loading state', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      userData: null,
      isPremium: false,
      loading: true,
      logout: jest.fn(),
      refreshUserData: jest.fn()
    })

    render(
      <PremiumContent>
        <div>Premium content</div>
      </PremiumContent>
    )

    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})
