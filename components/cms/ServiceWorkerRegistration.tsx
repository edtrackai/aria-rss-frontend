"use client"

import React, { useEffect, useState } from 'react'
import { logger } from '@/lib/logging'
import { useToast } from '@/components/providers/ToastProvider'

interface ServiceWorkerRegistrationProps {
  swPath?: string
  enabled?: boolean
  onUpdate?: (registration: ServiceWorkerRegistration) => void
  onOffline?: () => void
  onOnline?: () => void
}

export function ServiceWorkerRegistration({
  swPath = '/sw.js',
  enabled = process.env.NODE_ENV === 'production',
  onUpdate,
  onOffline,
  onOnline
}: ServiceWorkerRegistrationProps) {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.register(swPath, {
          scope: '/',
        })

        setRegistration(reg)
        logger.info('Service Worker registered successfully', {
          scope: reg.scope,
          updateViaCache: reg.updateViaCache,
        })

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true)
                onUpdate?.(reg)
                
                toast({
                  title: 'App Update Available',
                  description: 'A new version is ready. Refresh to update.',
                  action: {
                    label: 'Refresh',
                    onClick: () => window.location.reload(),
                  },
                  duration: 0, // Don't auto-dismiss
                })
              }
            })
          }
        })

        // Handle messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          const { type, payload } = event.data

          switch (type) {
            case 'CACHE_UPDATED':
              logger.info('Cache updated', payload)
              break
            case 'OFFLINE_FALLBACK':
              logger.info('Offline fallback activated', payload)
              break
            case 'BACKGROUND_SYNC':
              logger.info('Background sync completed', payload)
              break
            case 'PUSH_NOTIFICATION':
              logger.info('Push notification received', payload)
              break
          }
        })

      } catch (error) {
        logger.error('Service Worker registration failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    registerSW()
  }, [enabled, swPath, onUpdate, toast])

  // Handle online/offline status
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => {
      setIsOnline(true)
      onOnline?.()
      logger.info('App came online')
      toast({
        title: 'Back Online',
        description: 'Connection restored.',
        variant: 'success',
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      onOffline?.()
      logger.warn('App went offline')
      toast({
        title: 'Offline',
        description: 'Working in offline mode.',
        variant: 'warning',
      })
    }

    // Set initial state
    setIsOnline(navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [onOnline, onOffline, toast])

  // Periodic update check
  useEffect(() => {
    if (!registration) return

    const checkForUpdates = () => {
      registration.update().catch((error) => {
        logger.warn('Update check failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      })
    }

    // Check for updates every 30 minutes
    const interval = setInterval(checkForUpdates, 30 * 60 * 1000)

    // Check for updates when app becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkForUpdates()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [registration])

  const updateServiceWorker = async () => {
    if (!registration || !updateAvailable) return

    try {
      await registration.update()
      window.location.reload()
    } catch (error) {
      logger.error('Failed to update service worker', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      toast({
        title: 'Update Failed',
        description: 'Failed to update the app. Please refresh manually.',
        variant: 'destructive',
      })
    }
  }

  const sendMessageToSW = (message: any) => {
    if (registration?.active) {
      registration.active.postMessage(message)
    }
  }

  // Cache management utilities
  const clearCache = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        )
        logger.info('All caches cleared')
        toast({
          title: 'Cache Cleared',
          description: 'App cache has been cleared successfully.',
          variant: 'success',
        })
      } catch (error) {
        logger.error('Failed to clear cache', {
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
  }

  const getCacheSize = async (): Promise<number> => {
    if (!('caches' in window)) return 0

    try {
      const cacheNames = await caches.keys()
      let totalSize = 0

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName)
        const keys = await cache.keys()
        
        for (const request of keys) {
          const response = await cache.match(request)
          if (response) {
            const size = parseInt(response.headers.get('content-length') || '0', 10)
            totalSize += size
          }
        }
      }

      return totalSize
    } catch (error) {
      logger.warn('Failed to calculate cache size', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return 0
    }
  }

  // Don't render anything unless in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-3 rounded-lg text-xs max-w-xs z-50">
      <div className="font-semibold mb-2">Service Worker Status</div>
      <div className="space-y-1">
        <div>Status: {registration ? 'Registered' : 'Not Registered'}</div>
        <div>Online: {isOnline ? 'Yes' : 'No'}</div>
        {updateAvailable && (
          <div>
            <div className="text-yellow-400">Update Available</div>
            <button
              onClick={updateServiceWorker}
              className="mt-1 bg-blue-600 text-white px-2 py-1 rounded text-xs"
            >
              Update Now
            </button>
          </div>
        )}
        <div className="pt-2 border-t border-gray-600">
          <button
            onClick={clearCache}
            className="bg-red-600 text-white px-2 py-1 rounded text-xs mr-2"
          >
            Clear Cache
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Hook for service worker utilities
 */
export function useServiceWorker() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(setRegistration)
    }

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    setIsOnline(navigator.onLine)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const updateApp = async () => {
    if (registration) {
      await registration.update()
      window.location.reload()
    }
  }

  const sendMessage = (message: any) => {
    if (registration?.active) {
      registration.active.postMessage(message)
    }
  }

  return {
    registration,
    isOnline,
    updateAvailable,
    updateApp,
    sendMessage,
  }
}

/**
 * Cache utilities for manual cache management
 */
export const cacheUtils = {
  async preloadResources(urls: string[]) {
    if ('caches' in window) {
      const cache = await caches.open('manual-cache')
      await cache.addAll(urls)
    }
  },

  async cacheResource(url: string, response: Response) {
    if ('caches' in window) {
      const cache = await caches.open('manual-cache')
      await cache.put(url, response.clone())
    }
  },

  async getCachedResource(url: string): Promise<Response | null> {
    if ('caches' in window) {
      const cache = await caches.open('manual-cache')
      return await cache.match(url) || null
    }
    return null
  },

  async removeFromCache(url: string) {
    if ('caches' in window) {
      const cache = await caches.open('manual-cache')
      await cache.delete(url)
    }
  },
}

export default ServiceWorkerRegistration