"use client"

import dynamic from 'next/dynamic'
import { WelcomeHeader } from './components/WelcomeHeader'
import { StatsCards } from './components/StatsCards'
import { QuickActions } from './components/QuickActions'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates'
import { useEffect, useState, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/cms/ui/button'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/cms/ui/skeleton'

// Lazy load heavy components
const TrendingTopics = dynamic(
  () => import('./components/TrendingTopics').then(mod => ({ default: mod.TrendingTopics })),
  { 
    loading: () => <Skeleton className="h-[400px] w-full" />,
    ssr: false 
  }
)

const RecentArticles = dynamic(
  () => import('./components/RecentArticles').then(mod => ({ default: mod.RecentArticles })),
  { 
    loading: () => <Skeleton className="h-[600px] w-full" />,
    ssr: false 
  }
)

const RevenueWidget = dynamic(
  () => import('./components/RevenueWidget').then(mod => ({ default: mod.RevenueWidget })),
  { 
    loading: () => <Skeleton className="h-[300px] w-full" />,
    ssr: false 
  }
)

const ActivityFeed = dynamic(
  () => import('./components/ActivityFeed').then(mod => ({ default: mod.ActivityFeed })),
  { 
    loading: () => <Skeleton className="h-[400px] w-full" />,
    ssr: false 
  }
)

const AIAssistant = dynamic(
  () => import('./components/AIAssistant').then(mod => ({ default: mod.AIAssistant })),
  { 
    loading: () => <Skeleton className="h-[200px] w-full" />,
    ssr: false 
  }
)

export default function DashboardPage() {
  const { stats, isLoading: statsLoading, error: statsError, refresh: refetch } = useDashboardStats()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  
  // Use mock data if stats are not available
  const dashboardStats = stats || {
    totalRevenue: 1847.50,
    pageViews: 12543,
    articlesPublished: 45,
    comments: 234,
    growth: {
      revenue: 29.0,
      views: 27.0,
      articles: 18.4,
      comments: 15.2
    }
  }

  // Enable real-time updates
  useRealtimeUpdates()

  // Pull-to-refresh for mobile
  useEffect(() => {
    let startY = 0
    let currentY = 0
    let pulling = false

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      currentY = e.touches[0].clientY
      const diff = currentY - startY

      if (diff > 50 && window.scrollY === 0 && !pulling) {
        pulling = true
        setIsRefreshing(true)
      }
    }

    const handleTouchEnd = () => {
      if (pulling) {
        pulling = false
        handleRefresh()
      }
      startY = 0
      currentY = 0
    }

    if ('ontouchstart' in window) {
      window.addEventListener('touchstart', handleTouchStart)
      window.addEventListener('touchmove', handleTouchMove)
      window.addEventListener('touchend', handleTouchEnd)

      return () => {
        window.removeEventListener('touchstart', handleTouchStart)
        window.removeEventListener('touchmove', handleTouchMove)
        window.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setLastRefresh(new Date())
    setTimeout(() => setIsRefreshing(false), 500)
  }

  // Load layout preferences from localStorage
  const [layoutPrefs, setLayoutPrefs] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboard-layout')
      return saved ? JSON.parse(saved) : { collapsed: [] }
    }
    return { collapsed: [] }
  })

  const saveLayoutPrefs = (prefs: any) => {
    setLayoutPrefs(prefs)
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboard-layout', JSON.stringify(prefs))
    }
  }

  return (
    <div className="space-y-6">
      {/* Pull-to-refresh indicator */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-background border rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm">Refreshing...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Header */}
      <WelcomeHeader />

      {/* Refresh Button for Desktop */}
      <div className="hidden md:flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          Last updated: {lastRefresh.toLocaleTimeString()}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCards stats={dashboardStats} isLoading={statsLoading} error={statsError ? new Error(statsError) : null} />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
              <RevenueWidget />
            </Suspense>
          </motion.div>

          {/* Recent Articles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
              <RecentArticles />
            </Suspense>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <QuickActions />
          </motion.div>

          {/* AI Assistant */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
              <AIAssistant />
            </Suspense>
          </motion.div>

          {/* Trending Topics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
              <TrendingTopics />
            </Suspense>
          </motion.div>
        </div>
      </div>

      {/* Activity Feed - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <ActivityFeed />
        </Suspense>
      </motion.div>
    </div>
  )
}