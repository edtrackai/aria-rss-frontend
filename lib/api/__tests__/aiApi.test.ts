import { AIApiService, aiApi } from '../aiApi'
import { apiClient } from '../../api'

// Mock the api client
jest.mock('../../api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  }
}))

// Mock fetch for streaming
global.fetch = jest.fn()

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(() => 'test-token'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

describe('AIApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:4000'
  })

  describe('getProviders', () => {
    it('fetches available AI providers', async () => {
      const mockProviders = [
        { id: 'openai', name: 'OpenAI', models: ['gpt-4', 'gpt-3.5-turbo'], isAvailable: true },
        { id: 'anthropic', name: 'Anthropic', models: ['claude-2'], isAvailable: true }
      ]
      
      ;(apiClient.get as jest.Mock).mockResolvedValue(mockProviders)

      const result = await AIApiService.getProviders()

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/ai/providers')
      expect(result).toEqual(mockProviders)
    })

    it('handles error when fetching providers', async () => {
      const error = new Error('Network error')
      ;(apiClient.get as jest.Mock).mockRejectedValue(error)

      await expect(AIApiService.getProviders()).rejects.toThrow('Network error')
    })
  })

  describe('generateContent', () => {
    it('generates content with all parameters', async () => {
      const request = {
        prompt: 'Write about AI',
        model: 'gpt-4',
        provider: 'openai',
        maxTokens: 1000,
        temperature: 0.7,
        style: 'professional' as const,
        tone: 'formal' as const,
        audience: 'technical' as const,
      }

      const mockResponse = {
        content: 'Generated content about AI...',
        model: 'gpt-4',
        provider: 'openai',
        tokensUsed: 450,
        cost: 0.02,
        generatedAt: '2024-01-01T00:00:00Z'
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await AIApiService.generateContent(request)

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/ai/generate', request)
      expect(result).toEqual(mockResponse)
    })

    it('generates content with minimal parameters', async () => {
      const request = { prompt: 'Simple prompt' }
      const mockResponse = {
        content: 'Simple response',
        model: 'gpt-3.5-turbo',
        provider: 'openai',
        tokensUsed: 100,
        cost: 0.001,
        generatedAt: '2024-01-01T00:00:00Z'
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await AIApiService.generateContent(request)

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/ai/generate', request)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('streamContent', () => {
    it('streams content successfully', async () => {
      const request = { prompt: 'Stream test' }
      
      const mockResponse = {
        ok: true,
        body: {
          getReader: () => ({
            read: jest.fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode('data: {"content":"Hello "}\n')
              })
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode('data: {"content":"world"}\n')
              })
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode('data: [DONE]\n')
              })
              .mockResolvedValueOnce({ done: true }),
            releaseLock: jest.fn()
          })
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const chunks: string[] = []
      const generator = AIApiService.streamContent(request)
      
      for await (const chunk of generator) {
        chunks.push(chunk)
      }

      expect(chunks).toEqual(['Hello ', 'world'])
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/v1/ai/generate/stream',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          }),
          body: JSON.stringify(request)
        })
      )
    })

    it('handles stream errors', async () => {
      const request = { prompt: 'Stream error test' }
      
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500
      })

      const generator = AIApiService.streamContent(request)
      
      await expect(generator.next()).rejects.toThrow('Failed to start content generation stream')
    })

    it('handles missing response body', async () => {
      const request = { prompt: 'No body test' }
      
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        body: null
      })

      const generator = AIApiService.streamContent(request)
      
      await expect(generator.next()).rejects.toThrow('Response body is not readable')
    })

    it('handles invalid JSON in stream', async () => {
      const request = { prompt: 'Invalid JSON test' }
      
      const mockResponse = {
        ok: true,
        body: {
          getReader: () => ({
            read: jest.fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode('data: invalid-json\n')
              })
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode('data: {"content":"valid"}\n')
              })
              .mockResolvedValueOnce({ done: true }),
            releaseLock: jest.fn()
          })
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const chunks: string[] = []
      const generator = AIApiService.streamContent(request)
      
      for await (const chunk of generator) {
        chunks.push(chunk)
      }

      // Only valid JSON should be processed
      expect(chunks).toEqual(['valid'])
    })
  })

  describe('optimizeContent', () => {
    it('optimizes content for SEO', async () => {
      const request = {
        content: 'Original content',
        type: 'seo' as const,
        target: {
          keywords: ['AI', 'machine learning'],
          audience: 'technical'
        }
      }

      const mockResponse = {
        optimizedContent: 'SEO optimized content',
        suggestions: [
          { type: 'keyword', message: 'Add more keywords', severity: 'medium' as const }
        ],
        seoScore: 85,
        readabilityScore: 90
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await AIApiService.optimizeContent(request)

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/ai/optimize', request)
      expect(result).toEqual(mockResponse)
    })

    it('optimizes content for social media', async () => {
      const request = {
        content: 'Long article content',
        type: 'social' as const,
        target: {
          platform: 'twitter'
        }
      }

      const mockResponse = {
        optimizedContent: 'Short social media content',
        suggestions: [
          { type: 'length', message: 'Keep it under 280 characters', severity: 'high' as const }
        ]
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await AIApiService.optimizeContent(request)

      expect(result).toEqual(mockResponse)
    })
  })

  describe('generateSEO', () => {
    it('generates comprehensive SEO data', async () => {
      const request = {
        content: 'Article content',
        targetKeywords: ['AI', 'technology'],
        industry: 'tech',
        competitor: 'techcrunch.com'
      }

      const mockResponse = {
        title: 'AI Technology: The Future is Now',
        metaDescription: 'Discover how AI technology is transforming...',
        keywords: ['AI', 'technology', 'future', 'innovation'],
        headings: {
          h1: 'AI Technology Revolution',
          h2: ['What is AI?', 'Applications', 'Future Trends'],
          h3: ['Machine Learning', 'Deep Learning', 'Neural Networks']
        },
        suggestions: [
          { type: 'title', message: 'Title is optimal length', impact: 'high' as const }
        ]
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await AIApiService.generateSEO(request)

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/ai/seo', request)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getTrendingTopics', () => {
    it('fetches trending topics with all parameters', async () => {
      const request = {
        category: 'technology',
        timeframe: '7d' as const,
        region: 'US',
        limit: 10
      }

      const mockResponse = [
        {
          keyword: 'AI chatbots',
          volume: 50000,
          trend: 'rising' as const,
          difficulty: 'medium' as const,
          relatedKeywords: ['ChatGPT', 'AI assistant'],
          searchVolume: 45000
        }
      ]

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockResponse)

      const result = await AIApiService.getTrendingTopics(request)

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/ai/trending?category=technology&timeframe=7d&region=US&limit=10')
      expect(result).toEqual(mockResponse)
    })

    it('fetches trending topics with no parameters', async () => {
      const mockResponse = [{
        keyword: 'General trend',
        volume: 10000,
        trend: 'steady' as const,
        difficulty: 'low' as const,
        relatedKeywords: [],
        searchVolume: 10000
      }]

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockResponse)

      const result = await AIApiService.getTrendingTopics()

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/ai/trending?')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getContentIdeas', () => {
    it('generates content ideas', async () => {
      const request = {
        topic: 'artificial intelligence',
        contentType: 'article' as const,
        audience: 'beginners',
        tone: 'friendly',
        count: 5
      }

      const mockResponse = [
        {
          title: 'AI for Beginners: A Friendly Introduction',
          outline: ['What is AI?', 'How does it work?', 'Real-world examples'],
          angle: 'Educational and approachable',
          targetKeywords: ['AI basics', 'artificial intelligence explained'],
          estimatedLength: 1500,
          difficulty: 'easy' as const
        }
      ]

      ;(apiClient.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await AIApiService.getContentIdeas(request)

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/ai/ideas', request)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('analyzeContent', () => {
    it('analyzes content quality', async () => {
      const content = 'Sample article content for analysis'

      const mockResponse = {
        readabilityScore: 85,
        seoScore: 78,
        sentimentScore: 0.7,
        suggestions: [
          { type: 'readability', message: 'Good readability', severity: 'low' as const },
          { type: 'seo', message: 'Add more keywords', severity: 'medium' as const }
        ]
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await AIApiService.analyzeContent(content)

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/ai/analyze', { content })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('translateContent', () => {
    it('translates content with auto-detection', async () => {
      const content = 'Hello world'
      const targetLanguage = 'es'

      const mockResponse = {
        translatedContent: 'Hola mundo',
        detectedLanguage: 'en',
        confidence: 0.98
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await AIApiService.translateContent(content, targetLanguage)

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/ai/translate', {
        content,
        targetLanguage,
        sourceLanguage: 'auto'
      })
      expect(result).toEqual(mockResponse)
    })

    it('translates content with specified source language', async () => {
      const content = 'Bonjour le monde'
      const targetLanguage = 'en'
      const sourceLanguage = 'fr'

      const mockResponse = {
        translatedContent: 'Hello world',
        confidence: 0.99
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await AIApiService.translateContent(content, targetLanguage, sourceLanguage)

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/ai/translate', {
        content,
        targetLanguage,
        sourceLanguage
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('generateImageDescription', () => {
    it('generates image descriptions', async () => {
      const imageUrl = 'https://example.com/image.jpg'

      const mockResponse = {
        description: 'A beautiful sunset over the ocean with vibrant orange and purple colors',
        altText: 'Sunset over ocean with orange and purple sky',
        tags: ['sunset', 'ocean', 'nature', 'landscape']
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await AIApiService.generateImageDescription(imageUrl)

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/ai/image-description', { imageUrl })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('suggestKeywords', () => {
    it('suggests keywords with custom count', async () => {
      const content = 'Article about machine learning'
      const targetCount = 15

      const mockResponse = {
        keywords: [
          { keyword: 'machine learning', relevance: 0.95, difficulty: 'high' as const, volume: 100000 },
          { keyword: 'AI algorithms', relevance: 0.85, difficulty: 'medium' as const, volume: 50000 }
        ]
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await AIApiService.suggestKeywords(content, targetCount)

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/ai/suggest-keywords', { content, targetCount })
      expect(result).toEqual(mockResponse)
    })

    it('suggests keywords with default count', async () => {
      const content = 'Sample content'

      const mockResponse = {
        keywords: [
          { keyword: 'sample', relevance: 0.8, difficulty: 'low' as const, volume: 10000 }
        ]
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await AIApiService.suggestKeywords(content)

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/ai/suggest-keywords', { content, targetCount: 10 })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('generateMetaDescription', () => {
    it('generates meta description with custom length', async () => {
      const content = 'Long article content about technology...'
      const maxLength = 200

      const mockResponse = {
        metaDescription: 'Discover the latest in technology with our comprehensive guide...',
        length: 65,
        suggestions: ['Option 1', 'Option 2', 'Option 3']
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await AIApiService.generateMetaDescription(content, maxLength)

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/ai/meta-description', { content, maxLength })
      expect(result).toEqual(mockResponse)
    })

    it('generates meta description with default length', async () => {
      const content = 'Article content'

      const mockResponse = {
        metaDescription: 'Brief description',
        length: 17,
        suggestions: []
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await AIApiService.generateMetaDescription(content)

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/ai/meta-description', { content, maxLength: 160 })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Alias Export', () => {
    it('exports aiApi as an alias', () => {
      expect(aiApi).toBe(AIApiService)
    })

    it('exports default correctly', () => {
      const defaultExport = require('../aiApi').default
      expect(defaultExport).toBe(AIApiService)
    })
  })

  describe('Error Handling', () => {
    it('propagates API errors correctly', async () => {
      const error = new Error('API Error')
      ;(apiClient.post as jest.Mock).mockRejectedValue(error)

      await expect(AIApiService.generateContent({ prompt: 'test' })).rejects.toThrow('API Error')
    })

    it('handles network errors in streaming', async () => {
      const request = { prompt: 'Network error test' }
      
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const generator = AIApiService.streamContent(request)
      
      await expect(generator.next()).rejects.toThrow('Network error')
    })
  })
})