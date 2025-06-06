"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Bell, BellRing, X, Check, AlertCircle, Info, CheckCircle } from 'lucide-react'
import { Button } from '@/components/cms/ui/button'
import { Badge } from '@/components/cms/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/cms/ui/card'
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/cms/ui/popover'
import { ScrollArea } from '@/components/cms/ui/scroll-area'
import { Separator } from '@/components/cms/ui/separator'
import { useSocketEvent } from './SocketProvider'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  actionText?: string
  data?: any
}

export interface NotificationCenterProps {
  className?: string
  maxNotifications?: number
  showToastForNew?: boolean
  persistNotifications?: boolean
}

export function NotificationCenter({
  className,
  maxNotifications = 50,
  showToastForNew = true,
  persistNotifications = true
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Load persisted notifications on mount
  useEffect(() => {
    if (persistNotifications && typeof window !== 'undefined') {
      const stored = localStorage.getItem('notifications')
      if (stored) {
        try {
          const parsed = JSON.parse(stored).map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp)
          }))
          setNotifications(parsed)
        } catch (error) {
          console.warn('Failed to load stored notifications:', error)
        }
      }
    }
  }, [persistNotifications])

  // Persist notifications when they change
  useEffect(() => {
    if (persistNotifications && typeof window !== 'undefined') {
      localStorage.setItem('notifications', JSON.stringify(notifications))
    }
  }, [notifications, persistNotifications])

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
    }

    setNotifications(prev => {
      const updated = [newNotification, ...prev]
      return updated.slice(0, maxNotifications)
    })

    // Show toast for new notifications
    if (showToastForNew) {
      const icon = {
        info: Info,
        success: CheckCircle,
        warning: AlertCircle,
        error: AlertCircle,
      }[notification.type]

      toast(notification.title, {
        description: notification.message,
        icon: React.createElement(icon, { className: "h-4 w-4" }),
      })
    }
  }, [maxNotifications, showToastForNew])

  // Listen for socket notifications
  useSocketEvent('notification', addNotification)

  // Listen for specific notification types
  useSocketEvent('article-published', (data: { articleId: string; title: string }) => {
    addNotification({
      type: 'success',
      title: 'Article Published',
      message: `"${data.title}" has been published successfully`,
      actionUrl: `/articles/${data.articleId}`,
      actionText: 'View Article',
      data,
    })
  })

  useSocketEvent('comment-added', (data: { articleId: string; articleTitle: string; author: string }) => {
    addNotification({
      type: 'info',
      title: 'New Comment',
      message: `${data.author} commented on "${data.articleTitle}"`,
      actionUrl: `/articles/${data.articleId}#comments`,
      actionText: 'View Comment',
      data,
    })
  })

  useSocketEvent('revenue-milestone', (data: { amount: number; period: string }) => {
    addNotification({
      type: 'success',
      title: 'Revenue Milestone!',
      message: `You've earned $${data.amount} this ${data.period}`,
      actionUrl: '/dashboard/revenue',
      actionText: 'View Revenue',
      data,
    })
  })

  useSocketEvent('system-alert', (data: { level: string; message: string }) => {
    addNotification({
      type: data.level as any || 'info',
      title: 'System Alert',
      message: data.message,
      data,
    })
  })

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("relative", className)}
        >
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-80 p-0" 
        align="end"
        sideOffset={8}
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="h-auto p-1 text-xs"
                  >
                    Mark all read
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className="h-auto p-1 text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <ScrollArea className="h-96">
                <div className="space-y-1">
                  {notifications.map((notification, index) => (
                    <div key={notification.id}>
                      <div
                        className={cn(
                          "flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer",
                          !notification.read && "bg-muted/30"
                        )}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className={cn(
                                "text-sm font-medium truncate",
                                !notification.read && "font-semibold"
                              )}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(notification.timestamp)}
                                </span>
                                {notification.actionUrl && (
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      window.open(notification.actionUrl, '_blank')
                                    }}
                                  >
                                    {notification.actionText || 'View'}
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {!notification.read && (
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeNotification(notification.id)
                                }}
                                className="h-auto w-auto p-1 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {index < notifications.length - 1 && (
                        <Separator className="mx-3" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}

export default NotificationCenter