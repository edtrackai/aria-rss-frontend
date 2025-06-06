"use client"

import React, { useEffect, useState, useCallback } from 'react'
import { logger } from '@/lib/logging'

interface PerformanceMetrics {
  navigation: {
    loadTime: number
    domContentLoaded: number
    firstPaint: number
    firstContentfulPaint: number
    largestContentfulPaint: number
    firstInputDelay: number
    cumulativeLayoutShift: number
  }
  resources: Array<{
    name: string
    type: string
    size: number
    duration: number
    startTime: number
  }>
  memory?: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  }
  connection?: {
    effectiveType: string
    downlink: number
    rtt: number
  }
}

interface PerformanceMonitorProps {
  enabled?: boolean
  reportInterval?: number
  onMetrics?: (metrics: PerformanceMetrics) => void
}

export function PerformanceMonitor({
  enabled = process.env.NODE_ENV !== 'production',
  reportInterval = 30000, // 30 seconds
  onMetrics
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)

  const collectNavigationMetrics = useCallback(() => {
    if (typeof window === 'undefined' || !window.performance) {
      return null
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (!navigation) return null

    return {
      loadTime: navigation.loadEventEnd - navigation.startTime,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.startTime,
      firstPaint: 0, // Will be filled by paint timing
      firstContentfulPaint: 0, // Will be filled by paint timing
      largestContentfulPaint: 0, // Will be filled by LCP observer
      firstInputDelay: 0, // Will be filled by FID observer
      cumulativeLayoutShift: 0, // Will be filled by CLS observer
    }
  }, [])

  const collectResourceMetrics = useCallback(() => {
    if (typeof window === 'undefined' || !window.performance) {
      return []
    }

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    
    return resources.map(resource => ({
      name: resource.name,
      type: resource.initiatorType,
      size: resource.transferSize || 0,
      duration: resource.responseEnd - resource.requestStart,
      startTime: resource.startTime,
    }))
  }, [])

  const collectMemoryMetrics = useCallback(() => {
    if (typeof window === 'undefined' || !(performance as any).memory) {
      return undefined
    }

    const memory = (performance as any).memory
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    }
  }, [])

  const collectConnectionMetrics = useCallback(() => {
    if (typeof window === 'undefined' || !(navigator as any).connection) {
      return undefined
    }

    const connection = (navigator as any).connection
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
    }
  }, [])

  const collectAllMetrics = useCallback(() => {
    const navigationMetrics = collectNavigationMetrics()
    if (!navigationMetrics) return null

    const allMetrics: PerformanceMetrics = {
      navigation: navigationMetrics,
      resources: collectResourceMetrics(),
      memory: collectMemoryMetrics(),
      connection: collectConnectionMetrics(),
    }

    return allMetrics
  }, [collectNavigationMetrics, collectResourceMetrics, collectMemoryMetrics, collectConnectionMetrics])

  // Observe Core Web Vitals
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    let observer: PerformanceObserver | null = null

    // Observe paint timing
    if ('PerformanceObserver' in window) {
      observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-paint') {
            setMetrics(prev => prev ? {
              ...prev,
              navigation: { ...prev.navigation, firstPaint: entry.startTime }
            } : null)
          } else if (entry.name === 'first-contentful-paint') {
            setMetrics(prev => prev ? {
              ...prev,
              navigation: { ...prev.navigation, firstContentfulPaint: entry.startTime }
            } : null)
          }
        }
      })

      try {
        observer.observe({ entryTypes: ['paint'] })
      } catch (error) {
        console.warn('Paint timing observer not supported')
      }
    }

    // Observe LCP
    let lcpObserver: PerformanceObserver | null = null
    if ('PerformanceObserver' in window) {
      lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        
        setMetrics(prev => prev ? {
          ...prev,
          navigation: { ...prev.navigation, largestContentfulPaint: lastEntry.startTime }
        } : null)
      })

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      } catch (error) {
        console.warn('LCP observer not supported')
      }
    }

    // Observe FID
    let fidObserver: PerformanceObserver | null = null
    if ('PerformanceObserver' in window) {
      fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          setMetrics(prev => prev ? {
            ...prev,
            navigation: { ...prev.navigation, firstInputDelay: (entry as any).processingStart - entry.startTime }
          } : null)
        }
      })

      try {
        fidObserver.observe({ entryTypes: ['first-input'] })
      } catch (error) {
        console.warn('FID observer not supported')
      }
    }

    // Observe CLS
    let clsValue = 0
    let clsObserver: PerformanceObserver | null = null
    if ('PerformanceObserver' in window) {
      clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
            setMetrics(prev => prev ? {
              ...prev,
              navigation: { ...prev.navigation, cumulativeLayoutShift: clsValue }
            } : null)
          }
        }
      })

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      } catch (error) {
        console.warn('CLS observer not supported')
      }
    }

    return () => {
      observer?.disconnect()
      lcpObserver?.disconnect()
      fidObserver?.disconnect()
      clsObserver?.disconnect()
    }
  }, [enabled])

  // Collect and report metrics periodically
  useEffect(() => {
    if (!enabled) return

    // Initial collection after page load
    const timer = setTimeout(() => {
      const initialMetrics = collectAllMetrics()
      if (initialMetrics) {
        setMetrics(initialMetrics)
        onMetrics?.(initialMetrics)
        
        // Log performance metrics
        logger.info('Performance metrics collected', {
          loadTime: initialMetrics.navigation.loadTime,
          domContentLoaded: initialMetrics.navigation.domContentLoaded,
          firstContentfulPaint: initialMetrics.navigation.firstContentfulPaint,
          largestContentfulPaint: initialMetrics.navigation.largestContentfulPaint,
          resourceCount: initialMetrics.resources.length,
          memoryUsage: initialMetrics.memory?.usedJSHeapSize,
          connectionType: initialMetrics.connection?.effectiveType,
        })
      }
    }, 1000)

    // Periodic collection
    const interval = setInterval(() => {
      const currentMetrics = collectAllMetrics()
      if (currentMetrics) {
        setMetrics(currentMetrics)
        onMetrics?.(currentMetrics)
      }
    }, reportInterval)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [enabled, reportInterval, collectAllMetrics, onMetrics])

  // Report slow operations
  useEffect(() => {
    if (!enabled || !metrics) return

    const { navigation } = metrics

    // Report slow page loads
    if (navigation.loadTime > 3000) {
      logger.warn('Slow page load detected', {
        loadTime: navigation.loadTime,
        url: window.location.href,
      })
    }

    // Report poor Core Web Vitals
    if (navigation.largestContentfulPaint > 2500) {
      logger.warn('Poor LCP detected', {
        lcp: navigation.largestContentfulPaint,
        url: window.location.href,
      })
    }

    if (navigation.firstInputDelay > 100) {
      logger.warn('Poor FID detected', {
        fid: navigation.firstInputDelay,
        url: window.location.href,
      })
    }

    if (navigation.cumulativeLayoutShift > 0.1) {
      logger.warn('Poor CLS detected', {
        cls: navigation.cumulativeLayoutShift,
        url: window.location.href,
      })
    }

    // Report memory issues
    if (metrics.memory && metrics.memory.usedJSHeapSize > 100 * 1024 * 1024) { // 100MB
      logger.warn('High memory usage detected', {
        memoryUsage: metrics.memory.usedJSHeapSize,
        url: window.location.href,
      })
    }
  }, [enabled, metrics])

  // Don't render anything in production or when disabled
  if (!enabled || process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs max-w-xs z-50">
      <div className="font-semibold mb-2">Performance Monitor</div>
      {metrics && (
        <div className="space-y-1">
          <div>Load: {Math.round(metrics.navigation.loadTime)}ms</div>
          <div>FCP: {Math.round(metrics.navigation.firstContentfulPaint)}ms</div>
          <div>LCP: {Math.round(metrics.navigation.largestContentfulPaint)}ms</div>
          <div>FID: {Math.round(metrics.navigation.firstInputDelay)}ms</div>
          <div>CLS: {metrics.navigation.cumulativeLayoutShift.toFixed(3)}</div>
          {metrics.memory && (
            <div>Memory: {Math.round(metrics.memory.usedJSHeapSize / 1024 / 1024)}MB</div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Hook for monitoring component performance
 */
export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      logger.debug(`Component ${componentName} render time`, {
        component: componentName,
        duration: Math.round(duration),
      })
    }
  }, [componentName])
}

/**
 * HOC for monitoring component performance
 */
export function withPerformanceMonitor<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const WrappedComponent = (props: P) => {
    const name = componentName || Component.displayName || Component.name || 'Anonymous'
    usePerformanceMonitor(name)
    
    return <Component {...props} />
  }
  
  WrappedComponent.displayName = `withPerformanceMonitor(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

export default PerformanceMonitor