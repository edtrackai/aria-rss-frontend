import { renderHook, act, waitFor } from '@testing-library/react'
import { useAIGeneration } from '../useAIGeneration'
import { aiApi } from '@/lib/api/aiApi'

// Mock dependencies
jest.mock('@/lib/api/aiApi')

const mockAiApi = aiApi as jest.Mocked<typeof aiApi>

describe('useAIGeneration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initial state', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useAIGeneration())
      
      expect(result.current.isGenerating).toBe(false)
      expect(result.current.progress).toBe(0)
      expect(result.current.streamedContent).toBe('')
      expect(result.current.error).toBeNull()
      expect(result.current.metadata).toBeNull()
    })
  })

  describe('generateContent', () => {
    it('should successfully generate content with streaming', async () => {
      const mockTemplate = {
        topic: 'AI in Healthcare',
        style: 'informative' as const,
        tone: 'professional' as const,
        targetAudience: 'Medical professionals',
        keywords: ['AI', 'healthcare']
      }

      const mockResponse = {
        content: 'Generated article content',
        title: 'AI Revolutionizing Healthcare',
        metaDescription: 'Discover how AI is transforming healthcare',
        slug: 'ai-revolutionizing-healthcare',
        readingTime: 5,
        wordCount: 1200
      }

      mockAiApi.generateArticle.mockResolvedValueOnce(mockResponse)

      const { result } = renderHook(() => useAIGeneration())
      
      let generatedContent: any
      await act(async () => {
        generatedContent = await result.current.generateContent(mockTemplate)
      })

      expect(mockAiApi.generateArticle).toHaveBeenCalledWith(mockTemplate)
      expect(generatedContent).toEqual(mockResponse)
      expect(result.current.isGenerating).toBe(false)
      expect(result.current.progress).toBe(100)
      expect(result.current.error).toBeNull()
      expect(result.current.metadata).toEqual({
        readingTime: 5,
        wordCount: 1200
      })
    })

    it('should handle generation errors', async () => {
      const mockTemplate = {
        topic: 'Test Topic',
        style: 'informative' as const,
        tone: 'professional' as const,
        targetAudience: 'General',
        keywords: []
      }

      const mockError = new Error('AI service unavailable')
      mockAiApi.generateArticle.mockRejectedValueOnce(mockError)

      const { result } = renderHook(() => useAIGeneration())
      
      await act(async () => {
        try {
          await result.current.generateContent(mockTemplate)
        } catch (error) {
          // Expected to throw
        }
      })

      expect(result.current.isGenerating).toBe(false)
      expect(result.current.error).toBe('AI service unavailable')
      expect(result.current.progress).toBe(0)
    })

    it('should validate topic before generation', async () => {
      const invalidTemplate = {
        topic: '', // Empty topic
        style: 'informative' as const,
        tone: 'professional' as const,
        targetAudience: 'General',
        keywords: []
      }

      const { result } = renderHook(() => useAIGeneration())
      
      await act(async () => {
        try {
          await result.current.generateContent(invalidTemplate)
        } catch (error: any) {
          expect(error.message).toBe('Topic is required')
        }
      })

      expect(mockAiApi.generateArticle).not.toHaveBeenCalled()
      expect(result.current.error).toBe('Topic is required')
    })

    it('should handle streaming progress updates', async () => {
      const mockTemplate = {
        topic: 'Streaming Test',
        style: 'tutorial' as const,
        tone: 'casual' as const,
        targetAudience: 'Developers',
        keywords: ['streaming', 'test']
      }

      // Simulate streaming with delayed resolution
      mockAiApi.generateArticle.mockImplementationOnce(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
        return {
          content: 'Streamed content',
          title: 'Title',
          metaDescription: 'Description',
          slug: 'slug',
          readingTime: 3,
          wordCount: 500
        }
      })

      const { result } = renderHook(() => useAIGeneration())
      
      const progressUpdates: number[] = []
      
      // Start generation
      const generatePromise = act(async () => {
        return result.current.generateContent(mockTemplate)
      })

      // Capture progress updates
      await waitFor(() => {
        if (result.current.progress > 0) {
          progressUpdates.push(result.current.progress)
        }
      })

      await generatePromise

      expect(result.current.progress).toBe(100)
      expect(progressUpdates.length).toBeGreaterThan(0)
    })
  })

  describe('generateTitle', () => {
    it('should generate title from content', async () => {
      const mockContent = 'This is an article about AI in healthcare...'
      const mockTitle = 'AI Transforming Modern Healthcare'

      mockAiApi.generateTitle.mockResolvedValueOnce(mockTitle)

      const { result } = renderHook(() => useAIGeneration())
      
      const title = await act(async () => {
        return result.current.generateTitle(mockContent)
      })

      expect(mockAiApi.generateTitle).toHaveBeenCalledWith(mockContent)
      expect(title).toBe(mockTitle)
    })

    it('should handle title generation errors', async () => {
      mockAiApi.generateTitle.mockRejectedValueOnce(new Error('Service error'))

      const { result } = renderHook(() => useAIGeneration())
      
      await act(async () => {
        try {
          await result.current.generateTitle('content')
        } catch (error: any) {
          expect(error.message).toBe('Service error')
        }
      })

      expect(result.current.error).toBe('Service error')
    })
  })

  describe('generateMetaDescription', () => {
    it('should generate meta description from content', async () => {
      const mockContent = 'Article content...'
      const mockDescription = 'Comprehensive guide on AI applications'

      mockAiApi.generateMetaDescription.mockResolvedValueOnce(mockDescription)

      const { result } = renderHook(() => useAIGeneration())
      
      const description = await act(async () => {
        return result.current.generateMetaDescription(mockContent)
      })

      expect(mockAiApi.generateMetaDescription).toHaveBeenCalledWith(mockContent)
      expect(description).toBe(mockDescription)
    })
  })

  describe('improveContent', () => {
    it('should improve existing content', async () => {
      const originalContent = 'Basic content'
      const improvedContent = 'Enhanced and improved content'

      mockAiApi.improveContent.mockResolvedValueOnce(improvedContent)

      const { result } = renderHook(() => useAIGeneration())
      
      const improved = await act(async () => {
        return result.current.improveContent(originalContent)
      })

      expect(mockAiApi.improveContent).toHaveBeenCalledWith(originalContent)
      expect(improved).toBe(improvedContent)
    })
  })

  describe('reset functionality', () => {
    it('should reset all state', async () => {
      // First generate some content
      mockAiApi.generateArticle.mockResolvedValueOnce({
        content: 'Content',
        title: 'Title',
        metaDescription: 'Description',
        slug: 'slug',
        readingTime: 5,
        wordCount: 1000
      })

      const { result } = renderHook(() => useAIGeneration())
      
      await act(async () => {
        await result.current.generateContent({
          topic: 'Test',
          style: 'informative',
          tone: 'professional',
          targetAudience: 'General',
          keywords: []
        })
      })

      expect(result.current.streamedContent).toBe('Content')
      expect(result.current.metadata).not.toBeNull()

      // Reset
      act(() => {
        result.current.reset()
      })

      expect(result.current.isGenerating).toBe(false)
      expect(result.current.progress).toBe(0)
      expect(result.current.streamedContent).toBe('')
      expect(result.current.error).toBeNull()
      expect(result.current.metadata).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('should handle empty keywords array', async () => {
      const template = {
        topic: 'Valid Topic',
        style: 'news' as const,
        tone: 'neutral' as const,
        targetAudience: 'Everyone',
        keywords: []
      }

      mockAiApi.generateArticle.mockResolvedValueOnce({
        content: 'Content',
        title: 'Title',
        metaDescription: 'Description',
        slug: 'slug',
        readingTime: 2,
        wordCount: 300
      })

      const { result } = renderHook(() => useAIGeneration())
      
      await act(async () => {
        await result.current.generateContent(template)
      })

      expect(mockAiApi.generateArticle).toHaveBeenCalledWith(template)
    })

    it('should handle network timeouts', async () => {
      const template = {
        topic: 'Timeout Test',
        style: 'informative' as const,
        tone: 'professional' as const,
        targetAudience: 'General',
        keywords: ['test']
      }

      mockAiApi.generateArticle.mockRejectedValueOnce(new Error('Network timeout'))

      const { result } = renderHook(() => useAIGeneration())
      
      await act(async () => {
        try {
          await result.current.generateContent(template)
        } catch (error) {
          // Expected
        }
      })

      expect(result.current.error).toBe('Network timeout')
      expect(result.current.isGenerating).toBe(false)
    })

    it('should prevent concurrent generations', async () => {
      mockAiApi.generateArticle.mockImplementationOnce(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
        return {
          content: 'Content 1',
          title: 'Title 1',
          metaDescription: 'Description 1',
          slug: 'slug-1',
          readingTime: 5,
          wordCount: 1000
        }
      })

      const { result } = renderHook(() => useAIGeneration())
      
      const template = {
        topic: 'Test',
        style: 'informative' as const,
        tone: 'professional' as const,
        targetAudience: 'General',
        keywords: []
      }

      // Start first generation
      let firstPromise: Promise<any>
      act(() => {
        firstPromise = result.current.generateContent(template)
      })

      // Try to start second generation while first is running
      await act(async () => {
        try {
          await result.current.generateContent(template)
        } catch (error: any) {
          expect(error.message).toBe('Generation already in progress')
        }
      })

      // Wait for first generation to complete
      await act(async () => {
        await firstPromise
      })

      expect(mockAiApi.generateArticle).toHaveBeenCalledTimes(1)
    })
  })
})