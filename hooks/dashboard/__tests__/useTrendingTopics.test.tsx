import { renderHook, waitFor } from '@testing-library/react'
import { useTrendingTopics } from '../useTrendingTopics'
import { trendsApi } from '@/lib/api/trendsApi'

// Mock dependencies
jest.mock('@/lib/api/trendsApi')

const mockTrendsApi = trendsApi as jest.Mocked<typeof trendsApi>

describe('useTrendingTopics (Dashboard)', () => {
  const mockDashboardTopics = {
    trending: [
      {
        id: '1',
        topic: 'AI Revolution',
        category: 'Technology',
        articleCount: 45,
        viewCount: 12500,
        engagementRate: 8.5,
        growth: 125,
        relatedTopics: ['Machine Learning', 'GPT', 'Automation']
      },
      {
        id: '2',
        topic: 'Climate Summit 2024',
        category: 'Environment',
        articleCount: 32,
        viewCount: 8900,
        engagementRate: 6.2,
        growth: 45,
        relatedTopics: ['Sustainability', 'Carbon Neutral', 'Green Energy']
      },
      {
        id: '3',
        topic: 'Remote Work Trends',
        category: 'Business',
        articleCount: 28,
        viewCount: 7200,
        engagementRate: 5.8,
        growth: -10,
        relatedTopics: ['Digital Nomad', 'Work-Life Balance', 'Productivity']
      }
    ],
    categories: [
      { name: 'Technology', count: 120, percentage: 35 },
      { name: 'Environment', count: 80, percentage: 23 },
      { name: 'Business', count: 75, percentage: 22 },
      { name: 'Health', count: 45, percentage: 13 },
      { name: 'Other', count: 25, percentage: 7 }
    ],
    timeSeriesData: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'AI Revolution',
          data: [450, 520, 580, 610, 720, 680, 590]
        },
        {
          label: 'Climate Summit 2024',
          data: [320, 340, 380, 420, 510, 480, 390]
        }
      ]
    },
    insights: {
      hottestTopic: 'AI Revolution',
      fastestGrowing: 'Quantum Computing',
      mostEngaging: 'Celebrity Scandal',
      recommendation: 'Consider creating more AI-related content as it shows 125% growth'
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initial state', () => {
    it('should initialize with loading state', () => {
      mockTrendsApi.getDashboardTrends.mockResolvedValueOnce(mockDashboardTopics)
      
      const { result } = renderHook(() => useTrendingTopics())
      
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBeNull()
      expect(result.current.data).toBeNull()
    })
  })

  describe('fetching dashboard trends', () => {
    it('should fetch dashboard trending topics on mount', async () => {
      mockTrendsApi.getDashboardTrends.mockResolvedValueOnce(mockDashboardTopics)

      const { result } = renderHook(() => useTrendingTopics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockTrendsApi.getDashboardTrends).toHaveBeenCalledWith({ period: '7d' })
      expect(result.current.data).toEqual(mockDashboardTopics)
      expect(result.current.error).toBeNull()
    })

    it('should fetch trends for custom period', async () => {
      mockTrendsApi.getDashboardTrends.mockResolvedValueOnce(mockDashboardTopics)

      const { result } = renderHook(() => useTrendingTopics('30d'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockTrendsApi.getDashboardTrends).toHaveBeenCalledWith({ period: '30d' })
    })

    it('should handle fetch errors', async () => {
      mockTrendsApi.getDashboardTrends.mockRejectedValueOnce(new Error('Failed to fetch trends'))

      const { result } = renderHook(() => useTrendingTopics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Failed to fetch trends')
      expect(result.current.data).toBeNull()
    })

    it('should refresh trends on interval', async () => {
      jest.useFakeTimers()
      
      mockTrendsApi.getDashboardTrends
        .mockResolvedValueOnce(mockDashboardTopics)
        .mockResolvedValueOnce({
          ...mockDashboardTopics,
          trending: [
            ...mockDashboardTopics.trending,
            {
              id: '4',
              topic: 'Breaking News',
              category: 'News',
              articleCount: 15,
              viewCount: 5000,
              engagementRate: 9.2,
              growth: 200,
              relatedTopics: ['Latest', 'Updates']
            }
          ]
        })

      const { result } = renderHook(() => useTrendingTopics('7d', 5000)) // 5 second refresh

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data?.trending).toHaveLength(3)

      // Fast-forward 5 seconds
      jest.advanceTimersByTime(5000)

      await waitFor(() => {
        expect(mockTrendsApi.getDashboardTrends).toHaveBeenCalledTimes(2)
      })

      expect(result.current.data?.trending).toHaveLength(4)

      jest.useRealTimers()
    })
  })

  describe('computed values', () => {
    it('should identify top trending topic', async () => {
      mockTrendsApi.getDashboardTrends.mockResolvedValueOnce(mockDashboardTopics)

      const { result } = renderHook(() => useTrendingTopics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.topTrending).toEqual({
        id: '1',
        topic: 'AI Revolution',
        category: 'Technology',
        articleCount: 45,
        viewCount: 12500,
        engagementRate: 8.5,
        growth: 125,
        relatedTopics: ['Machine Learning', 'GPT', 'Automation']
      })
    })

    it('should handle empty trending list', async () => {
      mockTrendsApi.getDashboardTrends.mockResolvedValueOnce({
        ...mockDashboardTopics,
        trending: []
      })

      const { result } = renderHook(() => useTrendingTopics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.topTrending).toBeNull()
    })

    it('should identify fastest growing topics', async () => {
      mockTrendsApi.getDashboardTrends.mockResolvedValueOnce(mockDashboardTopics)

      const { result } = renderHook(() => useTrendingTopics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Topics with positive growth sorted by growth rate
      expect(result.current.fastestGrowing).toEqual([
        mockDashboardTopics.trending[0], // 125% growth
        mockDashboardTopics.trending[1]  // 45% growth
      ])
    })

    it('should identify declining topics', async () => {
      mockTrendsApi.getDashboardTrends.mockResolvedValueOnce(mockDashboardTopics)

      const { result } = renderHook(() => useTrendingTopics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Topics with negative growth
      expect(result.current.declining).toEqual([
        mockDashboardTopics.trending[2] // -10% growth
      ])
    })

    it('should calculate total engagement', async () => {
      mockTrendsApi.getDashboardTrends.mockResolvedValueOnce(mockDashboardTopics)

      const { result } = renderHook(() => useTrendingTopics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Total views across all trending topics
      const expectedTotal = 12500 + 8900 + 7200
      expect(result.current.totalEngagement).toBe(expectedTotal)
    })

    it('should get topics by category', async () => {
      mockTrendsApi.getDashboardTrends.mockResolvedValueOnce(mockDashboardTopics)

      const { result } = renderHook(() => useTrendingTopics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const techTopics = result.current.getTopicsByCategory('Technology')
      expect(techTopics).toEqual([mockDashboardTopics.trending[0]])

      const envTopics = result.current.getTopicsByCategory('Environment')
      expect(envTopics).toEqual([mockDashboardTopics.trending[1]])
    })

    it('should return empty array for non-existent category', async () => {
      mockTrendsApi.getDashboardTrends.mockResolvedValueOnce(mockDashboardTopics)

      const { result } = renderHook(() => useTrendingTopics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const topics = result.current.getTopicsByCategory('NonExistent')
      expect(topics).toEqual([])
    })
  })

  describe('period changes', () => {
    it('should refetch when period changes', async () => {
      mockTrendsApi.getDashboardTrends
        .mockResolvedValueOnce(mockDashboardTopics)
        .mockResolvedValueOnce({
          ...mockDashboardTopics,
          insights: {
            ...mockDashboardTopics.insights,
            hottestTopic: 'Climate Summit 2024'
          }
        })

      const { result, rerender } = renderHook(
        ({ period }) => useTrendingTopics(period),
        { initialProps: { period: '7d' } }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data?.insights.hottestTopic).toBe('AI Revolution')

      // Change period
      rerender({ period: '30d' })

      await waitFor(() => {
        expect(mockTrendsApi.getDashboardTrends).toHaveBeenCalledWith({ period: '30d' })
      })

      expect(result.current.data?.insights.hottestTopic).toBe('Climate Summit 2024')
    })
  })

  describe('edge cases', () => {
    it('should handle incomplete data structure', async () => {
      const incompleteData = {
        trending: mockDashboardTopics.trending
        // Missing other fields
      }

      mockTrendsApi.getDashboardTrends.mockResolvedValueOnce(incompleteData as any)

      const { result } = renderHook(() => useTrendingTopics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(incompleteData)
      expect(result.current.totalEngagement).toBeGreaterThan(0)
    })

    it('should handle API returning null', async () => {
      mockTrendsApi.getDashboardTrends.mockResolvedValueOnce(null as any)

      const { result } = renderHook(() => useTrendingTopics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toBeNull()
      expect(result.current.topTrending).toBeNull()
      expect(result.current.fastestGrowing).toEqual([])
      expect(result.current.declining).toEqual([])
      expect(result.current.totalEngagement).toBe(0)
    })

    it('should cleanup interval on unmount', async () => {
      jest.useFakeTimers()
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval')

      mockTrendsApi.getDashboardTrends.mockResolvedValueOnce(mockDashboardTopics)

      const { unmount } = renderHook(() => useTrendingTopics('7d', 5000))

      await waitFor(() => {
        expect(mockTrendsApi.getDashboardTrends).toHaveBeenCalled()
      })

      unmount()

      expect(clearIntervalSpy).toHaveBeenCalled()

      jest.useRealTimers()
    })

    it('should handle topics with missing fields', async () => {
      const dataWithIncompleteTopics = {
        ...mockDashboardTopics,
        trending: [
          {
            id: '1',
            topic: 'Incomplete Topic',
            category: 'Test',
            // Missing other fields
          },
          ...mockDashboardTopics.trending
        ]
      }

      mockTrendsApi.getDashboardTrends.mockResolvedValueOnce(dataWithIncompleteTopics as any)

      const { result } = renderHook(() => useTrendingTopics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data?.trending).toHaveLength(4)
      expect(result.current.totalEngagement).toBeDefined()
    })

    it('should handle all growth scenarios', async () => {
      const mixedGrowthData = {
        ...mockDashboardTopics,
        trending: [
          { ...mockDashboardTopics.trending[0], growth: 0 }, // No growth
          { ...mockDashboardTopics.trending[1], growth: 100 }, // High growth
          { ...mockDashboardTopics.trending[2], growth: -50 }, // High decline
          { ...mockDashboardTopics.trending[0], id: '4', growth: undefined } // Undefined growth
        ]
      }

      mockTrendsApi.getDashboardTrends.mockResolvedValueOnce(mixedGrowthData as any)

      const { result } = renderHook(() => useTrendingTopics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.fastestGrowing).toHaveLength(1) // Only positive growth
      expect(result.current.declining).toHaveLength(1) // Only negative growth
    })
  })
})