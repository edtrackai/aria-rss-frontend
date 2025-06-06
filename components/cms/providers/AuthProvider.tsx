"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { User } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string, twoFactorCode?: string) => Promise<void>
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
  redirectTo?: string
  redirectIfAuthenticated?: string
}

export function AuthProvider({ 
  children, 
  redirectTo = '/login',
  redirectIfAuthenticated 
}: AuthProviderProps) {
  const auth = useAuth()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Mark as initialized once we've attempted to load the user
    if (!auth.isLoading) {
      setInitialized(true)
    }
  }, [auth.isLoading])

  useEffect(() => {
    if (!initialized) return

    // Redirect authenticated users if specified
    if (auth.isAuthenticated && redirectIfAuthenticated) {
      window.location.href = redirectIfAuthenticated
      return
    }

    // Redirect unauthenticated users if specified
    if (!auth.isAuthenticated && redirectTo && window.location.pathname !== redirectTo) {
      // Only redirect if we're not already on a public page
      const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/']
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = redirectTo
      }
    }
  }, [auth.isAuthenticated, initialized, redirectTo, redirectIfAuthenticated])

  const contextValue: AuthContextType = {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    login: async (email: string, password: string, twoFactorCode?: string) => {
      await auth.login({ email, password, twoFactorCode })
    },
    register: async (data) => {
      await auth.register(data)
    },
    logout: auth.logout,
    clearError: auth.clearError,
  }

  // Show loading spinner while initializing
  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

/**
 * Higher-order component to require authentication
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    redirectTo?: string
    requireRole?: string
  } = {}
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading, user } = useAuthContext()
    const { redirectTo = '/login', requireRole } = options

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        window.location.href = redirectTo
      }
    }, [isAuthenticated, isLoading])

    useEffect(() => {
      if (requireRole && user && user.role !== requireRole) {
        // Redirect to unauthorized page or dashboard
        window.location.href = '/unauthorized'
      }
    }, [user, requireRole])

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return null
    }

    if (requireRole && user?.role !== requireRole) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Unauthorized</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}

/**
 * Hook to require authentication in a component
 */
export function useRequireAuth(options: { redirectTo?: string; requireRole?: string } = {}) {
  const { isAuthenticated, isLoading, user } = useAuthContext()
  const { redirectTo = '/login', requireRole } = options

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = redirectTo
    }
  }, [isAuthenticated, isLoading, redirectTo])

  useEffect(() => {
    if (requireRole && user && user.role !== requireRole) {
      window.location.href = '/unauthorized'
    }
  }, [user, requireRole])

  return {
    isAuthenticated,
    isLoading,
    user,
    hasRequiredRole: !requireRole || user?.role === requireRole,
  }
}

export default AuthProvider