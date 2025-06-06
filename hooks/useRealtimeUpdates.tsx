"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSocket } from './useSocket'

export interface RealtimeUpdate {
  id: string
  type: 'article_published' | 'comment_added' | 'user_joined' | 'revenue_update' | 'notification'
  data: any
  timestamp: string
  userId?: string
}

export interface NotificationUpdate {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: string
  read: boolean
}

export function useRealtimeUpdates() {
  const [updates, setUpdates] = useState<RealtimeUpdate[]>([])
  const [notifications, setNotifications] = useState<NotificationUpdate[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const socket = useSocket()

  useEffect(() => {
    if (!socket) return

    const handleUpdate = (update: RealtimeUpdate) => {
      setUpdates(prev => [update, ...prev.slice(0, 49)]) // Keep last 50 updates
    }

    const handleNotification = (notification: NotificationUpdate) => {
      setNotifications(prev => [notification, ...prev])
      if (!notification.read) {
        setUnreadCount(prev => prev + 1)
      }
    }

    const handleArticleUpdate = (data: any) => {
      handleUpdate({
        id: `article-${data.id}-${Date.now()}`,
        type: 'article_published',
        data,
        timestamp: new Date().toISOString(),
      })
    }

    const handleCommentUpdate = (data: any) => {
      handleUpdate({
        id: `comment-${data.id}-${Date.now()}`,
        type: 'comment_added',
        data,
        timestamp: new Date().toISOString(),
      })
    }

    const handleRevenueUpdate = (data: any) => {
      handleUpdate({
        id: `revenue-${Date.now()}`,
        type: 'revenue_update',
        data,
        timestamp: new Date().toISOString(),
      })
    }

    const handleUserJoined = (data: any) => {
      handleUpdate({
        id: `user-${data.userId}-${Date.now()}`,
        type: 'user_joined',
        data,
        timestamp: new Date().toISOString(),
        userId: data.userId,
      })
    }

    // Subscribe to events
    const unsubscribes = [
      socket.addListener('message', handleUpdate),
      socket.addListener('notification', handleNotification),
      socket.addListener('articleUpdate', handleArticleUpdate),
      socket.addListener('commentAdded', handleCommentUpdate),
      socket.addListener('metricsUpdate', handleRevenueUpdate),
      socket.addListener('userJoined', handleUserJoined),
    ]

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe())
    }
  }, [socket])

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    )
    setUnreadCount(0)
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  const clearUpdates = useCallback(() => {
    setUpdates([])
  }, [])

  return {
    updates,
    notifications,
    unreadCount,
    markNotificationAsRead,
    markAllAsRead,
    clearNotifications,
    clearUpdates,
  }
}

/**
 * Hook for subscribing to specific article updates
 */
export function useArticleUpdates(articleId: string) {
  const [articleData, setArticleData] = useState<any>(null)
  const [collaborators, setCollaborators] = useState<string[]>([])
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const socket = useSocket()

  useEffect(() => {
    if (!socket || !articleId) return

    // Join article room
    socket.emit('join_article', { articleId })

    const handleArticleChange = (data: any) => {
      setArticleData(data)
    }

    const handleCollaboratorJoined = (data: { userId: string }) => {
      setCollaborators(prev => [...new Set([...prev, data.userId])])
    }

    const handleCollaboratorLeft = (data: { userId: string }) => {
      setCollaborators(prev => prev.filter(id => id !== data.userId))
    }

    const handleUserTyping = (data: { userId: string, isTyping: boolean }) => {
      if (data.isTyping) {
        setTypingUsers(prev => [...new Set([...prev, data.userId])])
      } else {
        setTypingUsers(prev => prev.filter(id => id !== data.userId))
      }
    }

    const unsubscribes = [
      socket.addListener('articleUpdate', handleArticleChange),
      socket.addListener('userJoined', handleCollaboratorJoined),
      socket.addListener('userLeft', handleCollaboratorLeft),
      socket.addListener('typing', handleUserTyping),
    ]

    return () => {
      socket.emit('leave_article', { articleId })
      unsubscribes.forEach(unsubscribe => unsubscribe())
    }
  }, [socket, articleId])

  const sendTypingStatus = useCallback((isTyping: boolean) => {
    if (socket && articleId) {
      socket.emit('typing_status', { articleId, isTyping })
    }
  }, [socket, articleId])

  return {
    articleData,
    collaborators,
    typingUsers,
    sendTypingStatus,
  }
}

export default useRealtimeUpdates