import { DashboardApiService, ActivityItem, Article, DashboardOverview } from '../dashboardApi'
import { apiClient } from '../../api'

// Mock the API client
jest.mock('../../api', () => ({
  apiClient: {
    get: jest.fn(),
  },
}))

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

// Mock fetch for export functionality
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

// Mock localStorage for auth token
const mockLocalStorage = {
  getItem: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

describe('DashboardApiService', () => {
  const mockUser = {
    id: 'user123',
    name: 'John Doe',
    avatar: 'https://example.com/avatar.jpg',
  }

  const mockArticle: Article = {
    id: 'article123',
    title: 'Test Article',
    status: 'published',
    author: mockUser,
    publishedAt: '2023-06-01T10:00:00Z',
    views: 1500,
    revenue: 125.50,
    excerpt: 'This is a test article excerpt.',
  }

  const mockActivity: ActivityItem = {
    id: 'activity123',
    type: 'article_published',
    title: 'Article Published',
    description: 'New article was published',
    timestamp: '2023-06-01T10:00:00Z',
    metadata: {
      articleId: 'article123',
      amount: 125.50,
    },
  }

  const mockOverview: DashboardOverview = {
    stats: {
      totalArticles: 50,
      publishedArticles: 45,
      totalViews: 150000,
      totalRevenue: 5000.00,
      monthlyGrowth: {
        articles: 12.5,
        views: 8.3,
        revenue: 15.2,
      },
    },
    recentActivity: [mockActivity],
    recentArticles: [mockArticle],
    topPerformingArticles: [mockArticle],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue('test-auth-token')
  })

  describe('getOverview', () => {
    it('should fetch dashboard overview successfully', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockOverview)

      const result = await DashboardApiService.getOverview()

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/dashboard/overview')
      expect(result).toEqual(mockOverview)
    })

    it('should handle API errors', async () => {
      const error = new Error('API Error')
      mockApiClient.get.mockRejectedValueOnce(error)

      await expect(DashboardApiService.getOverview()).rejects.toThrow('API Error')
    })
  })

  describe('getActivity', () => {
    const mockActivityResponse = {
      items: [mockActivity],
      total: 10,
      hasMore: true,
    }

    it('should fetch activity with default parameters', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockActivityResponse)

      const result = await DashboardApiService.getActivity()

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/dashboard/activity?')
      expect(result).toEqual(mockActivityResponse)
    })

    it('should fetch activity with limit and offset', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockActivityResponse)

      await DashboardApiService.getActivity({ limit: 10, offset: 20 })

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/dashboard/activity?limit=10&offset=20')
    })

    it('should fetch activity with type filters', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockActivityResponse)

      await DashboardApiService.getActivity({ types: ['article_published', 'revenue_earned'] })

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/api/v1/dashboard/activity?types=article_published&types=revenue_earned'
      )
    })

    it('should handle multiple parameters', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockActivityResponse)

      await DashboardApiService.getActivity({
        limit: 5,
        offset: 10,
        types: ['comment_added'],
      })

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/api/v1/dashboard/activity?limit=5&offset=10&types=comment_added'
      )
    })

    it('should ignore undefined parameters', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockActivityResponse)

      await DashboardApiService.getActivity({ limit: 10, offset: undefined })

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/dashboard/activity?limit=10')
    })
  })

  describe('getRecentArticles', () => {
    const mockArticlesResponse = {
      articles: [mockArticle],
      total: 5,
    }

    it('should fetch recent articles with default parameters', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockArticlesResponse)

      const result = await DashboardApiService.getRecentArticles()

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/dashboard/articles/recent?')
      expect(result).toEqual(mockArticlesResponse)
    })

    it('should fetch recent articles with filters', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockArticlesResponse)

      await DashboardApiService.getRecentArticles({
        limit: 10,
        status: 'published',
        authorId: 'author123',
      })

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/api/v1/dashboard/articles/recent?limit=10&status=published&authorId=author123'
      )
    })

    it('should handle different status values', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockArticlesResponse)

      await DashboardApiService.getRecentArticles({ status: 'draft' })
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/dashboard/articles/recent?status=draft')

      await DashboardApiService.getRecentArticles({ status: 'archived' })
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/dashboard/articles/recent?status=archived')
    })
  })

  describe('getTopPerformingArticles', () => {
    it('should fetch top performing articles with default parameters', async () => {
      mockApiClient.get.mockResolvedValueOnce([mockArticle])

      const result = await DashboardApiService.getTopPerformingArticles()

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/dashboard/articles/top?')
      expect(result).toEqual([mockArticle])
    })

    it('should fetch top performing articles with filters', async () => {
      mockApiClient.get.mockResolvedValueOnce([mockArticle])

      await DashboardApiService.getTopPerformingArticles({
        limit: 5,
        period: '30d',
        metric: 'revenue',
      })

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/api/v1/dashboard/articles/top?limit=5&period=30d&metric=revenue'
      )
    })

    it('should handle different metrics', async () => {
      mockApiClient.get.mockResolvedValueOnce([mockArticle])

      await DashboardApiService.getTopPerformingArticles({ metric: 'views' })
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/dashboard/articles/top?metric=views')

      await DashboardApiService.getTopPerformingArticles({ metric: 'engagement' })
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/dashboard/articles/top?metric=engagement')
    })
  })

  describe('getStats', () => {
    const mockStatsResponse = {
      current: {
        articles: 50,
        views: 150000,
        revenue: 5000,
        clicks: 2500,
        conversions: 125,
      },
      previous: {
        articles: 45,
        views: 140000,
        revenue: 4500,
        clicks: 2300,
        conversions: 115,
      },
      growth: {
        articles: 11.1,
        views: 7.1,
        revenue: 11.1,
        clicks: 8.7,
        conversions: 8.7,
      },
    }

    it('should fetch stats with default parameters', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockStatsResponse)

      const result = await DashboardApiService.getStats()

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/dashboard/stats?')
      expect(result).toEqual(mockStatsResponse)
    })

    it('should fetch stats with period and comparison', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockStatsResponse)

      await DashboardApiService.getStats({
        period: '30d',
        compareWith: '30d',
      })

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/api/v1/dashboard/stats?period=30d&compareWith=30d'
      )
    })

    it('should handle different time periods', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockStatsResponse)

      await DashboardApiService.getStats({ period: '7d' })
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/dashboard/stats?period=7d')

      await DashboardApiService.getStats({ period: '1y' })
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/dashboard/stats?period=1y')
    })
  })

  describe('getRevenueAnalytics', () => {
    const mockRevenueResponse = {
      totalRevenue: 10000,
      chartData: [
        { date: '2023-06-01', revenue: 100, clicks: 50, conversions: 5 },
        { date: '2023-06-02', revenue: 150, clicks: 75, conversions: 7 },
      ],
      topProducts: [
        { id: 'prod1', name: 'Product 1', revenue: 500, clicks: 250, conversions: 25 },
      ],
      affiliateBreakdown: [
        { network: 'Amazon', revenue: 6000, percentage: 60 },
        { network: 'ShareASale', revenue: 4000, percentage: 40 },
      ],
    }

    it('should fetch revenue analytics with default parameters', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockRevenueResponse)

      const result = await DashboardApiService.getRevenueAnalytics()

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/dashboard/revenue/analytics?')
      expect(result).toEqual(mockRevenueResponse)
    })

    it('should fetch revenue analytics with period and granularity', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockRevenueResponse)

      await DashboardApiService.getRevenueAnalytics({
        period: '90d',
        granularity: 'week',
      })

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/api/v1/dashboard/revenue/analytics?period=90d&granularity=week'
      )
    })

    it('should handle different granularities', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockRevenueResponse)

      await DashboardApiService.getRevenueAnalytics({ granularity: 'month' })
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/dashboard/revenue/analytics?granularity=month')
    })
  })

  describe('getContentMetrics', () => {
    const mockContentMetrics = {
      views: 5000,
      uniqueViews: 4500,
      avgTimeOnPage: 180,
      bounceRate: 35.5,
      socialShares: 125,
      comments: 45,
      revenue: 500,
      clicks: 250,
      conversions: 25,
      topReferrers: [
        { source: 'Google', visits: 2000, percentage: 40 },
        { source: 'Facebook', visits: 1500, percentage: 30 },
      ],
      deviceBreakdown: [
        { device: 'Desktop', visits: 3000, percentage: 60 },
        { device: 'Mobile', visits: 2000, percentage: 40 },
      ],
    }

    it('should fetch content metrics with default parameters', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockContentMetrics)

      const result = await DashboardApiService.getContentMetrics()

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/dashboard/content/metrics?')
      expect(result).toEqual(mockContentMetrics)
    })

    it('should fetch content metrics for specific article', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockContentMetrics)

      await DashboardApiService.getContentMetrics({
        articleId: 'article123',
        period: '30d',
      })

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/api/v1/dashboard/content/metrics?articleId=article123&period=30d'
      )
    })
  })

  describe('getEngagementMetrics', () => {
    const mockEngagementMetrics = {
      totalUsers: 10000,
      activeUsers: 2500,
      newUsers: 500,
      returningUsers: 2000,
      avgSessionDuration: 240,
      pagesPerSession: 3.5,
      userRetention: [
        { day: 1, percentage: 85 },
        { day: 7, percentage: 45 },
        { day: 30, percentage: 25 },
      ],
      topPages: [
        { path: '/article/popular', views: 5000, uniqueViews: 4500 },
        { path: '/category/tech', views: 3000, uniqueViews: 2800 },
      ],
    }

    it('should fetch engagement metrics with default parameters', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockEngagementMetrics)

      const result = await DashboardApiService.getEngagementMetrics()

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/dashboard/engagement?')
      expect(result).toEqual(mockEngagementMetrics)
    })

    it('should fetch engagement metrics with period filter', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockEngagementMetrics)

      await DashboardApiService.getEngagementMetrics({ period: '90d' })

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/dashboard/engagement?period=90d')
    })
  })

  describe('exportData', () => {
    beforeEach(() => {
      mockFetch.mockClear()
      process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com'
    })

    it('should export data successfully', async () => {
      const mockBlob = new Blob(['csv data'], { type: 'text/csv' })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      } as Response)

      const result = await DashboardApiService.exportData({
        type: 'csv',
        section: 'overview',
        period: '30d',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/dashboard/export?type=csv&section=overview&period=30d',
        {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer test-auth-token',
          },
        }
      )
      expect(result).toBe(mockBlob)
    })

    it('should handle different export types', async () => {
      const mockBlob = new Blob(['json data'], { type: 'application/json' })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      } as Response)

      await DashboardApiService.exportData({
        type: 'json',
        section: 'articles',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('type=json&section=articles'),
        expect.any(Object)
      )
    })

    it('should handle export failures', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response)

      await expect(DashboardApiService.exportData({
        type: 'pdf',
        section: 'revenue',
      })).rejects.toThrow('Export failed')
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(DashboardApiService.exportData({
        type: 'csv',
        section: 'overview',
      })).rejects.toThrow('Network error')
    })

    it('should include auth token from localStorage', async () => {
      mockLocalStorage.getItem.mockReturnValue('custom-token')
      
      const mockBlob = new Blob(['data'], { type: 'text/csv' })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      } as Response)

      await DashboardApiService.exportData({
        type: 'csv',
        section: 'overview',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer custom-token',
          },
        })
      )
    })
  })

  describe('URL parameter handling', () => {
    it('should handle empty parameters object', async () => {
      mockApiClient.get.mockResolvedValueOnce([])

      await DashboardApiService.getTopPerformingArticles({})

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/dashboard/articles/top?')
    })

    it('should handle mixed parameter types', async () => {
      mockApiClient.get.mockResolvedValueOnce({ items: [], total: 0, hasMore: false })

      await DashboardApiService.getActivity({
        limit: 10,
        offset: 0,
        types: ['article_published', 'revenue_earned'],
      })

      const expectedUrl = '/api/v1/dashboard/activity?limit=10&offset=0&types=article_published&types=revenue_earned'
      expect(mockApiClient.get).toHaveBeenCalledWith(expectedUrl)
    })

    it('should ignore null and undefined values', async () => {
      mockApiClient.get.mockResolvedValueOnce([])

      await DashboardApiService.getTopPerformingArticles({
        limit: 5,
        period: undefined,
        metric: null as any,
      })

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/dashboard/articles/top?limit=5')
    })
  })

  describe('error handling', () => {
    it('should propagate API errors', async () => {
      const apiError = new Error('API Error: 404 Not Found')
      mockApiClient.get.mockRejectedValueOnce(apiError)

      await expect(DashboardApiService.getOverview()).rejects.toThrow('API Error: 404 Not Found')
    })

    it('should handle network timeouts', async () => {
      const timeoutError = new Error('Network timeout')
      mockApiClient.get.mockRejectedValueOnce(timeoutError)

      await expect(DashboardApiService.getStats()).rejects.toThrow('Network timeout')
    })

    it('should handle malformed responses', async () => {
      mockApiClient.get.mockResolvedValueOnce(null)

      const result = await DashboardApiService.getOverview()
      expect(result).toBeNull()
    })
  })

  describe('type safety', () => {
    it('should enforce ActivityItem interface', () => {
      const activity: ActivityItem = {
        id: 'test',
        type: 'user_registered',
        title: 'User Registered',
        description: 'New user signed up',
        timestamp: '2023-06-01T10:00:00Z',
        metadata: {
          userId: 'user123',
          referral: 'google',
        },
      }

      expect(activity.type).toBe('user_registered')
      expect(activity.metadata?.userId).toBe('user123')
    })

    it('should enforce Article interface', () => {
      const article: Article = {
        id: 'test',
        title: 'Test Article',
        status: 'draft',
        author: {
          id: 'author1',
          name: 'Author Name',
        },
        views: 0,
        revenue: 0,
      }

      expect(article.status).toBe('draft')
      expect(article.author.name).toBe('Author Name')
    })
  })
})