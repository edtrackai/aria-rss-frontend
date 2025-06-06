"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import AuthService, { User, LoginCredentials, RegisterData } from '@/lib/auth'
import { useEffect } from 'react'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  getCurrentUser: () => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await AuthService.login(credentials)
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error: any) {
          set({
            error: error.message || 'Login failed',
            isLoading: false,
            isAuthenticated: false,
            user: null,
          })
          throw error
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await AuthService.register(data)
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error: any) {
          set({
            error: error.message || 'Registration failed',
            isLoading: false,
            isAuthenticated: false,
            user: null,
          })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })
        
        try {
          await AuthService.logout()
        } catch (error) {
          console.warn('Logout API call failed:', error)
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      },

      refreshToken: async () => {
        try {
          const token = await AuthService.refreshToken()
          if (token) {
            const user = await AuthService.getCurrentUser()
            if (user) {
              set({
                user,
                isAuthenticated: true,
                error: null,
              })
            }
          }
        } catch (error) {
          console.warn('Token refresh failed:', error)
          get().logout()
        }
      },

      getCurrentUser: async () => {
        if (!AuthService.isAuthenticated()) {
          return
        }

        set({ isLoading: true })
        
        try {
          const user = await AuthService.getCurrentUser()
          if (user) {
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            })
          }
        } catch (error: any) {
          set({
            error: error.message || 'Failed to get user data',
            isLoading: false,
            isAuthenticated: false,
            user: null,
          })
        }
      },

      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

/**
 * Main authentication hook
 */
export function useAuth() {
  const store = useAuthStore()

  useEffect(() => {
    // Initialize auth state on mount
    const initAuth = async () => {
      const storedUser = AuthService.getStoredUser()
      const hasToken = AuthService.isAuthenticated()

      if (hasToken && storedUser) {
        // Verify the token is still valid
        await store.getCurrentUser()
      } else if (hasToken) {
        // We have a token but no user data
        await store.getCurrentUser()
      } else {
        // No token, ensure we're logged out
        store.setLoading(false)
      }
    }

    initAuth()
  }, [store])

  return store
}

/**
 * Hook for checking if user has specific permission
 */
export function usePermission(permission: string) {
  const { user } = useAuth()
  
  const hasPermission = (userRole: string, requiredPermission: string): boolean => {
    const rolePermissions: Record<string, string[]> = {
      admin: ['read', 'write', 'delete', 'manage_users', 'manage_settings'],
      editor: ['read', 'write', 'publish', 'manage_content'],
      author: ['read', 'write', 'publish_own'],
    }

    return rolePermissions[userRole]?.includes(requiredPermission) || false
  }

  return {
    hasPermission: user ? hasPermission(user.role, permission) : false,
    role: user?.role,
  }
}

/**
 * Hook for requiring authentication
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading, user } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/login'
    }
  }, [isAuthenticated, isLoading])

  return {
    isAuthenticated,
    isLoading,
    user,
  }
}

/**
 * Hook for guest-only pages (redirect if authenticated)
 */
export function useGuestOnly() {
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      window.location.href = '/dashboard'
    }
  }, [isAuthenticated, isLoading])

  return {
    isAuthenticated,
    isLoading,
  }
}

export default useAuth