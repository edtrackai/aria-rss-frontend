import { apiClient } from '../api'

export interface AIProvider {
  id: string
  name: string
  models: string[]
  isAvailable: boolean
}

export interface GenerateContentRequest {
  prompt: string
  model?: string
  provider?: string
  maxTokens?: number
  temperature?: number
  style?: 'professional' | 'casual' | 'technical' | 'creative'
  tone?: 'formal' | 'informal' | 'friendly' | 'authoritative'
  audience?: 'general' | 'technical' | 'business' | 'academic'
}

export interface GenerateContentResponse {
  content: string
  model: string
  provider: string
  tokensUsed: number
  cost: number
  generatedAt: string
}

export interface OptimizeContentRequest {
  content: string
  type: 'seo' | 'readability' | 'engagement' | 'social'
  target?: {
    keywords?: string[]
    audience?: string
    platform?: string
  }
}

export interface OptimizeContentResponse {
  optimizedContent: string
  suggestions: Array<{
    type: string
    message: string
    severity: 'low' | 'medium' | 'high'
  }>
  seoScore?: number
  readabilityScore?: number
}

export interface GenerateSEORequest {
  content: string
  targetKeywords?: string[]
  industry?: string
  competitor?: string
}

export interface GenerateSEOResponse {
  title: string
  metaDescription: string
  keywords: string[]
  headings: {
    h1: string
    h2: string[]
    h3: string[]
  }
  suggestions: Array<{
    type: string
    message: string
    impact: 'low' | 'medium' | 'high'
  }>
}

export interface TrendingTopicsRequest {
  category?: string
  timeframe?: '24h' | '7d' | '30d'
  region?: string
  limit?: number
}

export interface TrendingTopic {
  keyword: string
  volume: number
  trend: 'rising' | 'steady' | 'declining'
  difficulty: 'low' | 'medium' | 'high'
  relatedKeywords: string[]
  searchVolume: number
}

export interface ContentIdeasRequest {
  topic: string
  contentType: 'article' | 'social' | 'email' | 'video'
  audience?: string
  tone?: string
  count?: number
}

export interface ContentIdea {
  title: string
  outline: string[]
  angle: string
  targetKeywords: string[]
  estimatedLength: number
  difficulty: 'easy' | 'medium' | 'hard'
}

export class AIApiService {
  /**
   * Get available AI providers and their models
   */
  static async getProviders(): Promise<AIProvider[]> {
    return await apiClient.get('/api/v1/ai/providers')
  }

  /**
   * Generate content using AI
   */
  static async generateContent(request: GenerateContentRequest): Promise<GenerateContentResponse> {
    return await apiClient.post('/api/v1/ai/generate', request)
  }

  /**
   * Stream content generation (for real-time updates)
   */
  static async* streamContent(request: GenerateContentRequest): AsyncGenerator<string, void, unknown> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ai/generate/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error('Failed to start content generation stream')
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Response body is not readable')
    }

    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') return
            
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                yield parsed.content
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  /**
   * Optimize existing content
   */
  static async optimizeContent(request: OptimizeContentRequest): Promise<OptimizeContentResponse> {
    return await apiClient.post('/api/v1/ai/optimize', request)
  }

  /**
   * Generate SEO optimizations
   */
  static async generateSEO(request: GenerateSEORequest): Promise<GenerateSEOResponse> {
    return await apiClient.post('/api/v1/ai/seo', request)
  }

  /**
   * Get trending topics and keywords
   */
  static async getTrendingTopics(request: TrendingTopicsRequest = {}): Promise<TrendingTopic[]> {
    const params = new URLSearchParams()
    Object.entries(request).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value))
      }
    })

    return await apiClient.get(`/api/v1/ai/trending?${params}`)
  }

  /**
   * Generate content ideas
   */
  static async getContentIdeas(request: ContentIdeasRequest): Promise<ContentIdea[]> {
    return await apiClient.post('/api/v1/ai/ideas', request)
  }

  /**
   * Analyze content quality
   */
  static async analyzeContent(content: string): Promise<{
    readabilityScore: number
    seoScore: number
    sentimentScore: number
    suggestions: Array<{
      type: string
      message: string
      severity: 'low' | 'medium' | 'high'
    }>
  }> {
    return await apiClient.post('/api/v1/ai/analyze', { content })
  }

  /**
   * Translate content
   */
  static async translateContent(
    content: string, 
    targetLanguage: string, 
    sourceLanguage = 'auto'
  ): Promise<{
    translatedContent: string
    detectedLanguage?: string
    confidence: number
  }> {
    return await apiClient.post('/api/v1/ai/translate', {
      content,
      targetLanguage,
      sourceLanguage
    })
  }

  /**
   * Generate image descriptions for accessibility
   */
  static async generateImageDescription(imageUrl: string): Promise<{
    description: string
    altText: string
    tags: string[]
  }> {
    return await apiClient.post('/api/v1/ai/image-description', { imageUrl })
  }

  /**
   * Suggest keywords for content optimization
   */
  static async suggestKeywords(content: string, targetCount: number = 10): Promise<{
    keywords: Array<{
      keyword: string
      relevance: number
      difficulty: 'low' | 'medium' | 'high'
      volume: number
    }>
  }> {
    return await apiClient.post('/api/v1/ai/suggest-keywords', { content, targetCount })
  }

  /**
   * Generate meta description for content
   */
  static async generateMetaDescription(content: string, maxLength: number = 160): Promise<{
    metaDescription: string
    length: number
    suggestions: string[]
  }> {
    return await apiClient.post('/api/v1/ai/meta-description', { content, maxLength })
  }
}

// Export instance for easier importing
export const aiApi = AIApiService

export default AIApiService