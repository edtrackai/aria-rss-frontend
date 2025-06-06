"use client"

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import TrendsApiService, { TrendData, TrendAnalysis } from '@/lib/api/trendsApi'

export interface TrendingTopic {
  id?: string;
  keyword: string;
  title?: string;
  volume: number;
  searchVolume: number;
  trend: 'rising' | 'steady' | 'declining' | 'up' | 'down' | 'stable';
  difficulty: 'low' | 'medium' | 'high';
  competition?: 'low' | 'medium' | 'high';
  trendScore?: number;
  relatedKeywords: string[];
  suggestedKeywords?: string[];
  category?: string;
}

export interface TrendingTopicsState {
  trends: TrendData[]
  isLoading: boolean
  error: string | null
  lastUpdated: string | null
  totalResults: number
}

export interface TrendingTopicsFilters {
  category?: string
  timeframe?: '24h' | '7d' | '30d' | '90d'
  region?: string
  limit?: number
  minVolume?: number
}

export function useTrendingTopics(filters: TrendingTopicsFilters = {}) {
  const [selectedTrends, setSelectedTrends] = useState<string[]>([])
  const queryClient = useQueryClient()

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['trending-topics', filters],
    queryFn: () => TrendsApiService.getTrendingTopics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  })

  const refreshTrends = useCallback(async () => {
    await refetch()
  }, [refetch])

  const toggleTrendSelection = useCallback((trend: string) => {
    setSelectedTrends(prev => 
      prev.includes(trend) 
        ? prev.filter(t => t !== trend)
        : [...prev, trend]
    )
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedTrends([])
  }, [])

  const selectAll = useCallback(() => {
    if (data?.trends) {
      setSelectedTrends(data.trends.map(trend => trend.keyword))
    }
  }, [data])

  // Add missing properties for compatibility
  const topics = data?.trends || []
  const selectedTopic = selectedTrends[0] || null
  const setSelectedTopic = useCallback((topic: string | null) => {
    if (topic) {
      setSelectedTrends([topic])
    } else {
      setSelectedTrends([])
    }
  }, [])

  const searchTopics = useCallback(async (query: string) => {
    // Mock search implementation
    return topics.filter(trend => 
      trend.keyword.toLowerCase().includes(query.toLowerCase())
    )
  }, [topics])

  return {
    trends: data?.trends || [],
    isLoading,
    error: error?.message || null,
    lastUpdated: data?.lastUpdated || null,
    totalResults: data?.totalResults || 0,
    selectedTrends,
    refreshTrends,
    toggleTrendSelection,
    clearSelection,
    selectAll,
    hasSelection: selectedTrends.length > 0,
    // Add missing properties
    topics,
    selectedTopic,
    setSelectedTopic,
    searchTopics,
    refetch: refreshTrends,
  }
}

/**
 * Hook for analyzing a specific trend
 */
export function useTrendAnalysis(keyword: string, enabled = true) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['trend-analysis', keyword],
    queryFn: () => TrendsApiService.analyzeTrend(keyword, {
      includeRelated: true,
      includeDemographics: true,
      includeSeasonality: true,
    }),
    enabled: enabled && !!keyword,
    staleTime: 15 * 60 * 1000, // 15 minutes
  })

  return {
    analysis: data,
    isLoading,
    error: error?.message || null,
    refresh: refetch,
  }
}

/**
 * Hook for keyword suggestions
 */
export function useKeywordSuggestions(seedKeyword: string, options: {
  limit?: number
  includeQuestions?: boolean
  includeRelated?: boolean
  minVolume?: number
  maxDifficulty?: number
} = {}) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['keyword-suggestions', seedKeyword, options],
    queryFn: () => TrendsApiService.getKeywordSuggestions(seedKeyword, options),
    enabled: !!seedKeyword && seedKeyword.length > 2,
    staleTime: 30 * 60 * 1000, // 30 minutes
  })

  return {
    suggestions: data || [],
    isLoading,
    error: error?.message || null,
    refresh: refetch,
  }
}

/**
 * Hook for social media trends
 */
export function useSocialTrends(
  platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'all',
  options: {
    timeframe?: '24h' | '7d' | '30d'
    region?: string
    category?: string
  } = {}
) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['social-trends', platform, options],
    queryFn: () => TrendsApiService.getSocialTrends(platform, options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 15 * 60 * 1000, // 15 minutes
  })

  return {
    trends: data || [],
    isLoading,
    error: error?.message || null,
    refresh: refetch,
  }
}

/**
 * Hook for news trends
 */
export function useNewsTrends(options: {
  category?: string
  timeframe?: '24h' | '7d' | '30d'
  region?: string
  limit?: number
} = {}) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['news-trends', options],
    queryFn: () => TrendsApiService.getNewsTrends(options),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 30 * 60 * 1000, // 30 minutes
  })

  return {
    trends: data || [],
    isLoading,
    error: error?.message || null,
    refresh: refetch,
  }
}

/**
 * Hook for content gap analysis
 */
export function useContentGaps(params: {
  domain?: string
  competitors?: string[]
  keywords?: string[]
  category?: string
}) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['content-gaps', params],
    queryFn: () => TrendsApiService.findContentGaps(params),
    enabled: !!(params.domain || params.competitors?.length || params.keywords?.length),
    staleTime: 60 * 60 * 1000, // 1 hour
  })

  return {
    gaps: data || [],
    isLoading,
    error: error?.message || null,
    refresh: refetch,
  }
}

/**
 * Hook for trending hashtags
 */
export function useTrendingHashtags(
  platform: string,
  options: {
    limit?: number
    category?: string
    region?: string
  } = {}
) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['trending-hashtags', platform, options],
    queryFn: () => TrendsApiService.getTrendingHashtags(platform, options),
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: 30 * 60 * 1000, // 30 minutes
  })

  return {
    hashtags: data || [],
    isLoading,
    error: error?.message || null,
    refresh: refetch,
  }
}

/**
 * Hook for managing tracked keywords
 */
export function useTrackedKeywords() {
  const [trackingId, setTrackingId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const trackKeywords = useCallback(async (keywords: string[]) => {
    try {
      const response = await TrendsApiService.trackKeywords(keywords)
      setTrackingId(response.trackingId)
      return response
    } catch (error) {
      console.error('Failed to track keywords:', error)
      throw error
    }
  }, [])

  const {
    data: trackedData,
    isLoading: isLoadingTracked,
    error: trackedError,
  } = useQuery({
    queryKey: ['tracked-keywords', trackingId],
    queryFn: () => trackingId ? TrendsApiService.getTrackedKeywords(trackingId) : null,
    enabled: !!trackingId,
    refetchInterval: 60 * 60 * 1000, // 1 hour
  })

  return {
    trackKeywords,
    trackedData,
    isLoadingTracked,
    trackedError: trackedError?.message || null,
    trackingId,
  }
}

/**
 * Combined hook for comprehensive trend analysis
 */
export function useTrendDashboard(filters: TrendingTopicsFilters = {}) {
  const trendingTopics = useTrendingTopics(filters)
  const socialTrends = useSocialTrends('all', { timeframe: '24h' })
  const newsTrends = useNewsTrends({ timeframe: '24h', limit: 10 })

  const isLoading = trendingTopics.isLoading || socialTrends.isLoading || newsTrends.isLoading
  const hasError = !!(trendingTopics.error || socialTrends.error || newsTrends.error)

  const refreshAll = useCallback(async () => {
    await Promise.all([
      trendingTopics.refreshTrends(),
      socialTrends.refresh(),
      newsTrends.refresh(),
    ])
  }, [trendingTopics.refreshTrends, socialTrends.refresh, newsTrends.refresh])

  return {
    trendingTopics: trendingTopics.trends,
    socialTrends: socialTrends.trends,
    newsTrends: newsTrends.trends,
    selectedTrends: trendingTopics.selectedTrends,
    isLoading,
    hasError,
    refreshAll,
    toggleTrendSelection: trendingTopics.toggleTrendSelection,
    clearSelection: trendingTopics.clearSelection,
    selectAllTrends: trendingTopics.selectAll,
  }
}

export default useTrendingTopics