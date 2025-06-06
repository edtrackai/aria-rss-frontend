"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/cms/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/cms/ui/avatar'
import { Badge } from '@/components/cms/ui/badge'
import { Skeleton } from '@/components/cms/ui/skeleton'
import { ScrollArea } from '@/components/cms/ui/scroll-area'
import { 
  Activity as ActivityIcon, 
  FileText, 
  MessageSquare, 
  UserPlus, 
  DollarSign,
  Clock
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/lib/dashboard/dashboardApi'
import { formatDistanceToNow } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const activityIcons = {
  article_published: FileText,
  comment_added: MessageSquare,
  user_registered: UserPlus,
  revenue_earned: DollarSign,
}

const activityColors = {
  article_published: 'text-blue-500 bg-blue-500/10',
  comment_added: 'text-purple-500 bg-purple-500/10',
  user_registered: 'text-green-500 bg-green-500/10',
  revenue_earned: 'text-yellow-500 bg-yellow-500/10',
}

export function ActivityFeed() {
  const { data: activities, isLoading, error } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => dashboardApi.getRecentActivity(10),
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Failed to load activity feed</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ActivityIcon className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Real-time updates from your platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities && activities.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div className="space-y-4">
                {activities.map((activity, index) => {
                  const Icon = activityIcons[activity.type as keyof typeof activityIcons] || ActivityIcon
                  const colorClass = activityColors[activity.type as keyof typeof activityColors] || 'text-muted-foreground bg-muted'
                  
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-3"
                    >
                      <div className={cn("p-2 rounded-full", colorClass)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {activity.user && (
                            <div className="flex items-center gap-1">
                              <Avatar className="h-4 w-4">
                                <AvatarImage src={activity.user.avatar_url} />
                                <AvatarFallback className="text-[10px]">
                                  {activity.user.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">
                                {activity.user.name}
                              </span>
                            </div>
                          )}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-center py-8">
              <ActivityIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
              <p className="text-xs text-muted-foreground mt-1">
                Activities will appear here as they happen
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}