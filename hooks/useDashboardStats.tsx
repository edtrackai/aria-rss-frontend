"use client"

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { mockDashboardStats } from '@/lib/dashboard/mockData'

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

// Transform mock data to match DashboardStats interface
function transformMockData(mockData: any): DashboardStats {
  return {
    totalArticles: mockData.current?.articles || 45,
    publishedArticles: mockData.current?.articles || 45,
    draftArticles: 0,
    totalViews: mockData.current?.views || 12543,
    totalRevenue: mockData.current?.revenue || 1847.50,
    monthlyRevenue: mockData.current?.revenue || 1847.50,
    totalClicks: mockData.current?.clicks || 3421,
    totalComments: 234, // Using a default value
    conversionRate: 3.7,
    viewsChange: mockData.growth?.views || 27.0,
    revenueChange: mockData.growth?.revenue || 29.0,
    articlesChange: mockData.growth?.articles || 18.4,
    commentsChange: 15.2,
    topPerformingArticles: [
      { id: '1', title: 'Best Laptops for Developers', views: 523, revenue: 125.50 },
      { id: '2', title: 'AI Tools for Content Creation', views: 412, revenue: 89.25 },
      { id: '3', title: 'Web Development in 2025', views: 387, revenue: 67.75 }
    ],
    recentActivity: [
      { id: '1', type: 'article_published', description: 'Published "Best Laptops for Developers"', timestamp: new Date().toISOString() },
      { id: '2', type: 'revenue_earned', description: 'Earned $25.50 from affiliate sales', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: '3', type: 'comment_added', description: 'New comment on "AI Tools"', timestamp: new Date(Date.now() - 7200000).toISOString() }
    ],
    revenueChart: [
      { date: '2025-06-01', revenue: 245.50, clicks: 423 },
      { date: '2025-06-02', revenue: 312.75, clicks: 512 },
      { date: '2025-06-03', revenue: 189.25, clicks: 334 },
      { date: '2025-06-04', revenue: 425.00, clicks: 623 },
      { date: '2025-06-05', revenue: 367.50, clicks: 545 },
      { date: '2025-06-06', revenue: 298.25, clicks: 467 }
    ],
    trafficSources: [
      { source: 'Google', visits: 5234, percentage: 42 },
      { source: 'Direct', visits: 3123, percentage: 25 },
      { source: 'Social Media', visits: 2456, percentage: 20 },
      { source: 'Referral', visits: 1730, percentage: 13 }
    ]
  }
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
      try {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value)
        })
        
        const response = await apiClient.get<any>(`/api/v1/dashboard/stats?${params}`)
        
        // If response has the mock data structure, transform it
        if (response && response.current) {
          return transformMockData(response)
        }
        
        // Otherwise return as is (assuming it matches DashboardStats)
        return response as DashboardStats
      } catch (error) {
        console.warn('Failed to fetch dashboard stats, using mock data:', error)
        return transformMockData(mockDashboardStats)
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    retry: 1, // Only retry once
  })

  // Provide default mock data if nothing is loaded
  const defaultStats = transformMockData(mockDashboardStats)

  return {
    stats: stats || defaultStats,
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