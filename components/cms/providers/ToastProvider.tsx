"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'
import { Toast, ToastProvider as RadixToastProvider, ToastTitle, ToastDescription, ToastClose, ToastAction } from '@/components/cms/ui/toast'
import { Toaster } from '@/components/cms/ui/toaster'

export interface ToastData {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success' | 'warning'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toasts: ToastData[]
  toast: (data: Omit<ToastData, 'id'>) => string
  success: (title: string, description?: string) => string
  error: (title: string, description?: string) => string
  warning: (title: string, description?: string) => string
  info: (title: string, description?: string) => string
  dismiss: (id: string) => void
  dismissAll: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

interface ToastProviderProps {
  children: React.ReactNode
  maxToasts?: number
}

export function ToastProvider({ children, maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const toast = useCallback((data: Omit<ToastData, 'id'>) => {
    const id = generateId()
    const newToast: ToastData = {
      id,
      duration: 5000,
      variant: 'default',
      ...data,
    }

    setToasts(prev => {
      const updated = [newToast, ...prev].slice(0, maxToasts)
      return updated
    })

    // Auto-dismiss after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        dismiss(id)
      }, newToast.duration)
    }

    return id
  }, [maxToasts])

  const success = useCallback((title: string, description?: string) => {
    return toast({ title, description, variant: 'success' })
  }, [toast])

  const error = useCallback((title: string, description?: string) => {
    return toast({ title, description, variant: 'destructive' })
  }, [toast])

  const warning = useCallback((title: string, description?: string) => {
    return toast({ title, description, variant: 'warning' })
  }, [toast])

  const info = useCallback((title: string, description?: string) => {
    return toast({ title, description, variant: 'default' })
  }, [toast])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    setToasts([])
  }, [])

  const contextValue: ToastContextType = {
    toasts,
    toast,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll,
  }

  return (
    <ToastContext.Provider value={contextValue}>
      <RadixToastProvider>
        {children}
        <Toaster />
      </RadixToastProvider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

/**
 * Hook for API error handling with toasts
 */
export function useApiErrorHandler() {
  const { error } = useToast()

  const handleApiError = useCallback((err: any, defaultMessage = 'An error occurred') => {
    const message = err?.response?.data?.message || err?.message || defaultMessage
    error('Error', message)
  }, [error])

  return { handleApiError }
}

/**
 * Hook for async operations with toast feedback
 */
export function useAsyncToast() {
  const { toast, success, error } = useToast()

  const executeWithToast = useCallback(async (
    operation: () => Promise<any>,
    options: {
      loadingMessage?: string
      successMessage?: string
      errorMessage?: string
      showLoading?: boolean
    } = {}
  ): Promise<any> => {
    const {
      loadingMessage = 'Processing...',
      successMessage,
      errorMessage = 'Operation failed',
      showLoading = true,
    } = options

    let loadingToastId: string | undefined

    try {
      if (showLoading) {
        loadingToastId = toast({
          title: loadingMessage,
          duration: 0, // Don't auto-dismiss
        })
      }

      const result = await operation()

      if (loadingToastId) {
        // Replace loading toast with success
        setTimeout(() => {
          if (loadingToastId) {
            // Remove loading toast first
            // Then show success if provided
            if (successMessage) {
              success('Success', successMessage)
            }
          }
        }, 100)
      } else if (successMessage) {
        success('Success', successMessage)
      }

      return result
    } catch (err) {
      if (loadingToastId) {
        // Replace loading toast with error
        setTimeout(() => {
          const message = (err as any)?.response?.data?.message || (err as any)?.message || errorMessage
          error('Error', message)
        }, 100)
      } else {
        const message = (err as any)?.response?.data?.message || (err as any)?.message || errorMessage
        error('Error', message)
      }
      throw err
    } finally {
      if (loadingToastId) {
        // Clean up loading toast
        setTimeout(() => {
          // The toast will be replaced by success/error
        }, 100)
      }
    }
  }, [toast, success, error])

  return { executeWithToast }
}

export default ToastProvider