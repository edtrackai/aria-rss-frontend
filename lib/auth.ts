import { apiClient } from './api'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'editor' | 'author'
  avatar?: string
  isEmailVerified: boolean
  twoFactorEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
  twoFactorCode?: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export class AuthService {
  private static readonly ACCESS_TOKEN_KEY = 'auth_token'
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token'
  private static readonly USER_KEY = 'user_data'

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', credentials)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, response.accessToken)
      localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken)
      localStorage.setItem(this.USER_KEY, JSON.stringify(response.user))
    }
    
    return response
  }

  static async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/register', data)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, response.accessToken)
      localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken)
      localStorage.setItem(this.USER_KEY, JSON.stringify(response.user))
    }
    
    return response
  }

  static async logout(): Promise<void> {
    try {
      await apiClient.post('/api/v1/auth/logout')
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error)
    }
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY)
      localStorage.removeItem(this.REFRESH_TOKEN_KEY)
      localStorage.removeItem(this.USER_KEY)
      window.location.href = '/login'
    }
  }

  static async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = this.getRefreshToken()
      if (!refreshToken) return null

      const response = await apiClient.post<AuthResponse>('/api/v1/auth/refresh', {
        refreshToken
      })

      if (typeof window !== 'undefined') {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, response.accessToken)
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.user))
      }

      return response.accessToken
    } catch (error) {
      this.logout()
      return null
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const user = await apiClient.get<User>('/api/v1/auth/me')
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user))
      }
      
      return user
    } catch (error) {
      return null
    }
  }

  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.ACCESS_TOKEN_KEY)
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  static getStoredUser(): User | null {
    if (typeof window === 'undefined') return null
    
    try {
      const userData = localStorage.getItem(this.USER_KEY)
      return userData ? JSON.parse(userData) : null
    } catch {
      return null
    }
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken()
  }

  static async verifyEmail(token: string): Promise<void> {
    await apiClient.post('/api/v1/auth/verify-email', { token })
  }

  static async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/api/v1/auth/forgot-password', { email })
  }

  static async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post('/api/v1/auth/reset-password', { token, password })
  }

  static async enable2FA(): Promise<{ qrCode: string; backupCodes: string[] }> {
    return await apiClient.post('/api/v1/auth/2fa/enable')
  }

  static async verify2FASetup(code: string): Promise<void> {
    await apiClient.post('/api/v1/auth/2fa/verify-setup', { code })
  }

  static async disable2FA(code: string): Promise<void> {
    await apiClient.post('/api/v1/auth/2fa/disable', { code })
  }
}

export default AuthService