import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth, useAuthStore } from '../useAuth'
import AuthService from '@/lib/auth'

// Mock dependencies
jest.mock('@/lib/auth')

const mockAuthService = AuthService as jest.Mocked<typeof AuthService>

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset the Zustand store
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
    // Clear localStorage
    localStorage.clear()
  })

  describe('initial state', () => {
    it('should initialize with default state', () => {
      mockAuthService.isAuthenticated.mockReturnValue(false)
      mockAuthService.getStoredUser.mockReturnValue(null)
      
      const { result } = renderHook(() => useAuth())
      
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('login', () => {
    it('should successfully login user', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User', role: 'author' }
      const mockResponse = { user: mockUser, accessToken: 'access123', refreshToken: 'refresh123' }
      
      mockAuthService.login.mockResolvedValueOnce(mockResponse)

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })

      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
      
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle login error', async () => {
      const mockError = new Error('Invalid credentials')
      mockAuthService.login.mockRejectedValueOnce(mockError)

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        try {
          await result.current.login('test@example.com', 'wrongpassword')
        } catch (error) {
          // Expected to throw
        }
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe('Invalid credentials')
    })
  })

  describe('logout', () => {
    it('should successfully logout user', async () => {
      // Set initial authenticated state
      useAuthStore.setState({
        user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'author' },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
      
      mockAuthService.logout.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.logout()
      })

      expect(mockAuthService.logout).toHaveBeenCalled()
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should handle logout error gracefully', async () => {
      useAuthStore.setState({
        user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'author' },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })

      mockAuthService.logout.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.logout()
      })

      // Should still clear local state even if API call fails
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('register', () => {
    it('should successfully register user', async () => {
      const mockUser = { id: '1', email: 'new@example.com', name: 'New User', role: 'author' }
      const mockResponse = { user: mockUser, accessToken: 'access123', refreshToken: 'refresh123' }
      
      mockAuthService.register.mockResolvedValueOnce(mockResponse)

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.register({
          email: 'new@example.com',
          password: 'password123',
          name: 'New User'
        })
      })

      expect(mockAuthService.register).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User'
      })
      
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should handle registration error', async () => {
      mockAuthService.register.mockRejectedValueOnce(new Error('Email already exists'))

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        try {
          await result.current.register({
            email: 'existing@example.com',
            password: 'password123',
            name: 'User'
          })
        } catch (error) {
          // Expected to throw
        }
      })

      expect(result.current.error).toBe('Email already exists')
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('getCurrentUser', () => {
    it('should fetch current user when authenticated', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User', role: 'author' }
      
      mockAuthService.isAuthenticated.mockReturnValue(true)
      mockAuthService.getCurrentUser.mockResolvedValueOnce(mockUser)

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.getCurrentUser()
      })

      expect(mockAuthService.getCurrentUser).toHaveBeenCalled()
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should not fetch user when not authenticated', async () => {
      mockAuthService.isAuthenticated.mockReturnValue(false)

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.getCurrentUser()
      })

      expect(mockAuthService.getCurrentUser).not.toHaveBeenCalled()
    })

    it('should handle getCurrentUser error', async () => {
      mockAuthService.isAuthenticated.mockReturnValue(true)
      mockAuthService.getCurrentUser.mockRejectedValueOnce(new Error('Token expired'))

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.getCurrentUser()
      })

      expect(result.current.error).toBe('Token expired')
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
    })
  })

  describe('refreshToken', () => {
    it('should refresh token and update user', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User', role: 'author' }
      
      mockAuthService.refreshToken.mockResolvedValueOnce('new-access-token')
      mockAuthService.getCurrentUser.mockResolvedValueOnce(mockUser)

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.refreshToken()
      })

      expect(mockAuthService.refreshToken).toHaveBeenCalled()
      expect(mockAuthService.getCurrentUser).toHaveBeenCalled()
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should logout on refresh token failure', async () => {
      mockAuthService.refreshToken.mockRejectedValueOnce(new Error('Refresh token expired'))
      mockAuthService.logout.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.refreshToken()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('initialization', () => {
    it('should verify stored user on mount when authenticated', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User', role: 'author' }
      
      mockAuthService.getStoredUser.mockReturnValue(mockUser)
      mockAuthService.isAuthenticated.mockReturnValue(true)
      mockAuthService.getCurrentUser.mockResolvedValueOnce(mockUser)

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(mockAuthService.getCurrentUser).toHaveBeenCalled()
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should fetch user when token exists but no stored user', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User', role: 'author' }
      
      mockAuthService.getStoredUser.mockReturnValue(null)
      mockAuthService.isAuthenticated.mockReturnValue(true)
      mockAuthService.getCurrentUser.mockResolvedValueOnce(mockUser)

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(mockAuthService.getCurrentUser).toHaveBeenCalled()
      })

      expect(result.current.user).toEqual(mockUser)
    })

    it('should not fetch user when not authenticated', async () => {
      mockAuthService.getStoredUser.mockReturnValue(null)
      mockAuthService.isAuthenticated.mockReturnValue(false)

      renderHook(() => useAuth())

      await waitFor(() => {
        expect(mockAuthService.getCurrentUser).not.toHaveBeenCalled()
      })
    })
  })

  describe('clearError', () => {
    it('should clear error state', async () => {
      // Set initial error state
      useAuthStore.setState({ error: 'Some error' })

      const { result } = renderHook(() => useAuth())

      expect(result.current.error).toBe('Some error')

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })
})