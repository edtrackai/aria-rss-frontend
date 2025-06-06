import { renderHook, waitFor } from '@testing-library/react'
import { useRevenueData } from '../useRevenueData'
import { api } from '@/lib/api'

// Mock dependencies
jest.mock('@/lib/api')

const mockApi = api as jest.Mocked<typeof api>

describe('useRevenueData', () => {
  const mockRevenueData = {
    summary: {
      totalRevenue: 15000,
      monthlyRevenue: 3500,
      weeklyRevenue: 800,
      dailyRevenue: 120,
      growth: {
        monthly: 15.5,
        weekly: 8.2,
        daily: -2.3
      }
    },
    topProducts: [
      {
        id: '1',
        name: 'Premium Course',
        revenue: 5000,
        clicks: 1200,
        conversions: 85,
        conversionRate: 7.08
      },
      {
        id: '2',
        name: 'E-book Bundle',
        revenue: 3200,
        clicks: 2100,
        conversions: 120,
        conversionRate: 5.71
      }
    ],
    recentTransactions: [
      {
        id: 'tx-1',
        productName: 'Premium Course',
        amount: 199,
        commission: 39.8,
        date: '2024-01-15T10:30:00Z',
        status: 'completed'
      },
      {
        id: 'tx-2',
        productName: 'E-book Bundle',
        amount: 49,
        commission: 9.8,
        date: '2024-01-15T09:15:00Z',
        status: 'pending'
      }
    ],
    chartData: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Revenue',
          data: [120, 150, 180, 140, 200, 250, 180]
        },
        {
          label: 'Clicks',
          data: [320, 410, 380, 420, 510, 480, 390]
        }
      ]
    },
    affiliatePerformance: {
      amazon: {
        revenue: 8000,
        clicks: 12000,
        conversions: 320,
        averageCommission: 4.2
      },
      shareasale: {
        revenue: 4500,
        clicks: 8500,
        conversions: 180,
        averageCommission: 6.5
      },
      cj: {
        revenue: 2500,
        clicks: 5000,
        conversions: 95,
        averageCommission: 5.8
      }
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initial state', () => {
    it('should initialize with loading state', () => {
      mockApi.get.mockResolvedValueOnce({ data: mockRevenueData })
      
      const { result } = renderHook(() => useRevenueData())
      
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBeNull()
      expect(result.current.data).toBeNull()
    })
  })

  describe('fetching revenue data', () => {
    it('should fetch revenue data on mount', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockRevenueData })

      const { result } = renderHook(() => useRevenueData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockApi.get).toHaveBeenCalledWith('/revenue/dashboard', {
        params: { period: '30d' }
      })
      expect(result.current.data).toEqual(mockRevenueData)
      expect(result.current.error).toBeNull()
    })

    it('should fetch data for custom period', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockRevenueData })

      const { result } = renderHook(() => useRevenueData('7d'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockApi.get).toHaveBeenCalledWith('/revenue/dashboard', {
        params: { period: '7d' }
      })
    })

    it('should handle fetch errors', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Failed to fetch revenue data'))

      const { result } = renderHook(() => useRevenueData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Failed to fetch revenue data')
      expect(result.current.data).toBeNull()
    })

    it('should refetch on interval', async () => {
      jest.useFakeTimers()
      
      mockApi.get
        .mockResolvedValueOnce({ data: mockRevenueData })
        .mockResolvedValueOnce({ 
          data: {
            ...mockRevenueData,
            summary: { ...mockRevenueData.summary, dailyRevenue: 150 }
          }
        })

      const { result } = renderHook(() => useRevenueData('30d', 5000)) // 5 second refresh

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data?.summary.dailyRevenue).toBe(120)

      // Fast-forward 5 seconds
      jest.advanceTimersByTime(5000)

      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledTimes(2)
      })

      expect(result.current.data?.summary.dailyRevenue).toBe(150)

      jest.useRealTimers()
    })
  })

  describe('computed values', () => {
    it('should calculate total conversion rate', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockRevenueData })

      const { result } = renderHook(() => useRevenueData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Total conversions = 85 + 120 = 205
      // Total clicks = 1200 + 2100 = 3300
      // Conversion rate = 205 / 3300 * 100 = 6.21%
      expect(result.current.totalConversionRate).toBeCloseTo(6.21, 2)
    })

    it('should handle zero clicks for conversion rate', async () => {
      const dataWithNoClicks = {
        ...mockRevenueData,
        topProducts: [
          { id: '1', name: 'Product', revenue: 100, clicks: 0, conversions: 0, conversionRate: 0 }
        ]
      }

      mockApi.get.mockResolvedValueOnce({ data: dataWithNoClicks })

      const { result } = renderHook(() => useRevenueData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.totalConversionRate).toBe(0)
    })

    it('should calculate average order value', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockRevenueData })

      const { result } = renderHook(() => useRevenueData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Total revenue = 15000
      // Total conversions = 85 + 120 = 205
      // AOV = 15000 / 205 = 73.17
      expect(result.current.averageOrderValue).toBeCloseTo(73.17, 2)
    })

    it('should handle zero conversions for AOV', async () => {
      const dataWithNoConversions = {
        ...mockRevenueData,
        summary: { ...mockRevenueData.summary, totalRevenue: 1000 },
        topProducts: []
      }

      mockApi.get.mockResolvedValueOnce({ data: dataWithNoConversions })

      const { result } = renderHook(() => useRevenueData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.averageOrderValue).toBe(0)
    })

    it('should identify best performing affiliate', async () => {
      mockApi.get.mockResolvedValueOnce({ data: mockRevenueData })

      const { result } = renderHook(() => useRevenueData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.bestPerformingAffiliate).toBe('amazon')
    })

    it('should handle missing affiliate data', async () => {
      const dataWithoutAffiliates = {
        ...mockRevenueData,
        affiliatePerformance: {}
      }

      mockApi.get.mockResolvedValueOnce({ data: dataWithoutAffiliates })

      const { result } = renderHook(() => useRevenueData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.bestPerformingAffiliate).toBeNull()
    })
  })

  describe('period changes', () => {
    it('should refetch when period changes', async () => {
      mockApi.get
        .mockResolvedValueOnce({ data: mockRevenueData })
        .mockResolvedValueOnce({
          data: {
            ...mockRevenueData,
            summary: { ...mockRevenueData.summary, weeklyRevenue: 1000 }
          }
        })

      const { result, rerender } = renderHook(
        ({ period }) => useRevenueData(period),
        { initialProps: { period: '30d' } }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockApi.get).toHaveBeenCalledWith('/revenue/dashboard', {
        params: { period: '30d' }
      })

      // Change period
      rerender({ period: '7d' })

      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith('/revenue/dashboard', {
          params: { period: '7d' }
        })
      })

      expect(result.current.data?.summary.weeklyRevenue).toBe(1000)
    })
  })

  describe('edge cases', () => {
    it('should handle incomplete data structure', async () => {
      const incompleteData = {
        summary: mockRevenueData.summary
        // Missing other fields
      }

      mockApi.get.mockResolvedValueOnce({ data: incompleteData })

      const { result } = renderHook(() => useRevenueData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(incompleteData)
      expect(result.current.totalConversionRate).toBe(0)
      expect(result.current.averageOrderValue).toBe(0)
    })

    it('should handle API returning null', async () => {
      mockApi.get.mockResolvedValueOnce({ data: null })

      const { result } = renderHook(() => useRevenueData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toBeNull()
      expect(result.current.totalConversionRate).toBe(0)
      expect(result.current.averageOrderValue).toBe(0)
      expect(result.current.bestPerformingAffiliate).toBeNull()
    })

    it('should cleanup interval on unmount', async () => {
      jest.useFakeTimers()
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval')

      mockApi.get.mockResolvedValueOnce({ data: mockRevenueData })

      const { unmount } = renderHook(() => useRevenueData('30d', 5000))

      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalled()
      })

      unmount()

      expect(clearIntervalSpy).toHaveBeenCalled()

      jest.useRealTimers()
    })

    it('should handle network errors gracefully', async () => {
      mockApi.get.mockRejectedValueOnce({
        response: { data: { message: 'Unauthorized' } }
      })

      const { result } = renderHook(() => useRevenueData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Unauthorized')
    })

    it('should handle transactions with different statuses', async () => {
      const dataWithMixedStatuses = {
        ...mockRevenueData,
        recentTransactions: [
          { ...mockRevenueData.recentTransactions[0], status: 'completed' },
          { ...mockRevenueData.recentTransactions[1], status: 'pending' },
          { id: 'tx-3', productName: 'Test', amount: 100, commission: 20, date: '2024-01-15', status: 'failed' }
        ]
      }

      mockApi.get.mockResolvedValueOnce({ data: dataWithMixedStatuses })

      const { result } = renderHook(() => useRevenueData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const transactions = result.current.data?.recentTransactions || []
      expect(transactions).toHaveLength(3)
      expect(transactions.filter(t => t.status === 'completed')).toHaveLength(1)
      expect(transactions.filter(t => t.status === 'pending')).toHaveLength(1)
      expect(transactions.filter(t => t.status === 'failed')).toHaveLength(1)
    })
  })
})