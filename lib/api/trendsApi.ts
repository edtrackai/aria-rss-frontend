import { apiClient } from '../api'

export interface TrendData {
  id?: string;
  keyword: string
  topic?: string;
  title?: string;
  volume: number
  searchVolume: number;
  trend: 'rising' | 'steady' | 'declining' | 'up' | 'down' | 'stable';
  difficulty: 'low' | 'medium' | 'high';
  competition?: 'low' | 'medium' | 'high';
  trendScore?: number;
  score?: number;
  relatedKeywords: string[];
  relatedArticles?: number;
  suggestedKeywords?: string[];
  category?: string;
}

export interface TrendAnalysis {
  keyword: string
  searchVolume: number
  trending: boolean
  growth: number
  seasonality: Array<{
    month: number
    multiplier: number
  }>
  demographics: {
    ageGroups: Array<{ age: string; percentage: number }>
    genders: Array<{ gender: string; percentage: number }>
    regions: Array<{ region: string; percentage: number }>
  }
}

export interface CompetitorAnalysis {
  domain: string
  keywords: Array<{
    keyword: string
    position: number
    volume: number
    difficulty: number
  }>
  topPages: Array<{
    url: string
    title: string
    traffic: number
    keywords: number
  }>
  backlinks: number
  domainAuthority: number
}

export interface ContentGap {
  keyword: string
  opportunity: 'high' | 'medium' | 'low'
  volume: number
  difficulty: number
  competitors: string[]
  suggestedContentType: string
  estimatedTraffic: number
}

export interface TrendingTopicsResponse {
  trends: TrendData[]
  totalResults: number
  lastUpdated: string
}

export interface KeywordSuggestion {
  keyword: string
  volume: number
  difficulty: number
  relevance: number
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational'
}

export class TrendsApiService {
  /**
   * Get trending topics for a specific category
   */
  static async getTrendingTopics(params: {
    category?: string
    timeframe?: '24h' | '7d' | '30d' | '90d'
    region?: string
    limit?: number
    minVolume?: number
  } = {}): Promise<TrendingTopicsResponse> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })

    return await apiClient.get(`/api/v1/trends/topics?${searchParams}`)
  }

  /**
   * Analyze a specific keyword or topic
   */
  static async analyzeTrend(keyword: string, options: {
    includeRelated?: boolean
    includeDemographics?: boolean
    includeSeasonality?: boolean
    timeframe?: '30d' | '90d' | '12m' | '5y'
  } = {}): Promise<TrendAnalysis> {
    return await apiClient.post('/api/v1/trends/analyze', {
      keyword,
      ...options
    })
  }

  /**
   * Get keyword suggestions based on a seed keyword
   */
  static async getKeywordSuggestions(
    seedKeyword: string,
    options: {
      limit?: number
      includeQuestions?: boolean
      includeRelated?: boolean
      minVolume?: number
      maxDifficulty?: number
    } = {}
  ): Promise<KeywordSuggestion[]> {
    return await apiClient.post('/api/v1/trends/keywords', {
      seedKeyword,
      ...options
    })
  }

  /**
   * Perform competitor analysis
   */
  static async analyzeCompetitor(domain: string): Promise<CompetitorAnalysis> {
    return await apiClient.get(`/api/v1/trends/competitor/${encodeURIComponent(domain)}`)
  }

  /**
   * Find content gaps and opportunities
   */
  static async findContentGaps(params: {
    domain?: string
    competitors?: string[]
    keywords?: string[]
    category?: string
  }): Promise<ContentGap[]> {
    return await apiClient.post('/api/v1/trends/content-gaps', params)
  }

  /**
   * Get social media trends
   */
  static async getSocialTrends(platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'all', options: {
    timeframe?: '24h' | '7d' | '30d'
    region?: string
    category?: string
  } = {}): Promise<Array<{
    hashtag: string
    mentions: number
    engagement: number
    sentiment: 'positive' | 'negative' | 'neutral'
    trend: 'rising' | 'stable' | 'declining'
  }>> {
    const searchParams = new URLSearchParams({ platform })
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })

    return await apiClient.get(`/api/v1/trends/social?${searchParams}`)
  }

  /**
   * Get news trends and viral content
   */
  static async getNewsTrends(options: {
    category?: string
    timeframe?: '24h' | '7d' | '30d'
    region?: string
    limit?: number
  } = {}): Promise<Array<{
    title: string
    url: string
    source: string
    publishedAt: string
    engagement: number
    sentiment: number
    keywords: string[]
    summary: string
  }>> {
    const searchParams = new URLSearchParams()
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })

    return await apiClient.get(`/api/v1/trends/news?${searchParams}`)
  }

  /**
   * Track custom keywords over time
   */
  static async trackKeywords(keywords: string[]): Promise<{
    trackingId: string
    keywords: Array<{
      keyword: string
      currentVolume: number
      previousVolume: number
      change: number
      trend: 'up' | 'down' | 'stable'
    }>
  }> {
    return await apiClient.post('/api/v1/trends/track', { keywords })
  }

  /**
   * Get tracked keyword data
   */
  static async getTrackedKeywords(trackingId: string): Promise<{
    keywords: Array<{
      keyword: string
      history: Array<{
        date: string
        volume: number
        position?: number
      }>
    }>
  }> {
    return await apiClient.get(`/api/v1/trends/track/${trackingId}`)
  }

  /**
   * Search for trending hashtags
   */
  static async getTrendingHashtags(platform: string, options: {
    limit?: number
    category?: string
    region?: string
  } = {}): Promise<Array<{
    hashtag: string
    posts: number
    engagement: number
    reach: number
    trend: 'viral' | 'rising' | 'stable'
  }>> {
    const searchParams = new URLSearchParams({ platform })
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })

    return await apiClient.get(`/api/v1/trends/hashtags?${searchParams}`)
  }

  /**
   * Get seasonal trends and predictions
   */
  static async getSeasonalTrends(keyword: string): Promise<{
    keyword: string
    seasonalityScore: number
    peakMonths: number[]
    lowMonths: number[]
    yearOverYearGrowth: number
    predictions: Array<{
      month: number
      year: number
      predictedVolume: number
      confidence: number
    }>
  }> {
    return await apiClient.get(`/api/v1/trends/seasonal/${encodeURIComponent(keyword)}`)
  }

  /**
   * Alias for getTrendingTopics to match expected interface
   */
  static async getTrendingKeywords(params: {
    category?: string
    timeframe?: '24h' | '7d' | '30d' | '90d'
    region?: string
    limit?: number
    minVolume?: number
  } = {}): Promise<TrendingTopicsResponse> {
    return await this.getTrendingTopics(params)
  }
}

// Export instance for easier importing
export const trendsApi = TrendsApiService

export default TrendsApiService