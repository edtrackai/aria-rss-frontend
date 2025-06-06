"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/cms/ui/card'
import { Badge } from '@/components/cms/ui/badge'
import { Skeleton } from '@/components/cms/ui/skeleton'
import { Button } from '@/components/cms/ui/button'
import { TrendingUp, TrendingDown, Minus, Sparkles, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTrendingTopics } from '@/hooks/useTrendingTopics'
import { cn } from '@/lib/utils'

export function TrendingTopics() {
  const { trends: topics, isLoading, error, refreshTrends: refetch } = useTrendingTopics()

  const getTrendIcon = (trend: 'up' | 'down' | 'stable' | 'rising' | 'steady' | 'declining') => {
    switch (trend) {
      case 'up':
      case 'rising':
        return <TrendingUp className="h-3 w-3 text-green-500" />
      case 'down':
      case 'declining':
        return <TrendingDown className="h-3 w-3 text-red-500" />
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />
    }
  }

  const getTrendColor = (trend: 'up' | 'down' | 'stable' | 'rising' | 'steady' | 'declining') => {
    switch (trend) {
      case 'up':
      case 'rising':
        return 'text-green-500 bg-green-500/10'
      case 'down':
      case 'declining':
        return 'text-red-500 bg-red-500/10'
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
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Trending Topics
            </CardTitle>
            <CardDescription>
              AI-powered suggestions based on your audience
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Failed to load trends</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        ) : topics && topics.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div className="space-y-3">
              {topics.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">#{topic.topic}</span>
                    <Badge variant="secondary" className="text-xs">
                      {topic.relatedArticles} articles
                    </Badge>
                  </div>
                  <div className={cn("flex items-center gap-1 px-2 py-1 rounded", getTrendColor(topic.trend))}>
                    {getTrendIcon(topic.trend)}
                    <span className="text-xs font-medium">{topic.score}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="text-center py-8">
            <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No trending topics yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Start publishing to see trends
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}