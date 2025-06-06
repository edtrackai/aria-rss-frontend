"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useCallback, useEffect } from 'react'
import { apiClient } from '@/lib/api'

export interface RevenueData {
  totalRevenue: number
  monthlyRevenue: number
  dailyRevenue: number
  commissions: number
  clicks: number
  conversions: number
  conversionRate: number
  topProducts: Array<{
    id: string
    name: string
    revenue: number
    clicks: number
    conversions: number
  }>
  revenueChart: Array<{
    date: string
    revenue: number
    clicks: number
    conversions: number
  }>
  affiliatePerformance: Array<{
    network: string
    revenue: number
    clicks: number
    conversions: number
    cpm: number
  }>
}

export interface RevenueFilters {
  period?: '7d' | '30d' | '90d' | '1y'
  affiliate?: string
  product?: string
  category?: string
  dateRange?: {
    start: string
    end: string
  }
}

export function useRevenueData(filters: RevenueFilters = {}) {
  const {
    data: revenueData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['revenue-data', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value && typeof value === 'object') {
          params.append(key, JSON.stringify(value))
        } else if (value) {
          params.append(key, String(value))
        }
      })
      
      return await apiClient.get<RevenueData>(`/api/v1/revenue/analytics?${params}`)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  })

  return {
    revenueData: revenueData || {
      totalRevenue: 0,
      monthlyRevenue: 0,
      dailyRevenue: 0,
      commissions: 0,
      clicks: 0,
      conversions: 0,
      conversionRate: 0,
      topProducts: [],
      revenueChart: [],
      affiliatePerformance: [],
    },
    isLoading,
    error: error?.message || null,
    refresh: refetch,
  }
}

/**
 * Hook for managing affiliate links
 */
export function useAffiliateLinks() {
  const queryClient = useQueryClient()

  const {
    data: links,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['affiliate-links'],
    queryFn: () => apiClient.get('/api/v1/revenue/affiliate-links'),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  const createLinkMutation = useMutation({
    mutationFn: (linkData: {
      title: string
      url: string
      description?: string
      category?: string
      commissionRate?: number
    }) => apiClient.post('/api/v1/revenue/affiliate-links', linkData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-links'] })
    },
  })

  const updateLinkMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<{
      title: string
      url: string
      description: string
      category: string
      commissionRate: number
      isActive: boolean
    }>) => apiClient.put(`/api/v1/revenue/affiliate-links/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-links'] })
    },
  })

  const deleteLinkMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/v1/revenue/affiliate-links/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-links'] })
    },
  })

  return {
    links: links || [],
    isLoading,
    error: error?.message || null,
    createLink: createLinkMutation.mutate,
    updateLink: updateLinkMutation.mutate,
    deleteLink: deleteLinkMutation.mutate,
    isCreating: createLinkMutation.isPending,
    isUpdating: updateLinkMutation.isPending,
    isDeleting: deleteLinkMutation.isPending,
  }
}

/**
 * Hook for commission tracking
 */
export function useCommissionTracking() {
  const {
    data: commissions,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['commissions'],
    queryFn: () => apiClient.get('/api/v1/revenue/commissions'),
    staleTime: 15 * 60 * 1000, // 15 minutes
  })

  return {
    commissions: commissions || [],
    isLoading,
    error: error?.message || null,
    refresh: refetch,
  }
}

/**
 * Hook for payout management
 */
export function usePayouts() {
  const queryClient = useQueryClient()

  const {
    data: payouts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['payouts'],
    queryFn: () => apiClient.get('/api/v1/revenue/payouts'),
    staleTime: 30 * 60 * 1000, // 30 minutes
  })

  const requestPayoutMutation = useMutation({
    mutationFn: (amount: number) => 
      apiClient.post('/api/v1/revenue/payouts/request', { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] })
      queryClient.invalidateQueries({ queryKey: ['revenue-data'] })
    },
  })

  return {
    payouts: payouts || [],
    isLoading,
    error: error?.message || null,
    requestPayout: requestPayoutMutation.mutate,
    isRequestingPayout: requestPayoutMutation.isPending,
  }
}

/**
 * Hook for real-time revenue tracking
 */
export function useRealtimeRevenue() {
  const [realtimeData, setRealtimeData] = useState({
    currentRevenue: 0,
    todayClicks: 0,
    liveConversions: 0,
    recentCommissions: [] as Array<{
      id: string
      amount: number
      product: string
      timestamp: string
    }>,
  })

  // This would connect to WebSocket in a real implementation
  // For now, we'll use periodic polling
  const { data } = useQuery({
    queryKey: ['realtime-revenue'],
    queryFn: () => apiClient.get('/api/v1/revenue/realtime'),
    refetchInterval: 30000, // 30 seconds
  })

  useEffect(() => {
    if (data) {
      setRealtimeData(data)
    }
  }, [data])

  return realtimeData
}

/**
 * Hook for revenue analytics with comparison periods
 */
export function useRevenueComparison(
  currentPeriod: RevenueFilters,
  comparisonPeriod: RevenueFilters
) {
  const currentData = useRevenueData(currentPeriod)
  const comparisonData = useRevenueData(comparisonPeriod)

  const calculateGrowth = useCallback((current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }, [])

  const analytics = {
    revenueGrowth: calculateGrowth(
      currentData.revenueData.totalRevenue,
      comparisonData.revenueData.totalRevenue
    ),
    clicksGrowth: calculateGrowth(
      currentData.revenueData.clicks,
      comparisonData.revenueData.clicks
    ),
    conversionsGrowth: calculateGrowth(
      currentData.revenueData.conversions,
      comparisonData.revenueData.conversions
    ),
    conversionRateGrowth: calculateGrowth(
      currentData.revenueData.conversionRate,
      comparisonData.revenueData.conversionRate
    ),
  }

  return {
    current: currentData,
    comparison: comparisonData,
    analytics,
    isLoading: currentData.isLoading || comparisonData.isLoading,
    error: currentData.error || comparisonData.error,
  }
}

export default useRevenueData