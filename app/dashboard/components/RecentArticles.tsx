"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/cms/ui/card'
import { Badge } from '@/components/cms/ui/badge'
import { Button } from '@/components/cms/ui/button'
import { Skeleton } from '@/components/cms/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/cms/ui/avatar'
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  ExternalLink,
  Clock,
  FileText
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/cms/ui/dropdown-menu'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/lib/dashboard/dashboardApi'
import { formatDistanceToNow } from 'date-fns'
import { formatNumber } from '@/lib/dashboard/chartHelpers'
import Link from 'next/link'

interface Article {
  id: string
  title: string
  status: string
  views: number
  publishedAt: string
  author?: {
    name: string
    avatar?: string
  }
}

interface ArticlesResponse {
  articles: Article[]
}

export function RecentArticles() {
  const { data: articles, isLoading, error } = useQuery<ArticlesResponse>({
    queryKey: ['recent-articles'],
    queryFn: () => dashboardApi.getRecentArticles({ limit: 5 }),
    refetchInterval: 60000,
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'default'
      case 'draft':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Failed to load articles</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Articles</CardTitle>
            <CardDescription>
              Your latest content performance
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/articles">View All</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        ) : articles && articles.articles && articles.articles.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div className="space-y-4">
              {articles.articles.map((article: Article, index: number) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar>
                      <AvatarImage src={article.author?.avatar} />
                      <AvatarFallback>
                        {article.author?.name?.charAt(0).toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link 
                          href={`/dashboard/articles/${article.id}`}
                          className="font-medium text-sm hover:underline truncate"
                        >
                          {article.title}
                        </Link>
                        <Badge variant={getStatusColor(article.status)}>
                          {article.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {formatNumber(article.views)} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(article.publishedAt || Date.now()), { addSuffix: true })}
                        </span>
                        {article.category && (
                          <Badge variant="outline" className="text-xs">
                            {article.category.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/articles/${article.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Article
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/articles/${article.slug}`} target="_blank">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Live
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No articles yet</p>
            <Button asChild variant="outline" size="sm" className="mt-2">
              <Link href="/dashboard/articles/new">Create Your First Article</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}