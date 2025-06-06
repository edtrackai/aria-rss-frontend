import { apiClient } from '../api'

export interface ActivityItem {
  id: string
  type: 'article_published' | 'comment_added' | 'revenue_earned' | 'user_registered'
  title: string
  description: string
  timestamp: string
  metadata?: {
    articleId?: string
    userId?: string
    amount?: number
    [key: string]: any
  }
}

export interface Article {
  id: string
  title: string
  status: 'draft' | 'published' | 'archived'
  author: {
    id: string
    name: string
    avatar?: string
  }
  publishedAt?: string
  views: number
  revenue: number
  excerpt?: string
}

export interface DashboardOverview {
  stats: {
    totalArticles: number
    publishedArticles: number
    totalViews: number
    totalRevenue: number
    monthlyGrowth: {
      articles: number
      views: number
      revenue: number
    }
  }
  recentActivity: ActivityItem[]
  recentArticles: Article[]
  topPerformingArticles: Article[]
}

export class DashboardApiService {
  /**
   * Get dashboard overview data
   */
  static async getOverview(): Promise<DashboardOverview> {
    return await apiClient.get('/api/v1/dashboard/overview')
  }

  /**
   * Get recent activity feed
   */
  static async getActivity(params: {
    limit?: number
    offset?: number
    types?: string[]
  } = {}): Promise<{
    items: ActivityItem[]
    total: number
    hasMore: boolean
  }> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v))
        } else {
          searchParams.append(key, String(value))
        }
      }
    })

    return await apiClient.get(`/api/v1/dashboard/activity?${searchParams}`)
  }

  /**
   * Get recent articles
   */
  static async getRecentArticles(params: {
    limit?: number
    status?: 'draft' | 'published' | 'archived'
    authorId?: string
  } = {}): Promise<{
    articles: Article[]
    total: number
  }> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })

    return await apiClient.get(`/api/v1/dashboard/articles/recent?${searchParams}`)
  }

  /**
   * Get top performing articles
   */
  static async getTopPerformingArticles(params: {
    limit?: number
    period?: '7d' | '30d' | '90d'
    metric?: 'views' | 'revenue' | 'engagement'
  } = {}): Promise<Article[]> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })

    return await apiClient.get(`/api/v1/dashboard/articles/top?${searchParams}`)
  }

  /**
   * Get dashboard statistics
   */
  static async getStats(params: {
    period?: '7d' | '30d' | '90d' | '1y'
    compareWith?: '7d' | '30d' | '90d' | '1y'
  } = {}): Promise<{
    current: {
      articles: number
      views: number
      revenue: number
      clicks: number
      conversions: number
    }
    previous?: {
      articles: number
      views: number
      revenue: number
      clicks: number
      conversions: number
    }
    growth?: {
      articles: number
      views: number
      revenue: number
      clicks: number
      conversions: number
    }
  }> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })

    return await apiClient.get(`/api/v1/dashboard/stats?${searchParams}`)
  }

  /**
   * Get revenue analytics
   */
  static async getRevenueAnalytics(params: {
    period?: '7d' | '30d' | '90d' | '1y'
    granularity?: 'day' | 'week' | 'month'
  } = {}): Promise<{
    totalRevenue: number
    chartData: Array<{
      date: string
      revenue: number
      clicks: number
      conversions: number
    }>
    topProducts: Array<{
      id: string
      name: string
      revenue: number
      clicks: number
      conversions: number
    }>
    affiliateBreakdown: Array<{
      network: string
      revenue: number
      percentage: number
    }>
  }> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })

    return await apiClient.get(`/api/v1/dashboard/revenue/analytics?${searchParams}`)
  }

  /**
   * Get content performance metrics
   */
  static async getContentMetrics(params: {
    articleId?: string
    period?: '7d' | '30d' | '90d'
  } = {}): Promise<{
    views: number
    uniqueViews: number
    avgTimeOnPage: number
    bounceRate: number
    socialShares: number
    comments: number
    revenue: number
    clicks: number
    conversions: number
    topReferrers: Array<{
      source: string
      visits: number
      percentage: number
    }>
    deviceBreakdown: Array<{
      device: string
      visits: number
      percentage: number
    }>
  }> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })

    return await apiClient.get(`/api/v1/dashboard/content/metrics?${searchParams}`)
  }

  /**
   * Get user engagement metrics
   */
  static async getEngagementMetrics(params: {
    period?: '7d' | '30d' | '90d'
  } = {}): Promise<{
    totalUsers: number
    activeUsers: number
    newUsers: number
    returningUsers: number
    avgSessionDuration: number
    pagesPerSession: number
    userRetention: Array<{
      day: number
      percentage: number
    }>
    topPages: Array<{
      path: string
      views: number
      uniqueViews: number
    }>
  }> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })

    return await apiClient.get(`/api/v1/dashboard/engagement?${searchParams}`)
  }

  /**
   * Export dashboard data
   */
  static async exportData(params: {
    type: 'csv' | 'json' | 'pdf'
    section: 'overview' | 'articles' | 'revenue' | 'analytics'
    period?: '7d' | '30d' | '90d' | '1y'
  }): Promise<Blob> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/dashboard/export?${searchParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    })

    if (!response.ok) {
      throw new Error('Export failed')
    }

    return await response.blob()
  }
}

// Named export for compatibility
export const dashboardApi = {
  getStats: DashboardApiService.getStats,
  getRevenue: DashboardApiService.getRevenue,
  getActivity: async () => {
    const stats = await DashboardApiService.getStats()
    return {
      recentActivity: stats.recentActivity || []
    }
  },
  getRecentActivity: async (params?: { limit?: number }) => {
    const stats = await DashboardApiService.getStats()
    const activities = stats.recentActivity || []
    const limit = params?.limit || 10
    return {
      items: activities.slice(0, limit).map((activity: any, index: number) => ({
        id: activity.id || `activity-${index}`,
        type: activity.type || 'article_published',
        title: activity.title || 'Unknown Activity',
        description: activity.description || '',
        timestamp: activity.timestamp || new Date().toISOString(),
        user: activity.user || { name: 'System', avatar: '' },
        metadata: activity.metadata || {}
      }))
    }
  },
  getRecentArticles: async () => {
    const stats = await DashboardApiService.getStats()
    return {
      articles: stats.topPerformingArticles?.map((article: any) => ({
        ...article,
        publishedAt: new Date().toISOString(),
        status: 'published' as const
      })) || []
    }
  }
}

export default DashboardApiService