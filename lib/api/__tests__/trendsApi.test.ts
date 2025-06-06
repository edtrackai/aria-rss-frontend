import { TrendsApiService, trendsApi } from '../trendsApi'
import { apiClient } from '../../api'

// Mock the api client
jest.mock('../../api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  }
}))

describe('TrendsApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getTrendingTopics', () => {
    it('fetches trending topics with all parameters', async () => {
      const params = {
        category: 'technology',
        timeframe: '7d' as const,
        region: 'US',
        limit: 20,
        minVolume: 1000
      }

      const mockResponse = {
        trends: [
          {
            keyword: 'AI technology',
            volume: 50000,
            competition: 'medium' as const,
            cpc: 2.5,
            trend: [
              { date: '2024-01-01', value: 100 },
              { date: '2024-01-02', value: 120 }
            ],
            relatedKeywords: ['machine learning', 'deep learning'],
            questions: ['What is AI?', 'How does AI work?'],
            difficulty: 65
          }
        ],
        totalResults: 150,
        lastUpdated: '2024-01-01T00:00:00Z'
      }

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockResponse)

      const result = await TrendsApiService.getTrendingTopics(params)

      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/v1/trends/topics?category=technology&timeframe=7d&region=US&limit=20&minVolume=1000'
      )
      expect(result).toEqual(mockResponse)
    })

    it('fetches trending topics with no parameters', async () => {
      const mockResponse = {
        trends: [],
        totalResults: 0,
        lastUpdated: '2024-01-01T00:00:00Z'
      }

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockResponse)

      const result = await TrendsApiService.getTrendingTopics()

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/trends/topics?')
      expect(result).toEqual(mockResponse)
    })

    it('handles undefined parameters correctly', async () => {
      const params = {
        category: 'tech',
        timeframe: undefined,
        region: undefined,
        limit: 10
      }

      ;(apiClient.get as jest.Mock).mockResolvedValue({})

      await TrendsApiService.getTrendingTopics(params)

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/trends/topics?category=tech&limit=10')
    })
  })

  describe('analyzeTrend', () => {
    it('analyzes a trend with all options', async () => {
      const keyword = 'artificial intelligence'
      const options = {
        includeRelated: true,
        includeDemographics: true,
        includeSeasonality: true,
        timeframe: '12m' as const
      }

      const mockResponse = {
        keyword: 'artificial intelligence',
        searchVolume: 100000,
        trending: true,
        growth: 45.5,
        seasonality: [
          { month: 1, multiplier: 0.8 },
          { month: 12, multiplier: 1.2 }
        ],
        demographics: {
          ageGroups: [
            { age: '18-24', percentage: 25 },
            { age: '25-34', percentage: 35 }
          ],
          genders: [
            { gender: 'male', percentage: 60 },
            { gender: 'female', percentage: 40 }
          ],
          regions: [
            { region: 'North America', percentage: 40 },
            { region: 'Europe', percentage: 30 }
          ]
        }
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await TrendsApiService.analyzeTrend(keyword, options)

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/trends/analyze', {
        keyword,
        ...options
      })
      expect(result).toEqual(mockResponse)
    })

    it('analyzes a trend with minimal options', async () => {
      const keyword = 'blockchain'

      const mockResponse = {
        keyword: 'blockchain',
        searchVolume: 50000,
        trending: false,
        growth: -10.5,
        seasonality: [],
        demographics: {
          ageGroups: [],
          genders: [],
          regions: []
        }
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await TrendsApiService.analyzeTrend(keyword)

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/trends/analyze', { keyword })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getKeywordSuggestions', () => {
    it('gets keyword suggestions with all options', async () => {
      const seedKeyword = 'machine learning'
      const options = {
        limit: 20,
        includeQuestions: true,
        includeRelated: true,
        minVolume: 500,
        maxDifficulty: 70
      }

      const mockResponse = [
        {
          keyword: 'machine learning algorithms',
          volume: 25000,
          difficulty: 65,
          relevance: 0.95,
          intent: 'informational' as const
        },
        {
          keyword: 'machine learning courses',
          volume: 15000,
          difficulty: 45,
          relevance: 0.85,
          intent: 'commercial' as const
        }
      ]

      ;(apiClient.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await TrendsApiService.getKeywordSuggestions(seedKeyword, options)

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/trends/keywords', {
        seedKeyword,
        ...options
      })
      expect(result).toEqual(mockResponse)
    })

    it('gets keyword suggestions with default options', async () => {
      const seedKeyword = 'AI'

      const mockResponse = [
        {
          keyword: 'AI tools',
          volume: 50000,
          difficulty: 50,
          relevance: 0.9,
          intent: 'transactional' as const
        }
      ]

      ;(apiClient.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await TrendsApiService.getKeywordSuggestions(seedKeyword)

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/trends/keywords', { seedKeyword })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('analyzeCompetitor', () => {
    it('analyzes competitor domain', async () => {
      const domain = 'techcrunch.com'

      const mockResponse = {
        domain: 'techcrunch.com',
        keywords: [
          {
            keyword: 'tech news',
            position: 1,
            volume: 100000,
            difficulty: 85
          }
        ],
        topPages: [
          {
            url: 'https://techcrunch.com/category/ai/',
            title: 'AI News',
            traffic: 50000,
            keywords: 150
          }
        ],
        backlinks: 250000,
        domainAuthority: 92
      }

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockResponse)

      const result = await TrendsApiService.analyzeCompetitor(domain)

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/trends/competitor/techcrunch.com')
      expect(result).toEqual(mockResponse)
    })

    it('handles domains with special characters', async () => {
      const domain = 'example.co.uk/path'

      ;(apiClient.get as jest.Mock).mockResolvedValue({})

      await TrendsApiService.analyzeCompetitor(domain)

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/trends/competitor/example.co.uk%2Fpath')
    })
  })

  describe('findContentGaps', () => {
    it('finds content gaps with all parameters', async () => {
      const params = {
        domain: 'mysite.com',
        competitors: ['competitor1.com', 'competitor2.com'],
        keywords: ['AI', 'machine learning'],
        category: 'technology'
      }

      const mockResponse = [
        {
          keyword: 'AI ethics',
          opportunity: 'high' as const,
          volume: 30000,
          difficulty: 45,
          competitors: ['competitor1.com'],
          suggestedContentType: 'comprehensive guide',
          estimatedTraffic: 5000
        }
      ]

      ;(apiClient.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await TrendsApiService.findContentGaps(params)

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/trends/content-gaps', params)
      expect(result).toEqual(mockResponse)
    })

    it('finds content gaps with minimal parameters', async () => {
      const params = { category: 'tech' }

      ;(apiClient.post as jest.Mock).mockResolvedValue([])

      const result = await TrendsApiService.findContentGaps(params)

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/trends/content-gaps', params)
      expect(result).toEqual([])
    })
  })

  describe('getSocialTrends', () => {
    it('gets social trends for specific platform', async () => {
      const platform = 'twitter'
      const options = {
        timeframe: '24h' as const,
        region: 'US',
        category: 'technology'
      }

      const mockResponse = [
        {
          hashtag: '#AIrevolution',
          mentions: 15000,
          engagement: 250000,
          sentiment: 'positive' as const,
          trend: 'rising' as const
        }
      ]

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockResponse)

      const result = await TrendsApiService.getSocialTrends(platform, options)

      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/v1/trends/social?platform=twitter&timeframe=24h&region=US&category=technology'
      )
      expect(result).toEqual(mockResponse)
    })

    it('gets social trends for all platforms', async () => {
      const platform = 'all'

      ;(apiClient.get as jest.Mock).mockResolvedValue([])

      const result = await TrendsApiService.getSocialTrends(platform)

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/trends/social?platform=all')
      expect(result).toEqual([])
    })
  })

  describe('getNewsTrends', () => {
    it('gets news trends with all options', async () => {
      const options = {
        category: 'technology',
        timeframe: '7d' as const,
        region: 'UK',
        limit: 50
      }

      const mockResponse = [
        {
          title: 'AI Breakthrough Announced',
          url: 'https://example.com/ai-news',
          source: 'TechNews',
          publishedAt: '2024-01-01T00:00:00Z',
          engagement: 50000,
          sentiment: 0.8,
          keywords: ['AI', 'breakthrough', 'technology'],
          summary: 'Major AI breakthrough announced today...'
        }
      ]

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockResponse)

      const result = await TrendsApiService.getNewsTrends(options)

      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/v1/trends/news?category=technology&timeframe=7d&region=UK&limit=50'
      )
      expect(result).toEqual(mockResponse)
    })

    it('gets news trends with no options', async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue([])

      const result = await TrendsApiService.getNewsTrends()

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/trends/news?')
      expect(result).toEqual([])
    })
  })

  describe('trackKeywords', () => {
    it('tracks multiple keywords', async () => {
      const keywords = ['AI', 'machine learning', 'deep learning']

      const mockResponse = {
        trackingId: 'track-123',
        keywords: [
          {
            keyword: 'AI',
            currentVolume: 100000,
            previousVolume: 90000,
            change: 11.11,
            trend: 'up' as const
          },
          {
            keyword: 'machine learning',
            currentVolume: 50000,
            previousVolume: 50000,
            change: 0,
            trend: 'stable' as const
          }
        ]
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await TrendsApiService.trackKeywords(keywords)

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/trends/track', { keywords })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getTrackedKeywords', () => {
    it('gets tracked keyword data', async () => {
      const trackingId = 'track-123'

      const mockResponse = {
        keywords: [
          {
            keyword: 'AI',
            history: [
              { date: '2024-01-01', volume: 90000, position: 5 },
              { date: '2024-01-02', volume: 100000, position: 3 }
            ]
          }
        ]
      }

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockResponse)

      const result = await TrendsApiService.getTrackedKeywords(trackingId)

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/trends/track/track-123')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getTrendingHashtags', () => {
    it('gets trending hashtags with options', async () => {
      const platform = 'instagram'
      const options = {
        limit: 20,
        category: 'fashion',
        region: 'US'
      }

      const mockResponse = [
        {
          hashtag: '#fashion2024',
          posts: 500000,
          engagement: 2500000,
          reach: 10000000,
          trend: 'viral' as const
        }
      ]

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockResponse)

      const result = await TrendsApiService.getTrendingHashtags(platform, options)

      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/v1/trends/hashtags?platform=instagram&limit=20&category=fashion&region=US'
      )
      expect(result).toEqual(mockResponse)
    })

    it('gets trending hashtags with minimal parameters', async () => {
      const platform = 'twitter'

      ;(apiClient.get as jest.Mock).mockResolvedValue([])

      const result = await TrendsApiService.getTrendingHashtags(platform)

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/trends/hashtags?platform=twitter')
      expect(result).toEqual([])
    })
  })

  describe('getSeasonalTrends', () => {
    it('gets seasonal trends for a keyword', async () => {
      const keyword = 'christmas gifts'

      const mockResponse = {
        keyword: 'christmas gifts',
        seasonalityScore: 95,
        peakMonths: [11, 12],
        lowMonths: [6, 7, 8],
        yearOverYearGrowth: 12.5,
        predictions: [
          {
            month: 12,
            year: 2024,
            predictedVolume: 200000,
            confidence: 0.85
          }
        ]
      }

      ;(apiClient.get as jest.Mock).mockResolvedValue(mockResponse)

      const result = await TrendsApiService.getSeasonalTrends(keyword)

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/trends/seasonal/christmas%20gifts')
      expect(result).toEqual(mockResponse)
    })

    it('handles keywords with special characters', async () => {
      const keyword = 'tech & gadgets'

      ;(apiClient.get as jest.Mock).mockResolvedValue({})

      await TrendsApiService.getSeasonalTrends(keyword)

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/trends/seasonal/tech%20%26%20gadgets')
    })
  })

  describe('getTrendingKeywords (alias)', () => {
    it('calls getTrendingTopics internally', async () => {
      const params = {
        category: 'tech',
        timeframe: '30d' as const,
        limit: 15
      }

      const mockResponse = {
        trends: [],
        totalResults: 0,
        lastUpdated: '2024-01-01T00:00:00Z'
      }

      // Spy on getTrendingTopics
      const spy = jest.spyOn(TrendsApiService, 'getTrendingTopics')
      ;(apiClient.get as jest.Mock).mockResolvedValue(mockResponse)

      const result = await TrendsApiService.getTrendingKeywords(params)

      expect(spy).toHaveBeenCalledWith(params)
      expect(result).toEqual(mockResponse)

      spy.mockRestore()
    })
  })

  describe('Alias Export', () => {
    it('exports trendsApi as an alias', () => {
      expect(trendsApi).toBe(TrendsApiService)
    })

    it('exports default correctly', () => {
      const defaultExport = require('../trendsApi').default
      expect(defaultExport).toBe(TrendsApiService)
    })
  })

  describe('Error Handling', () => {
    it('propagates errors from API client', async () => {
      const error = new Error('Network error')
      ;(apiClient.get as jest.Mock).mockRejectedValue(error)

      await expect(TrendsApiService.getTrendingTopics()).rejects.toThrow('Network error')
    })

    it('handles errors in POST requests', async () => {
      const error = new Error('Server error')
      ;(apiClient.post as jest.Mock).mockRejectedValue(error)

      await expect(
        TrendsApiService.analyzeTrend('test keyword')
      ).rejects.toThrow('Server error')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty responses', async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue(null)

      const result = await TrendsApiService.getTrendingTopics()
      expect(result).toBeNull()
    })

    it('handles malformed responses', async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue({ unexpected: 'format' })

      const result = await TrendsApiService.getTrendingTopics()
      expect(result).toEqual({ unexpected: 'format' })
    })

    it('handles concurrent requests', async () => {
      const mockResponse1 = { trends: [{ keyword: 'trend1' }] }
      const mockResponse2 = [{ keyword: 'suggestion1' }]
      const mockResponse3 = [{ hashtag: '#trending' }]

      ;(apiClient.get as jest.Mock)
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse3)
      ;(apiClient.post as jest.Mock)
        .mockResolvedValueOnce(mockResponse2)

      const [result1, result2, result3] = await Promise.all([
        TrendsApiService.getTrendingTopics(),
        TrendsApiService.getKeywordSuggestions('test'),
        TrendsApiService.getTrendingHashtags('twitter')
      ])

      expect(result1).toEqual(mockResponse1)
      expect(result2).toEqual(mockResponse2)
      expect(result3).toEqual(mockResponse3)
    })
  })
})