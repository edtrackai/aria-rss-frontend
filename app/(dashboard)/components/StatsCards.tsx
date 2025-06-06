"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  DollarSign, 
  Eye, 
  FileText, 
  MessageSquare,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { motion } from 'framer-motion'
import { formatNumber, formatCurrency, formatPercentage } from '@/lib/dashboard/chartHelpers'
import { cn } from '@/lib/utils'

interface StatsCardsProps {
  stats: {
    totalViews: number
    totalRevenue: number
    totalArticles: number
    totalComments: number
    viewsChange: number
    revenueChange: number
    articlesChange: number
    commentsChange: number
  } | undefined
  isLoading: boolean
  error: Error | null
}

const statConfigs = [
  {
    title: 'Total Revenue',
    key: 'totalRevenue' as const,
    changeKey: 'revenueChange' as const,
    icon: DollarSign,
    format: formatCurrency,
    color: 'text-green-500',
  },
  {
    title: 'Page Views',
    key: 'totalViews' as const,
    changeKey: 'viewsChange' as const,
    icon: Eye,
    format: formatNumber,
    color: 'text-blue-500',
  },
  {
    title: 'Articles Published',
    key: 'totalArticles' as const,
    changeKey: 'articlesChange' as const,
    icon: FileText,
    format: (v: number) => v.toString(),
    color: 'text-purple-500',
  },
  {
    title: 'Comments',
    key: 'totalComments' as const,
    changeKey: 'commentsChange' as const,
    icon: MessageSquare,
    format: formatNumber,
    color: 'text-orange-500',
  },
]

export function StatsCards({ stats, isLoading, error }: StatsCardsProps) {
  if (error) {
    return (
      <div className="col-span-full">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-destructive">Failed to load statistics</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      {statConfigs.map((config, index) => (
        <motion.div
          key={config.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {config.title}
              </CardTitle>
              <config.icon className={cn("h-4 w-4", config.color)} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {stats ? config.format(stats[config.key]) : '-'}
                  </div>
                  {stats && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      {stats[config.changeKey] !== 0 && (
                        <>
                          {stats[config.changeKey] > 0 ? (
                            <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                          ) : (
                            <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                          )}
                          <span className={stats[config.changeKey] > 0 ? 'text-green-500' : 'text-red-500'}>
                            {formatPercentage(stats[config.changeKey])}
                          </span>
                        </>
                      )}
                      <span className="ml-1">from last month</span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </>
  )
}