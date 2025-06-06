"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  Lightbulb, 
  Target, 
  TrendingUp,
  RefreshCw,
  Sparkles
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface Suggestion {
  id: string
  type: 'content' | 'optimization' | 'growth'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  action?: {
    label: string
    href: string
  }
}

// AI-generated suggestions (in a real app, these would come from an API)
const generateSuggestions = (): Suggestion[] => {
  const suggestions: Suggestion[] = [
    {
      id: '1',
      type: 'content',
      title: 'Write about trending AI topics',
      description: 'AI content is getting 3x more engagement this week',
      impact: 'high',
      action: {
        label: 'Start Writing',
        href: '/dashboard/articles/new?topic=ai'
      }
    },
    {
      id: '2',
      type: 'optimization',
      title: 'Update your top article',
      description: '"Best Apps 2024" needs fresh screenshots',
      impact: 'medium',
      action: {
        label: 'Update Now',
        href: '/dashboard/articles/123/edit'
      }
    },
    {
      id: '3',
      type: 'growth',
      title: 'Enable newsletter signup',
      description: 'Capture 40% more leads with email opt-ins',
      impact: 'high',
      action: {
        label: 'Set Up',
        href: '/dashboard/settings/newsletter'
      }
    },
  ]
  
  return suggestions.slice(0, Math.floor(Math.random() * 3) + 1)
}

export function AIAssistant() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate AI processing
    const timer = setTimeout(() => {
      setSuggestions(generateSuggestions())
      setIsLoading(false)
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [])

  const refreshSuggestions = () => {
    setIsLoading(true)
    setTimeout(() => {
      setSuggestions(generateSuggestions())
      setIsLoading(false)
    }, 1000)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'content':
        return <Lightbulb className="h-4 w-4" />
      case 'optimization':
        return <Target className="h-4 w-4" />
      case 'growth':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-green-500 bg-green-500/10'
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10'
      case 'low':
        return 'text-blue-500 bg-blue-500/10'
      default:
        return 'text-muted-foreground bg-muted'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              AI Assistant
            </CardTitle>
            <CardDescription>
              Personalized suggestions to grow your content
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={refreshSuggestions}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center py-8">
              <div className="relative">
                <Brain className="h-8 w-8 text-purple-500 animate-pulse" />
                <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1 animate-ping" />
              </div>
            </div>
            <p className="text-sm text-center text-muted-foreground">
              AI is analyzing your content...
            </p>
          </div>
        ) : suggestions.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeIcon(suggestion.type)}
                        <h4 className="text-sm font-medium">{suggestion.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {suggestion.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={cn("text-xs", getImpactColor(suggestion.impact))}
                        >
                          {suggestion.impact} impact
                        </Badge>
                        {suggestion.action && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-xs"
                            asChild
                          >
                            <a href={suggestion.action.href}>
                              {suggestion.action.label}
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="text-center py-8">
            <Brain className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No suggestions at the moment
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshSuggestions}
              className="mt-2"
            >
              Check Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}