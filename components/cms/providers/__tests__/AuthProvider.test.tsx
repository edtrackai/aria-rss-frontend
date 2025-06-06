import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuthContext, withAuth, useRequireAuth } from '../AuthProvider'
import { useAuth } from '@/hooks/useAuth'

// Mock the useAuth hook
jest.mock('@/hooks/useAuth')

// Mock window.location
delete (window as any).location
window.location = { href: '' } as any

describe('AuthProvider', () => {
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
  
  const mockAuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    clearError: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue(mockAuthState)
    window.location.href = ''
  })

  describe('Basic Functionality', () => {
    it('renders children when not loading', () => {
      render(
        <AuthProvider>
          <div>Test Child</div>
        </AuthProvider>
      )
      
      expect(screen.getByText('Test Child')).toBeInTheDocument()
    })

    it('shows loading spinner during initialization', () => {
      mockUseAuth.mockReturnValue({ ...mockAuthState, isLoading: true })
      
      render(
        <AuthProvider>
          <div>Test Child</div>
        </AuthProvider>
      )
      
      expect(screen.queryByText('Test Child')).not.toBeInTheDocument()
      // Check for the spinner element (using class since the component doesn't have data-testid)
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('provides auth context to children', () => {
      const TestComponent = () => {
        const auth = useAuthContext()
        return (
          <div>
            <div data-testid="authenticated">{auth.isAuthenticated ? 'Yes' : 'No'}</div>
            <div data-testid="user">{auth.user?.email || 'None'}</div>
          </div>
        )
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByTestId('authenticated')).toHaveTextContent('No')
      expect(screen.getByTestId('user')).toHaveTextContent('None')
    })
  })

  describe('Authentication State Management', () => {
    it('handles login correctly', async () => {
      const TestComponent = () => {
        const auth = useAuthContext()
        return (
          <button onClick={() => auth.login('test@example.com', 'password')}>
            Login
          </button>
        )
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const loginButton = screen.getByRole('button', { name: 'Login' })
      await userEvent.click(loginButton)

      expect(mockAuthState.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      })
    })

    it('handles login with 2FA code', async () => {
      const TestComponent = () => {
        const auth = useAuthContext()
        return (
          <button onClick={() => auth.login('test@example.com', 'password', '123456')}>
            Login with 2FA
          </button>
        )
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const loginButton = screen.getByRole('button', { name: 'Login with 2FA' })
      await userEvent.click(loginButton)

      expect(mockAuthState.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
        twoFactorCode: '123456',
      })
    })

    it('handles registration correctly', async () => {
      const TestComponent = () => {
        const auth = useAuthContext()
        return (
          <button 
            onClick={() => auth.register({
              email: 'new@example.com',
              password: 'password',
              firstName: 'John',
              lastName: 'Doe'
            })}
          >
            Register
          </button>
        )
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const registerButton = screen.getByRole('button', { name: 'Register' })
      await userEvent.click(registerButton)

      expect(mockAuthState.register).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe'
      })
    })

    it('handles logout correctly', async () => {
      const TestComponent = () => {
        const auth = useAuthContext()
        return <button onClick={auth.logout}>Logout</button>
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const logoutButton = screen.getByRole('button', { name: 'Logout' })
      await userEvent.click(logoutButton)

      expect(mockAuthState.logout).toHaveBeenCalled()
    })

    it('handles error clearing', async () => {
      const TestComponent = () => {
        const auth = useAuthContext()
        return (
          <div>
            <div data-testid="error">{auth.error || 'No error'}</div>
            <button onClick={auth.clearError}>Clear Error</button>
          </div>
        )
      }

      mockUseAuth.mockReturnValue({
        ...mockAuthState,
        error: 'Test error message',
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByTestId('error')).toHaveTextContent('Test error message')

      const clearButton = screen.getByRole('button', { name: 'Clear Error' })
      await userEvent.click(clearButton)

      expect(mockAuthState.clearError).toHaveBeenCalled()
    })
  })

  describe('Route Protection', () => {
    it('redirects unauthenticated users to login', async () => {
      mockUseAuth.mockReturnValue({
        ...mockAuthState,
        isAuthenticated: false,
        isLoading: false,
      })

      render(
        <AuthProvider redirectTo="/login">
          <div>Protected Content</div>
        </AuthProvider>
      )

      await waitFor(() => {
        expect(window.location.href).toBe('/login')
      })
    })

    it('does not redirect from public paths', async () => {
      window.location.pathname = '/login'
      
      mockUseAuth.mockReturnValue({
        ...mockAuthState,
        isAuthenticated: false,
        isLoading: false,
      })

      render(
        <AuthProvider redirectTo="/login">
          <div>Login Page</div>
        </AuthProvider>
      )

      await waitFor(() => {
        expect(window.location.href).toBe('')
      })
    })

    it('redirects authenticated users when redirectIfAuthenticated is set', async () => {
      mockUseAuth.mockReturnValue({
        ...mockAuthState,
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'test@example.com', role: 'user' },
      })

      render(
        <AuthProvider redirectIfAuthenticated="/dashboard">
          <div>Login Page</div>
        </AuthProvider>
      )

      await waitFor(() => {
        expect(window.location.href).toBe('/dashboard')
      })
    })
  })

  describe('withAuth HOC', () => {
    it('shows loading spinner while checking auth', () => {
      mockUseAuth.mockReturnValue({
        ...mockAuthState,
        isLoading: true,
      })

      const ProtectedComponent = withAuth(() => <div>Protected Content</div>)

      render(
        <AuthProvider>
          <ProtectedComponent />
        </AuthProvider>
      )

      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    it('renders component when authenticated', () => {
      mockUseAuth.mockReturnValue({
        ...mockAuthState,
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'test@example.com', role: 'user' },
      })

      const ProtectedComponent = withAuth(() => <div>Protected Content</div>)

      render(
        <AuthProvider>
          <ProtectedComponent />
        </AuthProvider>
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('redirects when not authenticated', async () => {
      mockUseAuth.mockReturnValue({
        ...mockAuthState,
        isAuthenticated: false,
        isLoading: false,
      })

      const ProtectedComponent = withAuth(() => <div>Protected Content</div>)

      render(
        <AuthProvider>
          <ProtectedComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(window.location.href).toBe('/login')
      })
    })

    it('shows unauthorized when user lacks required role', () => {
      mockUseAuth.mockReturnValue({
        ...mockAuthState,
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'test@example.com', role: 'user' },
      })

      const AdminComponent = withAuth(
        () => <div>Admin Content</div>,
        { requireRole: 'admin' }
      )

      render(
        <AuthProvider>
          <AdminComponent />
        </AuthProvider>
      )

      expect(screen.getByText('Unauthorized')).toBeInTheDocument()
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
    })

    it('renders component when user has required role', () => {
      mockUseAuth.mockReturnValue({
        ...mockAuthState,
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'test@example.com', role: 'admin' },
      })

      const AdminComponent = withAuth(
        () => <div>Admin Content</div>,
        { requireRole: 'admin' }
      )

      render(
        <AuthProvider>
          <AdminComponent />
        </AuthProvider>
      )

      expect(screen.getByText('Admin Content')).toBeInTheDocument()
    })
  })

  describe('useRequireAuth Hook', () => {
    const TestComponent = () => {
      const { isAuthenticated, user, hasRequiredRole } = useRequireAuth({ requireRole: 'admin' })
      
      return (
        <div>
          <div data-testid="authenticated">{isAuthenticated ? 'Yes' : 'No'}</div>
          <div data-testid="user">{user?.email || 'None'}</div>
          <div data-testid="has-role">{hasRequiredRole ? 'Yes' : 'No'}</div>
        </div>
      )
    }

    it('returns auth state correctly', () => {
      mockUseAuth.mockReturnValue({
        ...mockAuthState,
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com', role: 'admin' },
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByTestId('authenticated')).toHaveTextContent('Yes')
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
      expect(screen.getByTestId('has-role')).toHaveTextContent('Yes')
    })

    it('redirects when not authenticated', async () => {
      mockUseAuth.mockReturnValue({
        ...mockAuthState,
        isAuthenticated: false,
        isLoading: false,
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(window.location.href).toBe('/login')
      })
    })

    it('redirects when user lacks required role', async () => {
      mockUseAuth.mockReturnValue({
        ...mockAuthState,
        isAuthenticated: true,
        isLoading: false,
        user: { id: '1', email: 'test@example.com', role: 'user' },
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(window.location.href).toBe('/unauthorized')
      })
    })
  })

  describe('Error Scenarios', () => {
    it('throws error when useAuthContext is used outside provider', () => {
      const TestComponent = () => {
        useAuthContext()
        return null
      }

      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      expect(() => {
        render(<TestComponent />)
      }).toThrow('useAuthContext must be used within an AuthProvider')

      consoleSpy.mockRestore()
    })

    it('handles initialization errors gracefully', async () => {
      mockUseAuth.mockReturnValue({
        ...mockAuthState,
        isLoading: false,
        error: 'Failed to initialize',
      })

      render(
        <AuthProvider>
          <div>Test Content</div>
        </AuthProvider>
      )

      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles rapid authentication state changes', async () => {
      const { rerender } = render(
        <AuthProvider>
          <div>Test Content</div>
        </AuthProvider>
      )

      // Simulate rapid state changes
      mockUseAuth.mockReturnValue({
        ...mockAuthState,
        isLoading: true,
      })
      rerender(
        <AuthProvider>
          <div>Test Content</div>
        </AuthProvider>
      )

      mockUseAuth.mockReturnValue({
        ...mockAuthState,
        isLoading: false,
        isAuthenticated: true,
      })
      rerender(
        <AuthProvider>
          <div>Test Content</div>
        </AuthProvider>
      )

      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('preserves context through re-renders', () => {
      let renderCount = 0
      const TestComponent = () => {
        const auth = useAuthContext()
        renderCount++
        return <div data-testid="render-count">{renderCount}</div>
      }

      const { rerender } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(renderCount).toBe(1)

      rerender(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(renderCount).toBe(2)
    })
  })
})