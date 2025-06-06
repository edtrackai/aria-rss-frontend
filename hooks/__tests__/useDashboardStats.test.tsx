import { renderHook, waitFor } from '@testing-library/react'
import { useDashboardStats } from '../useDashboardStats'
import { dashboardApi } from '@/lib/dashboard/dashboardApi'

// Mock dependencies
jest.mock('@/lib/dashboard/dashboardApi')

const mockDashboardApi = dashboardApi as jest.Mocked<typeof dashboardApi>

describe('useDashboardStats', () => {
  const mockStats = {
    articles: {
      total: 150,
      published: 120,
      draft: 25,
      scheduled: 5,
      trend: 15 // 15% increase
    },
    views: {
      total: 50000,
      today: 2500,
      week: 15000,
      month: 45000,
      trend: -5 // 5% decrease
    },
    engagement: {
      likes: 3200,
      comments: 850,
      shares: 420,
      avgReadTime: 4.5,
      trend: 8
    },
    revenue: {
      total: 12500,
      month: 3200,
      affiliateClicks: 8500,
      conversions: 342,
      trend: 22
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initial state', () => {
    it('should initialize with loading state', () => {
      mockDashboardApi.getStats.mockResolvedValueOnce(mockStats)
      
      const { result } = renderHook(() => useDashboardStats())
      
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBeNull()
      expect(result.current.stats).toBeNull()
    })
  })

  describe('fetching stats', () => {
    it('should fetch dashboard stats on mount', async () => {
      mockDashboardApi.getStats.mockResolvedValueOnce(mockStats)

      const { result } = renderHook(() => useDashboardStats())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockDashboardApi.getStats).toHaveBeenCalledWith('7d') // default period
      expect(result.current.stats).toEqual(mockStats)
      expect(result.current.error).toBeNull()
    })

    it('should fetch stats for custom period', async () => {
      mockDashboardApi.getStats.mockResolvedValueOnce(mockStats)

      const { result } = renderHook(() => useDashboardStats('30d'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockDashboardApi.getStats).toHaveBeenCalledWith('30d')
    })

    it('should handle fetch errors', async () => {
      mockDashboardApi.getStats.mockRejectedValueOnce(new Error('API Error'))

      const { result } = renderHook(() => useDashboardStats())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('API Error')
      expect(result.current.stats).toBeNull()
    })

    it('should refetch stats on interval', async () => {
      jest.useFakeTimers()
      
      mockDashboardApi.getStats
        .mockResolvedValueOnce(mockStats)
        .mockResolvedValueOnce({
          ...mockStats,
          views: { ...mockStats.views, today: 2600 }
        })

      const { result } = renderHook(() => useDashboardStats('7d', 5000)) // 5 second refresh

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockDashboardApi.getStats).toHaveBeenCalledTimes(1)

      // Fast-forward 5 seconds
      jest.advanceTimersByTime(5000)

      await waitFor(() => {
        expect(mockDashboardApi.getStats).toHaveBeenCalledTimes(2)
      })

      expect(result.current.stats?.views.today).toBe(2600)

      jest.useRealTimers()
    })
  })

  describe('computed values', () => {
    it('should calculate engagement rate', async () => {
      mockDashboardApi.getStats.mockResolvedValueOnce(mockStats)

      const { result } = renderHook(() => useDashboardStats())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Engagement rate = (likes + comments + shares) / views * 100
      const expectedRate = ((3200 + 850 + 420) / 50000) * 100
      expect(result.current.engagementRate).toBeCloseTo(expectedRate, 2)
    })

    it('should handle zero views for engagement rate', async () => {
      mockDashboardApi.getStats.mockResolvedValueOnce({
        ...mockStats,
        views: { ...mockStats.views, total: 0 }
      })

      const { result } = renderHook(() => useDashboardStats())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.engagementRate).toBe(0)
    })

    it('should calculate conversion rate', async () => {
      mockDashboardApi.getStats.mockResolvedValueOnce(mockStats)

      const { result } = renderHook(() => useDashboardStats())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Conversion rate = conversions / affiliateClicks * 100
      const expectedRate = (342 / 8500) * 100
      expect(result.current.conversionRate).toBeCloseTo(expectedRate, 2)
    })

    it('should handle zero clicks for conversion rate', async () => {
      mockDashboardApi.getStats.mockResolvedValueOnce({
        ...mockStats,
        revenue: { ...mockStats.revenue, affiliateClicks: 0 }
      })

      const { result } = renderHook(() => useDashboardStats())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.conversionRate).toBe(0)
    })

    it('should calculate publishing rate', async () => {
      mockDashboardApi.getStats.mockResolvedValueOnce(mockStats)

      const { result } = renderHook(() => useDashboardStats())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Publishing rate = published / total * 100
      const expectedRate = (120 / 150) * 100
      expect(result.current.publishingRate).toBeCloseTo(expectedRate, 2)
    })

    it('should handle zero articles for publishing rate', async () => {
      mockDashboardApi.getStats.mockResolvedValueOnce({
        ...mockStats,
        articles: { ...mockStats.articles, total: 0, published: 0 }
      })

      const { result } = renderHook(() => useDashboardStats())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.publishingRate).toBe(0)
    })
  })

  describe('period changes', () => {
    it('should refetch when period changes', async () => {
      mockDashboardApi.getStats
        .mockResolvedValueOnce(mockStats)
        .mockResolvedValueOnce({
          ...mockStats,
          views: { ...mockStats.views, month: 55000 }
        })

      const { result, rerender } = renderHook(
        ({ period }) => useDashboardStats(period),
        { initialProps: { period: '7d' } }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockDashboardApi.getStats).toHaveBeenCalledWith('7d')

      // Change period
      rerender({ period: '30d' })

      await waitFor(() => {
        expect(mockDashboardApi.getStats).toHaveBeenCalledWith('30d')
      })

      expect(result.current.stats?.views.month).toBe(55000)
    })
  })

  describe('edge cases', () => {
    it('should handle missing stats fields', async () => {
      const incompleteStats = {
        articles: mockStats.articles,
        views: mockStats.views
        // Missing engagement and revenue
      }

      mockDashboardApi.getStats.mockResolvedValueOnce(incompleteStats as any)

      const { result } = renderHook(() => useDashboardStats())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.stats).toEqual(incompleteStats)
      expect(result.current.engagementRate).toBe(0)
      expect(result.current.conversionRate).toBe(0)
    })

    it('should handle API returning null', async () => {
      mockDashboardApi.getStats.mockResolvedValueOnce(null as any)

      const { result } = renderHook(() => useDashboardStats())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.stats).toBeNull()
      expect(result.current.engagementRate).toBe(0)
      expect(result.current.conversionRate).toBe(0)
      expect(result.current.publishingRate).toBe(0)
    })

    it('should cleanup interval on unmount', async () => {
      jest.useFakeTimers()
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval')

      mockDashboardApi.getStats.mockResolvedValueOnce(mockStats)

      const { unmount } = renderHook(() => useDashboardStats('7d', 5000))

      await waitFor(() => {
        expect(mockDashboardApi.getStats).toHaveBeenCalled()
      })

      unmount()

      expect(clearIntervalSpy).toHaveBeenCalled()

      jest.useRealTimers()
    })

    it('should handle negative trends', async () => {
      const statsWithNegativeTrends = {
        ...mockStats,
        articles: { ...mockStats.articles, trend: -10 },
        views: { ...mockStats.views, trend: -15 },
        engagement: { ...mockStats.engagement, trend: -5 },
        revenue: { ...mockStats.revenue, trend: -20 }
      }

      mockDashboardApi.getStats.mockResolvedValueOnce(statsWithNegativeTrends)

      const { result } = renderHook(() => useDashboardStats())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.stats?.articles.trend).toBe(-10)
      expect(result.current.stats?.views.trend).toBe(-15)
      expect(result.current.stats?.engagement.trend).toBe(-5)
      expect(result.current.stats?.revenue.trend).toBe(-20)
    })
  })
})