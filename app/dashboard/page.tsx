"use client"

import { WelcomeHeader } from '../(dashboard)/components/WelcomeHeader'
import { StatsCards } from '../(dashboard)/components/StatsCards'
import { QuickActions } from '../(dashboard)/components/QuickActions'
import { TrendingTopics } from '../(dashboard)/components/TrendingTopics'
import { RecentArticles } from '../(dashboard)/components/RecentArticles'
import { RevenueWidget } from '../(dashboard)/components/RevenueWidget'
import { ActivityFeed } from '../(dashboard)/components/ActivityFeed'
import { AIAssistant } from '../(dashboard)/components/AIAssistant'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/cms/ui/button'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading, error: statsError, refetch } = useDashboardStats()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

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
        <StatsCards stats={stats} isLoading={statsLoading} error={statsError} />
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
            <RevenueWidget />
          </motion.div>

          {/* Recent Articles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <RecentArticles />
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
            <AIAssistant />
          </motion.div>

          {/* Trending Topics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <TrendingTopics />
          </motion.div>
        </div>
      </div>

      {/* Activity Feed - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <ActivityFeed />
      </motion.div>
    </div>
  )
}