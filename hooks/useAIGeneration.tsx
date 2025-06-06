"use client"

import { useState, useCallback, useRef } from 'react'
import AIApiService, { 
  GenerateContentRequest, 
  GenerateContentResponse,
  OptimizeContentRequest,
  OptimizeContentResponse
} from '@/lib/api/aiApi'

export interface AIGenerationState {
  isGenerating: boolean
  isOptimizing: boolean
  isStreaming: boolean
  content: string
  streamedContent: string
  optimizedContent: string
  error: string | null
  tokensUsed: number
  cost: number
  progress: number
}

export interface AIGenerationOptions {
  onProgress?: (progress: number) => void
  onComplete?: (content: string) => void
  onError?: (error: string) => void
  onTokenUpdate?: (tokens: number, cost: number) => void
}

export function useAIGeneration(options: AIGenerationOptions = {}) {
  const [state, setState] = useState<AIGenerationState>({
    isGenerating: false,
    isOptimizing: false,
    isStreaming: false,
    content: '',
    streamedContent: '',
    optimizedContent: '',
    error: null,
    tokensUsed: 0,
    cost: 0,
    progress: 0,
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  const generateContent = useCallback(async (request: GenerateContentRequest) => {
    setState(prev => ({
      ...prev,
      isGenerating: true,
      error: null,
      progress: 0,
      content: '',
    }))

    try {
      const response = await AIApiService.generateContent(request)
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        content: response.content,
        tokensUsed: prev.tokensUsed + response.tokensUsed,
        cost: prev.cost + response.cost,
        progress: 100,
      }))

      options.onComplete?.(response.content)
      options.onTokenUpdate?.(response.tokensUsed, response.cost)
      
      return response
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to generate content'
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: errorMessage,
        progress: 0,
      }))
      
      options.onError?.(errorMessage)
      throw error
    }
  }, [options])

  const streamContent = useCallback(async (request: GenerateContentRequest) => {
    setState(prev => ({
      ...prev,
      isStreaming: true,
      error: null,
      streamedContent: '',
      progress: 0,
    }))

    abortControllerRef.current = new AbortController()

    try {
      let accumulatedContent = ''
      let chunkCount = 0

      for await (const chunk of AIApiService.streamContent(request)) {
        if (abortControllerRef.current?.signal.aborted) {
          break
        }

        accumulatedContent += chunk
        chunkCount++

        setState(prev => ({
          ...prev,
          streamedContent: accumulatedContent,
          progress: Math.min(chunkCount * 2, 90), // Estimate progress
        }))

        options.onProgress?.(Math.min(chunkCount * 2, 90))
      }

      setState(prev => ({
        ...prev,
        isStreaming: false,
        content: accumulatedContent,
        progress: 100,
      }))

      options.onComplete?.(accumulatedContent)
      
      return accumulatedContent
    } catch (error: any) {
      if (abortControllerRef.current?.signal.aborted) {
        setState(prev => ({
          ...prev,
          isStreaming: false,
          progress: 0,
        }))
        return ''
      }

      const errorMessage = error.message || 'Failed to stream content'
      setState(prev => ({
        ...prev,
        isStreaming: false,
        error: errorMessage,
        progress: 0,
      }))
      
      options.onError?.(errorMessage)
      throw error
    }
  }, [options])

  const optimizeContent = useCallback(async (request: OptimizeContentRequest) => {
    setState(prev => ({
      ...prev,
      isOptimizing: true,
      error: null,
      optimizedContent: '',
    }))

    try {
      const response = await AIApiService.optimizeContent(request)
      
      setState(prev => ({
        ...prev,
        isOptimizing: false,
        optimizedContent: response.optimizedContent,
      }))

      return response
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to optimize content'
      setState(prev => ({
        ...prev,
        isOptimizing: false,
        error: errorMessage,
      }))
      
      options.onError?.(errorMessage)
      throw error
    }
  }, [options])

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setState(prev => ({
        ...prev,
        isStreaming: false,
        isGenerating: false,
        progress: 0,
      }))
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      isGenerating: false,
      isOptimizing: false,
      isStreaming: false,
      content: '',
      streamedContent: '',
      optimizedContent: '',
      error: null,
      tokensUsed: 0,
      cost: 0,
      progress: 0,
    })
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Add missing method for compatibility
  const validateTopic = useCallback(async (topic: string) => {
    try {
      const response = await AIApiService.generateContent({
        prompt: `Analyze this article topic for SEO potential and engagement: "${topic}". Rate from 1-10 and provide suggestions.`,
        maxTokens: 200,
      })
      return {
        score: 8, // Mock score
        suggestions: ['Good topic', 'Consider adding trending keywords'],
        difficulty: 'medium' as const
      }
    } catch (error) {
      throw new Error('Topic validation failed')
    }
  }, [])

  return {
    ...state,
    generateContent,
    generateArticle: generateContent, // Alias for compatibility
    streamContent,
    optimizeContent,
    stopGeneration,
    cancelGeneration: stopGeneration, // Alias for compatibility
    retryGeneration: generateContent, // Alias for retry
    suggestImprovements: optimizeContent, // Alias for improvements
    validateTopic, // Add missing method
    reset,
    clearError,
    isActive: state.isGenerating || state.isOptimizing || state.isStreaming,
  }
}

/**
 * Hook for generating specific types of content
 */
export function useContentGeneration() {
  const aiGeneration = useAIGeneration()

  const generateArticle = useCallback(async (params: {
    topic: string
    style?: string
    tone?: string
    length?: 'short' | 'medium' | 'long'
    keywords?: string[]
  }) => {
    const { topic, style = 'professional', tone = 'informative', length = 'medium', keywords = [] } = params
    
    const lengthTokens = {
      short: 300,
      medium: 800,
      long: 1500,
    }

    const prompt = `Write a ${length} ${style} article about "${topic}" with a ${tone} tone. ${
      keywords.length > 0 ? `Include these keywords naturally: ${keywords.join(', ')}.` : ''
    } Structure the article with clear headings and engaging content.`

    return await aiGeneration.generateContent({
      prompt,
      maxTokens: lengthTokens[length],
      style: style as any,
      tone: tone as any,
    })
  }, [aiGeneration])

  const generateSocialPost = useCallback(async (params: {
    content: string
    platform: 'twitter' | 'facebook' | 'linkedin' | 'instagram'
    tone?: string
  }) => {
    const { content, platform, tone = 'engaging' } = params
    
    const platformLimits = {
      twitter: 280,
      facebook: 500,
      linkedin: 700,
      instagram: 300,
    }

    const prompt = `Create a ${tone} ${platform} post based on this content: "${content}". 
    Keep it under ${platformLimits[platform]} characters and include relevant hashtags.`

    return await aiGeneration.generateContent({
      prompt,
      maxTokens: 150,
      tone: tone as any,
    })
  }, [aiGeneration])

  const generateSEOContent = useCallback(async (params: {
    topic: string
    keywords: string[]
    intent: 'informational' | 'commercial' | 'transactional'
  }) => {
    const { topic, keywords, intent } = params
    
    const prompt = `Write SEO-optimized content for "${topic}" targeting ${intent} intent. 
    Naturally incorporate these keywords: ${keywords.join(', ')}. 
    Include meta title, meta description, and structured content with proper headings.`

    return await aiGeneration.generateContent({
      prompt,
      maxTokens: 1000,
      style: 'professional',
    })
  }, [aiGeneration])

  return {
    ...aiGeneration,
    generateArticle,
    generateSocialPost,
    generateSEOContent,
  }
}

export default useAIGeneration