import { AuthService, User, LoginCredentials, RegisterData, AuthResponse } from '../auth'
import { apiClient } from '../api'

// Mock the API client
jest.mock('../api', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}))

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

// Mock localStorage
const mockLocalStorage = {
  storage: new Map<string, string>(),
  getItem: jest.fn((key: string) => mockLocalStorage.storage.get(key) || null),
  setItem: jest.fn((key: string, value: string) => mockLocalStorage.storage.set(key, value)),
  removeItem: jest.fn((key: string) => mockLocalStorage.storage.delete(key)),
  clear: jest.fn(() => mockLocalStorage.storage.clear()),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

// Mock window.location
const mockLocation = {
  href: 'https://example.com',
}

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
})

// Mock console.warn
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation()

describe('AuthService', () => {
  const mockUser: User = {
    id: 'user123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'author',
    avatar: 'https://example.com/avatar.jpg',
    isEmailVerified: true,
    twoFactorEnabled: false,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  }

  const mockAuthResponse: AuthResponse = {
    user: mockUser,
    accessToken: 'access-token-123',
    refreshToken: 'refresh-token-456',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.storage.clear()
    mockConsoleWarn.mockClear()
  })

  afterAll(() => {
    mockConsoleWarn.mockRestore()
  })

  describe('login', () => {
    const loginCredentials: LoginCredentials = {
      email: 'test@example.com',
      password: 'password123',
    }

    it('should login successfully and store tokens', async () => {
      mockApiClient.post.mockResolvedValueOnce(mockAuthResponse)

      const result = await AuthService.login(loginCredentials)

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/auth/login', loginCredentials)
      expect(result).toEqual(mockAuthResponse)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', 'access-token-123')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refresh_token', 'refresh-token-456')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user_data', JSON.stringify(mockUser))
    })

    it('should login with 2FA code', async () => {
      const credentialsWith2FA = { ...loginCredentials, twoFactorCode: '123456' }
      mockApiClient.post.mockResolvedValueOnce(mockAuthResponse)

      const result = await AuthService.login(credentialsWith2FA)

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/auth/login', credentialsWith2FA)
      expect(result).toEqual(mockAuthResponse)
    })

    it('should handle login failure', async () => {
      const error = new Error('Invalid credentials')
      mockApiClient.post.mockRejectedValueOnce(error)

      await expect(AuthService.login(loginCredentials)).rejects.toThrow('Invalid credentials')
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
    })

    it('should not store tokens in server environment', async () => {
      const originalWindow = global.window
      delete (global as any).window

      mockApiClient.post.mockResolvedValueOnce(mockAuthResponse)

      const result = await AuthService.login(loginCredentials)

      expect(result).toEqual(mockAuthResponse)
      // Storage methods shouldn't be called in server environment
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()

      global.window = originalWindow
    })
  })

  describe('register', () => {
    const registerData: RegisterData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    }

    it('should register successfully and store tokens', async () => {
      mockApiClient.post.mockResolvedValueOnce(mockAuthResponse)

      const result = await AuthService.register(registerData)

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/auth/register', registerData)
      expect(result).toEqual(mockAuthResponse)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', 'access-token-123')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refresh_token', 'refresh-token-456')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user_data', JSON.stringify(mockUser))
    })

    it('should handle registration failure', async () => {
      const error = new Error('Email already exists')
      mockApiClient.post.mockRejectedValueOnce(error)

      await expect(AuthService.register(registerData)).rejects.toThrow('Email already exists')
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
    })
  })

  describe('logout', () => {
    beforeEach(() => {
      mockLocalStorage.storage.set('auth_token', 'token')
      mockLocalStorage.storage.set('refresh_token', 'refresh')
      mockLocalStorage.storage.set('user_data', JSON.stringify(mockUser))
    })

    it('should logout successfully and clear tokens', async () => {
      mockApiClient.post.mockResolvedValueOnce({})

      await AuthService.logout()

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/auth/logout')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refresh_token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user_data')
      expect(mockLocation.href).toBe('/login')
    })

    it('should continue logout even if API call fails', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Network error'))

      await AuthService.logout()

      expect(mockConsoleWarn).toHaveBeenCalledWith('Logout API call failed:', expect.any(Error))
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refresh_token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user_data')
      expect(mockLocation.href).toBe('/login')
    })

    it('should not attempt localStorage operations in server environment', async () => {
      const originalWindow = global.window
      delete (global as any).window

      mockApiClient.post.mockResolvedValueOnce({})

      await AuthService.logout()

      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled()

      global.window = originalWindow
    })
  })

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      mockLocalStorage.storage.set('refresh_token', 'refresh-token-456')
      mockApiClient.post.mockResolvedValueOnce(mockAuthResponse)

      const result = await AuthService.refreshToken()

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/auth/refresh', {
        refreshToken: 'refresh-token-456',
      })
      expect(result).toBe('access-token-123')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', 'access-token-123')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user_data', JSON.stringify(mockUser))
    })

    it('should return null if no refresh token', async () => {
      const result = await AuthService.refreshToken()

      expect(result).toBeNull()
      expect(mockApiClient.post).not.toHaveBeenCalled()
    })

    it('should logout on refresh failure', async () => {
      mockLocalStorage.storage.set('refresh_token', 'invalid-token')
      mockApiClient.post.mockRejectedValueOnce(new Error('Invalid refresh token'))

      const logoutSpy = jest.spyOn(AuthService, 'logout').mockImplementation()

      const result = await AuthService.refreshToken()

      expect(result).toBeNull()
      expect(logoutSpy).toHaveBeenCalled()

      logoutSpy.mockRestore()
    })
  })

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockUser)

      const result = await AuthService.getCurrentUser()

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/auth/me')
      expect(result).toEqual(mockUser)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user_data', JSON.stringify(mockUser))
    })

    it('should return null on error', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Unauthorized'))

      const result = await AuthService.getCurrentUser()

      expect(result).toBeNull()
    })
  })

  describe('token getters', () => {
    beforeEach(() => {
      mockLocalStorage.storage.set('auth_token', 'access-token')
      mockLocalStorage.storage.set('refresh_token', 'refresh-token')
    })

    it('should get access token', () => {
      const token = AuthService.getAccessToken()
      expect(token).toBe('access-token')
    })

    it('should get refresh token', () => {
      const token = AuthService.getRefreshToken()
      expect(token).toBe('refresh-token')
    })

    it('should return null for missing tokens', () => {
      mockLocalStorage.storage.clear()
      
      expect(AuthService.getAccessToken()).toBeNull()
      expect(AuthService.getRefreshToken()).toBeNull()
    })

    it('should return null in server environment', () => {
      const originalWindow = global.window
      delete (global as any).window

      expect(AuthService.getAccessToken()).toBeNull()
      expect(AuthService.getRefreshToken()).toBeNull()

      global.window = originalWindow
    })
  })

  describe('getStoredUser', () => {
    it('should get stored user', () => {
      mockLocalStorage.storage.set('user_data', JSON.stringify(mockUser))

      const user = AuthService.getStoredUser()
      expect(user).toEqual(mockUser)
    })

    it('should return null for missing user data', () => {
      const user = AuthService.getStoredUser()
      expect(user).toBeNull()
    })

    it('should return null for invalid JSON', () => {
      mockLocalStorage.storage.set('user_data', 'invalid-json')

      const user = AuthService.getStoredUser()
      expect(user).toBeNull()
    })

    it('should return null in server environment', () => {
      const originalWindow = global.window
      delete (global as any).window

      const user = AuthService.getStoredUser()
      expect(user).toBeNull()

      global.window = originalWindow
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when access token exists', () => {
      mockLocalStorage.storage.set('auth_token', 'access-token')

      const result = AuthService.isAuthenticated()
      expect(result).toBe(true)
    })

    it('should return false when no access token', () => {
      const result = AuthService.isAuthenticated()
      expect(result).toBe(false)
    })
  })

  describe('email verification', () => {
    it('should verify email', async () => {
      mockApiClient.post.mockResolvedValueOnce({})

      await AuthService.verifyEmail('verification-token')

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/auth/verify-email', {
        token: 'verification-token',
      })
    })

    it('should handle verification failure', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Invalid token'))

      await expect(AuthService.verifyEmail('invalid-token')).rejects.toThrow('Invalid token')
    })
  })

  describe('password reset', () => {
    it('should request password reset', async () => {
      mockApiClient.post.mockResolvedValueOnce({})

      await AuthService.forgotPassword('test@example.com')

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/auth/forgot-password', {
        email: 'test@example.com',
      })
    })

    it('should reset password', async () => {
      mockApiClient.post.mockResolvedValueOnce({})

      await AuthService.resetPassword('reset-token', 'new-password')

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/auth/reset-password', {
        token: 'reset-token',
        password: 'new-password',
      })
    })
  })

  describe('two-factor authentication', () => {
    const mockTwoFactorResponse = {
      qrCode: 'data:image/png;base64,qrcode',
      backupCodes: ['code1', 'code2', 'code3'],
    }

    it('should enable 2FA', async () => {
      mockApiClient.post.mockResolvedValueOnce(mockTwoFactorResponse)

      const result = await AuthService.enable2FA()

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/auth/2fa/enable')
      expect(result).toEqual(mockTwoFactorResponse)
    })

    it('should verify 2FA setup', async () => {
      mockApiClient.post.mockResolvedValueOnce({})

      await AuthService.verify2FASetup('123456')

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/auth/2fa/verify-setup', {
        code: '123456',
      })
    })

    it('should disable 2FA', async () => {
      mockApiClient.post.mockResolvedValueOnce({})

      await AuthService.disable2FA('123456')

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/v1/auth/2fa/disable', {
        code: '123456',
      })
    })

    it('should handle 2FA operation failures', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Invalid code'))

      await expect(AuthService.verify2FASetup('invalid')).rejects.toThrow('Invalid code')
      await expect(AuthService.disable2FA('invalid')).rejects.toThrow('Invalid code')
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network error')
      mockApiClient.post.mockRejectedValueOnce(networkError)

      await expect(AuthService.login({
        email: 'test@example.com',
        password: 'password',
      })).rejects.toThrow('Network error')
    })

    it('should handle malformed API responses', async () => {
      mockApiClient.post.mockResolvedValueOnce(null)

      const result = await AuthService.login({
        email: 'test@example.com',
        password: 'password',
      })

      expect(result).toBeNull()
    })

    it('should handle localStorage quota exceeded', () => {
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('QuotaExceededError')
      })

      // Should not throw even if localStorage fails
      expect(async () => {
        mockApiClient.post.mockResolvedValueOnce(mockAuthResponse)
        await AuthService.login({
          email: 'test@example.com',
          password: 'password',
        })
      }).not.toThrow()
    })

    it('should handle concurrent auth operations', async () => {
      mockApiClient.post.mockResolvedValue(mockAuthResponse)

      // Simulate concurrent login attempts
      const promises = [
        AuthService.login({ email: 'test1@example.com', password: 'password' }),
        AuthService.login({ email: 'test2@example.com', password: 'password' }),
        AuthService.login({ email: 'test3@example.com', password: 'password' }),
      ]

      const results = await Promise.all(promises)
      
      expect(results).toHaveLength(3)
      results.forEach(result => {
        expect(result).toEqual(mockAuthResponse)
      })
    })
  })

  describe('type safety', () => {
    it('should enforce User interface structure', () => {
      const user: User = {
        id: 'test',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
        isEmailVerified: true,
        twoFactorEnabled: false,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      }

      expect(user.role).toBe('admin')
      expect(typeof user.isEmailVerified).toBe('boolean')
    })

    it('should enforce AuthResponse interface structure', () => {
      const response: AuthResponse = {
        user: mockUser,
        accessToken: 'token',
        refreshToken: 'refresh',
      }

      expect(response.user).toEqual(mockUser)
      expect(typeof response.accessToken).toBe('string')
    })
  })
})