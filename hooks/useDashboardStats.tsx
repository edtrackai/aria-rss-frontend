"use client"

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

export interface DashboardStats {
  totalArticles: number
  publishedArticles: number
  draftArticles: number
  totalViews: number
  totalRevenue: number
  monthlyRevenue: number
  totalClicks: number
  totalComments: number
  conversionRate: number
  viewsChange: number
  revenueChange: number
  articlesChange: number
  commentsChange: number
  topPerformingArticles: Array<{
    id: string
    title: string
    views: number
    revenue: number
  }>
  recentActivity: Array<{
    id: string
    type: 'article_published' | 'revenue_earned' | 'comment_added'
    description: string
    timestamp: string
  }>
  revenueChart: Array<{
    date: string
    revenue: number
    clicks: number
  }>
  trafficSources: Array<{
    source: string
    visits: number
    percentage: number
  }>
}

export interface DashboardFilters {
  period?: '7d' | '30d' | '90d' | '1y'
  category?: string
  author?: string
}

export function useDashboardStats(filters: DashboardFilters = {}) {
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['dashboard-stats', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      
      return await apiClient.get<DashboardStats>(`/api/v1/dashboard/stats?${params}`)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  })

  return {
    stats: stats || {
      totalArticles: 0,
      publishedArticles: 0,
      draftArticles: 0,
      totalViews: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      totalClicks: 0,
      totalComments: 0,
      conversionRate: 0,
      viewsChange: 0,
      revenueChange: 0,
      articlesChange: 0,
      commentsChange: 0,
      topPerformingArticles: [],
      recentActivity: [],
      revenueChart: [],
      trafficSources: [],
    },
    isLoading,
    error: error?.message || null,
    refresh: refetch,
  }
}

/**
 * Hook for real-time dashboard metrics
 */
export function useRealtimeStats() {
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    currentRevenue: 0,
    todayViews: 0,
    liveClicks: 0,
  })

  useEffect(() => {
    // This would connect to WebSocket for real-time updates
    // For now, we'll simulate with periodic updates
    const interval = setInterval(async () => {
      try {
        const data = await apiClient.get('/api/v1/dashboard/realtime')
        setMetrics(data)
      } catch (error) {
        console.warn('Failed to fetch realtime stats:', error)
      }
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return metrics
}

export default useDashboardStats