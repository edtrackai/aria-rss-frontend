"use client"

import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { trendsApi } from '@/lib/api/trendsApi'

export interface TrendingTopic {
  id: string
  title: string
  category: string
  trendScore: number
  competition: 'low' | 'medium' | 'high'
  suggestedKeywords: string[]
  volume: number
  difficulty: 'easy' | 'medium' | 'hard'
  opportunity: 'high' | 'medium' | 'low'
}

export interface TrendingTopicsFilters {
  category?: string
  timeframe?: '24h' | '7d' | '30d'
  region?: string
  limit?: number
  minVolume?: number
}

export function useTrendingTopics(filters: TrendingTopicsFilters = {}) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['dashboard-trending-topics', filters],
    queryFn: async () => {
      const response = await trendsApi.getTrendingTopics(filters)
      
      // Transform the data to match our interface
      return {
        trends: response.trends.map((trend, index) => ({
          id: `${trend.keyword}-${index}`,
          title: trend.keyword,
          category: filters.category || 'General',
          trendScore: Math.round((trend.volume / 10000) * 100),
          competition: trend.competition,
          suggestedKeywords: trend.relatedKeywords,
          volume: trend.volume,
          difficulty: trend.difficulty < 30 ? 'easy' : trend.difficulty > 70 ? 'hard' : 'medium',
          opportunity: trend.volume > 10000 ? 'high' : trend.volume > 1000 ? 'medium' : 'low',
        })) as TrendingTopic[],
        totalResults: response.totalResults,
        lastUpdated: response.lastUpdated,
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 15 * 60 * 1000, // 15 minutes
  })

  const toggleTopicSelection = useCallback((topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    )
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedTopics([])
  }, [])

  const selectAll = useCallback(() => {
    if (data?.trends) {
      setSelectedTopics(data.trends.map(topic => topic.id))
    }
  }, [data])

  const getSelectedTopics = useCallback(() => {
    if (!data?.trends) return []
    return data.trends.filter(topic => selectedTopics.includes(topic.id))
  }, [data, selectedTopics])

  return {
    topics: data?.trends || [],
    isLoading,
    error: error?.message || null,
    lastUpdated: data?.lastUpdated || null,
    totalResults: data?.totalResults || 0,
    selectedTopics,
    toggleTopicSelection,
    clearSelection,
    selectAll,
    getSelectedTopics,
    hasSelection: selectedTopics.length > 0,
    refresh: refetch,
  }
}

/**
 * Hook for topic analysis
 */
export function useTopicAnalysis(topicId: string) {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['topic-analysis', topicId],
    queryFn: async () => {
      // In a real implementation, this would call a specific API
      // For now, we'll return mock data structure
      return {
        keyword: topicId,
        searchVolume: 0,
        trending: false,
        growth: 0,
        seasonality: [],
        demographics: {
          ageGroups: [],
          genders: [],
          regions: [],
        },
        relatedTopics: [],
        contentSuggestions: [],
      }
    },
    enabled: !!topicId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  })

  return {
    analysis: data,
    isLoading,
    error: error?.message || null,
  }
}

/**
 * Hook for topic recommendations based on user's content
 */
export function useTopicRecommendations(userId?: string) {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['topic-recommendations', userId],
    queryFn: async () => {
      // This would analyze user's content and suggest trending topics
      return {
        recommendations: [],
        based_on: 'user_content_analysis',
        confidence: 0,
      }
    },
    enabled: !!userId,
    staleTime: 60 * 60 * 1000, // 1 hour
  })

  return {
    recommendations: data?.recommendations || [],
    isLoading,
    error: error?.message || null,
    basedOn: data?.based_on,
    confidence: data?.confidence || 0,
  }
}

/**
 * Hook for trending topics by category
 */
export function useTrendingByCategory() {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['trending-by-category'],
    queryFn: async () => {
      const categories = ['Technology', 'Health', 'Business', 'Entertainment', 'Sports']
      const results = await Promise.all(
        categories.map(async (category) => {
          const response = await trendsApi.getTrendingTopics({ 
            category: category.toLowerCase(), 
            limit: 5 
          })
          return {
            category,
            trends: response.trends.slice(0, 5),
          }
        })
      )
      return results
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  })

  return {
    categoryTrends: data || [],
    isLoading,
    error: error?.message || null,
  }
}

/**
 * Hook for content gap analysis based on trending topics
 */
export function useContentGapAnalysis(selectedTopics: string[]) {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['content-gap-analysis', selectedTopics],
    queryFn: async () => {
      if (!selectedTopics.length) return { gaps: [] }
      
      const response = await trendsApi.findContentGaps({
        keywords: selectedTopics,
      })
      
      return {
        gaps: response.map(gap => ({
          ...gap,
          contentIdeas: [
            `How to leverage ${gap.keyword} for business growth`,
            `${gap.keyword} trends and predictions for 2024`,
            `Complete guide to ${gap.keyword}`,
          ],
        })),
      }
    },
    enabled: selectedTopics.length > 0,
    staleTime: 60 * 60 * 1000, // 1 hour
  })

  return {
    gaps: data?.gaps || [],
    isLoading,
    error: error?.message || null,
  }
}

export default useTrendingTopics