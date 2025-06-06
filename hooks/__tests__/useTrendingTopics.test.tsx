import { renderHook, act, waitFor } from '@testing-library/react'
import { useTrendingTopics } from '../useTrendingTopics'
import { trendsApi } from '@/lib/api/trendsApi'

// Mock dependencies
jest.mock('@/lib/api/trendsApi')

const mockTrendsApi = trendsApi as jest.Mocked<typeof trendsApi>

describe('useTrendingTopics', () => {
  const mockTopics = [
    { id: '1', topic: 'AI Revolution', count: 150, trend: 'up' as const, category: 'Technology' },
    { id: '2', topic: 'Climate Change', count: 120, trend: 'stable' as const, category: 'Environment' },
    { id: '3', topic: 'Remote Work', count: 80, trend: 'down' as const, category: 'Business' },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initial state', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useTrendingTopics())
      
      expect(result.current.topics).toEqual([])
      expect(result.current.selectedTopics).toEqual([])
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBeNull()
      expect(result.current.searchQuery).toBe('')
      expect(result.current.filteredTopics).toEqual([])
    })
  })

  describe('fetching topics', () => {
    it('should fetch trending topics on mount', async () => {
      mockTrendsApi.getTrendingTopics.mockResolvedValueOnce(mockTopics)

      const { result } = renderHook(() => useTrendingTopics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockTrendsApi.getTrendingTopics).toHaveBeenCalled()
      expect(result.current.topics).toEqual(mockTopics)
      expect(result.current.filteredTopics).toEqual(mockTopics)
    })

    it('should handle fetch errors', async () => {
      mockTrendsApi.getTrendingTopics.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useTrendingTopics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Network error')
      expect(result.current.topics).toEqual([])
    })

    it('should refetch topics', async () => {
      mockTrendsApi.getTrendingTopics
        .mockResolvedValueOnce(mockTopics)
        .mockResolvedValueOnce([...mockTopics, { 
          id: '4', 
          topic: 'New Topic', 
          count: 90, 
          trend: 'up' as const, 
          category: 'Tech' 
        }])

      const { result } = renderHook(() => useTrendingTopics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.topics).toHaveLength(3)

      await act(async () => {
        await result.current.refetch()
      })

      expect(result.current.topics).toHaveLength(4)
      expect(mockTrendsApi.getTrendingTopics).toHaveBeenCalledTimes(2)
    })
  })

  describe('topic selection', () => {
    it('should select a topic', async () => {
      mockTrendsApi.getTrendingTopics.mockResolvedValueOnce(mockTopics)

      const { result } = renderHook(() => useTrendingTopics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.selectTopic('1')
      })

      expect(result.current.selectedTopics).toEqual(['1'])
    })

    it('should deselect a selected topic', async () => {
      mockTrendsApi.getTrendingTopics.mockResolvedValueOnce(mockTopics)

      const { result } = renderHook(() => useTrendingTopics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.selectTopic('1')
      })

      expect(result.current.selectedTopics).toEqual(['1'])

      act(() => {
        result.current.selectTopic('1')
      })

      expect(result.current.selectedTopics).toEqual([])
    })

    it('should select multiple topics', async () => {
      mockTrendsApi.getTrendingTopics.mockResolvedValueOnce(mockTopics)

      const { result } = renderHook(() => useTrendingTopics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.selectTopic('1')
        result.current.selectTopic('2')
        result.current.selectTopic('3')
      })

      expect(result.current.selectedTopics).toEqual(['1', '2', '3'])
    })

    it('should clear all selections', async () => {
      mockTrendsApi.getTrendingTopics.mockResolvedValueOnce(mockTopics)

      const { result } = renderHook(() => useTrendingTopics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.selectTopic('1')
        result.current.selectTopic('2')
      })

      expect(result.current.selectedTopics).toEqual(['1', '2'])

      act(() => {
        result.current.clearSelections()
      })

      expect(result.current.selectedTopics).toEqual([])
    })
  })

  describe('search functionality', () => {
    it('should filter topics by search query', async () => {
      mockTrendsApi.getTrendingTopics.mockResolvedValueOnce(mockTopics)

      const { result } = renderHook(() => useTrendingTopics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.setSearchQuery('AI')
      })

      expect(result.current.searchQuery).toBe('AI')
      expect(result.current.filteredTopics).toEqual([
        { id: '1', topic: 'AI Revolution', count: 150, trend: 'up', category: 'Technology' }
      ])
    })

    it('should be case insensitive in search', async () => {
      mockTrendsApi.getTrendingTopics.mockResolvedValueOnce(mockTopics)

      const { result } = renderHook(() => useTrendingTopics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.setSearchQuery('climate')
      })

      expect(result.current.filteredTopics).toEqual([
        { id: '2', topic: 'Climate Change', count: 120, trend: 'stable', category: 'Environment' }
      ])
    })

    it('should return empty array for no matches', async () => {
      mockTrendsApi.getTrendingTopics.mockResolvedValueOnce(mockTopics)

      const { result } = renderHook(() => useTrendingTopics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.setSearchQuery('NonExistent')
      })

      expect(result.current.filteredTopics).toEqual([])
    })

    it('should search in category field too', async () => {
      mockTrendsApi.getTrendingTopics.mockResolvedValueOnce(mockTopics)

      const { result } = renderHook(() => useTrendingTopics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.setSearchQuery('Business')
      })

      expect(result.current.filteredTopics).toEqual([
        { id: '3', topic: 'Remote Work', count: 80, trend: 'down', category: 'Business' }
      ])
    })

    it('should clear search', async () => {
      mockTrendsApi.getTrendingTopics.mockResolvedValueOnce(mockTopics)

      const { result } = renderHook(() => useTrendingTopics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.setSearchQuery('AI')
      })

      expect(result.current.filteredTopics).toHaveLength(1)

      act(() => {
        result.current.setSearchQuery('')
      })

      expect(result.current.filteredTopics).toEqual(mockTopics)
    })
  })

  describe('getSelectedTopicDetails', () => {
    it('should return details of selected topics', async () => {
      mockTrendsApi.getTrendingTopics.mockResolvedValueOnce(mockTopics)

      const { result } = renderHook(() => useTrendingTopics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.selectTopic('1')
        result.current.selectTopic('3')
      })

      const details = result.current.getSelectedTopicDetails()

      expect(details).toEqual([
        { id: '1', topic: 'AI Revolution', count: 150, trend: 'up', category: 'Technology' },
        { id: '3', topic: 'Remote Work', count: 80, trend: 'down', category: 'Business' }
      ])
    })

    it('should return empty array when no topics selected', async () => {
      mockTrendsApi.getTrendingTopics.mockResolvedValueOnce(mockTopics)

      const { result } = renderHook(() => useTrendingTopics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const details = result.current.getSelectedTopicDetails()

      expect(details).toEqual([])
    })
  })

  describe('edge cases', () => {
    it('should handle empty topics array', async () => {
      mockTrendsApi.getTrendingTopics.mockResolvedValueOnce([])

      const { result } = renderHook(() => useTrendingTopics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.topics).toEqual([])
      expect(result.current.filteredTopics).toEqual([])
    })

    it('should handle selecting non-existent topic', async () => {
      mockTrendsApi.getTrendingTopics.mockResolvedValueOnce(mockTopics)

      const { result } = renderHook(() => useTrendingTopics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.selectTopic('non-existent')
      })

      expect(result.current.selectedTopics).toEqual(['non-existent'])
      expect(result.current.getSelectedTopicDetails()).toEqual([])
    })

    it('should maintain selections after refetch', async () => {
      mockTrendsApi.getTrendingTopics
        .mockResolvedValueOnce(mockTopics)
        .mockResolvedValueOnce(mockTopics)

      const { result } = renderHook(() => useTrendingTopics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.selectTopic('1')
        result.current.selectTopic('2')
      })

      await act(async () => {
        await result.current.refetch()
      })

      expect(result.current.selectedTopics).toEqual(['1', '2'])
    })

    it('should handle API returning topics with missing fields', async () => {
      const incompleteTopics = [
        { id: '1', topic: 'Topic without trend', count: 100, category: 'Tech' },
        { id: '2', topic: 'Topic without category', count: 50, trend: 'up' as const }
      ]

      mockTrendsApi.getTrendingTopics.mockResolvedValueOnce(incompleteTopics as any)

      const { result } = renderHook(() => useTrendingTopics())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.topics).toEqual(incompleteTopics)
    })
  })
})