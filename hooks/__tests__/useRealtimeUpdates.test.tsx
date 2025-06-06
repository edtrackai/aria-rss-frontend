import { renderHook, act, waitFor } from '@testing-library/react'
import { useRealtimeUpdates } from '../useRealtimeUpdates'
import { useSocket } from '../useSocket'

// Mock dependencies
jest.mock('../useSocket')

const mockUseSocket = useSocket as jest.MockedFunction<typeof useSocket>

describe('useRealtimeUpdates', () => {
  const mockSocket = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    connected: true,
    id: 'socket-123'
  }

  const mockSocketHook = {
    socket: mockSocket,
    connected: true,
    connect: jest.fn(),
    disconnect: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSocket.mockReturnValue(mockSocketHook)
  })

  describe('initial state', () => {
    it('should initialize with empty arrays', () => {
      const { result } = renderHook(() => useRealtimeUpdates())
      
      expect(result.current.notifications).toEqual([])
      expect(result.current.activities).toEqual([])
      expect(result.current.onlineUsers).toEqual([])
    })
  })

  describe('subscriptions', () => {
    it('should subscribe to a channel', () => {
      const { result } = renderHook(() => useRealtimeUpdates())

      act(() => {
        result.current.subscribe('article', '123')
      })

      expect(mockSocket.emit).toHaveBeenCalledWith('subscribe', {
        channel: 'article',
        id: '123'
      })
    })

    it('should unsubscribe from a channel', () => {
      const { result } = renderHook(() => useRealtimeUpdates())

      act(() => {
        result.current.unsubscribe('article', '123')
      })

      expect(mockSocket.emit).toHaveBeenCalledWith('unsubscribe', {
        channel: 'article',
        id: '123'
      })
    })

    it('should not emit if socket is not available', () => {
      mockUseSocket.mockReturnValue({ ...mockSocketHook, socket: null })

      const { result } = renderHook(() => useRealtimeUpdates())

      act(() => {
        result.current.subscribe('article', '123')
      })

      expect(mockSocket.emit).not.toHaveBeenCalled()
    })
  })

  describe('notifications', () => {
    it('should handle new notifications', () => {
      const { result } = renderHook(() => useRealtimeUpdates())

      // Simulate notification event
      const notificationHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'notification'
      )?.[1]

      const mockNotification = {
        id: 'notif-1',
        type: 'article_published',
        message: 'Your article was published',
        timestamp: new Date().toISOString(),
        read: false
      }

      act(() => {
        notificationHandler?.(mockNotification)
      })

      expect(result.current.notifications).toEqual([mockNotification])
    })

    it('should add multiple notifications in order', () => {
      const { result } = renderHook(() => useRealtimeUpdates())

      const notificationHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'notification'
      )?.[1]

      const notifications = [
        { id: '1', type: 'comment', message: 'New comment', timestamp: '2024-01-01', read: false },
        { id: '2', type: 'like', message: 'New like', timestamp: '2024-01-02', read: false }
      ]

      act(() => {
        notifications.forEach(notif => notificationHandler?.(notif))
      })

      expect(result.current.notifications).toHaveLength(2)
      expect(result.current.notifications[0].id).toBe('2') // Most recent first
      expect(result.current.notifications[1].id).toBe('1')
    })

    it('should mark notification as read', () => {
      const { result } = renderHook(() => useRealtimeUpdates())

      const notificationHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'notification'
      )?.[1]

      const notification = {
        id: 'notif-1',
        type: 'comment',
        message: 'New comment',
        timestamp: new Date().toISOString(),
        read: false
      }

      act(() => {
        notificationHandler?.(notification)
      })

      expect(result.current.notifications[0].read).toBe(false)

      act(() => {
        result.current.markNotificationRead('notif-1')
      })

      expect(result.current.notifications[0].read).toBe(true)
      expect(mockSocket.emit).toHaveBeenCalledWith('notification:read', { id: 'notif-1' })
    })

    it('should mark all notifications as read', () => {
      const { result } = renderHook(() => useRealtimeUpdates())

      const notificationHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'notification'
      )?.[1]

      const notifications = [
        { id: '1', type: 'comment', message: 'Comment 1', timestamp: '2024-01-01', read: false },
        { id: '2', type: 'like', message: 'Like 1', timestamp: '2024-01-02', read: false }
      ]

      act(() => {
        notifications.forEach(notif => notificationHandler?.(notif))
      })

      act(() => {
        result.current.markAllNotificationsRead()
      })

      expect(result.current.notifications.every(n => n.read)).toBe(true)
      expect(mockSocket.emit).toHaveBeenCalledWith('notification:read-all')
    })
  })

  describe('activities', () => {
    it('should handle activity updates', () => {
      const { result } = renderHook(() => useRealtimeUpdates())

      const activityHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'activity'
      )?.[1]

      const mockActivity = {
        id: 'act-1',
        type: 'article_view',
        user: { id: 'user-1', name: 'John Doe' },
        data: { articleId: 'article-123', title: 'Test Article' },
        timestamp: new Date().toISOString()
      }

      act(() => {
        activityHandler?.(mockActivity)
      })

      expect(result.current.activities).toEqual([mockActivity])
    })

    it('should limit activities to recent 50', () => {
      const { result } = renderHook(() => useRealtimeUpdates())

      const activityHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'activity'
      )?.[1]

      // Add 60 activities
      act(() => {
        for (let i = 0; i < 60; i++) {
          activityHandler?.({
            id: `act-${i}`,
            type: 'view',
            user: { id: `user-${i}`, name: `User ${i}` },
            data: {},
            timestamp: new Date().toISOString()
          })
        }
      })

      expect(result.current.activities).toHaveLength(50)
      expect(result.current.activities[0].id).toBe('act-59') // Most recent
      expect(result.current.activities[49].id).toBe('act-10') // Oldest kept
    })
  })

  describe('online users', () => {
    it('should handle users online event', () => {
      const { result } = renderHook(() => useRealtimeUpdates())

      const usersHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'users:online'
      )?.[1]

      const mockUsers = [
        { id: 'user-1', name: 'John Doe', avatar: 'avatar1.jpg' },
        { id: 'user-2', name: 'Jane Smith', avatar: 'avatar2.jpg' }
      ]

      act(() => {
        usersHandler?.(mockUsers)
      })

      expect(result.current.onlineUsers).toEqual(mockUsers)
    })

    it('should handle user joined event', () => {
      const { result } = renderHook(() => useRealtimeUpdates())

      const joinHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'user:joined'
      )?.[1]

      const newUser = { id: 'user-3', name: 'New User', avatar: 'avatar3.jpg' }

      act(() => {
        joinHandler?.(newUser)
      })

      expect(result.current.onlineUsers).toContainEqual(newUser)
    })

    it('should handle user left event', () => {
      const { result } = renderHook(() => useRealtimeUpdates())

      // First set some online users
      const usersHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'users:online'
      )?.[1]

      const users = [
        { id: 'user-1', name: 'User 1', avatar: 'avatar1.jpg' },
        { id: 'user-2', name: 'User 2', avatar: 'avatar2.jpg' }
      ]

      act(() => {
        usersHandler?.(users)
      })

      // Then remove one
      const leftHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'user:left'
      )?.[1]

      act(() => {
        leftHandler?.({ userId: 'user-1' })
      })

      expect(result.current.onlineUsers).toHaveLength(1)
      expect(result.current.onlineUsers[0].id).toBe('user-2')
    })

    it('should not add duplicate users', () => {
      const { result } = renderHook(() => useRealtimeUpdates())

      const joinHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'user:joined'
      )?.[1]

      const user = { id: 'user-1', name: 'User 1', avatar: 'avatar1.jpg' }

      act(() => {
        joinHandler?.(user)
        joinHandler?.(user) // Try to add same user again
      })

      expect(result.current.onlineUsers).toHaveLength(1)
    })
  })

  describe('cleanup', () => {
    it('should cleanup event listeners on unmount', () => {
      const { unmount } = renderHook(() => useRealtimeUpdates())

      const eventTypes = ['notification', 'activity', 'users:online', 'user:joined', 'user:left']
      
      unmount()

      eventTypes.forEach(event => {
        expect(mockSocket.off).toHaveBeenCalledWith(event, expect.any(Function))
      })
    })

    it('should cleanup when socket changes', () => {
      const { rerender } = renderHook(() => useRealtimeUpdates())

      const newSocket = {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
        connected: true,
        id: 'socket-456'
      }

      mockUseSocket.mockReturnValue({
        ...mockSocketHook,
        socket: newSocket
      })

      rerender()

      // Should cleanup old socket listeners
      expect(mockSocket.off).toHaveBeenCalled()
      // Should setup new socket listeners
      expect(newSocket.on).toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('should handle malformed notification data', () => {
      const { result } = renderHook(() => useRealtimeUpdates())

      const notificationHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'notification'
      )?.[1]

      act(() => {
        notificationHandler?.({}) // Missing required fields
      })

      // Should not crash, but also not add invalid notification
      expect(result.current.notifications).toHaveLength(0)
    })

    it('should handle socket disconnection', () => {
      mockUseSocket.mockReturnValue({
        ...mockSocketHook,
        connected: false
      })

      const { result } = renderHook(() => useRealtimeUpdates())

      act(() => {
        result.current.subscribe('article', '123')
      })

      // Should not emit when disconnected
      expect(mockSocket.emit).not.toHaveBeenCalled()
    })

    it('should handle concurrent updates', () => {
      const { result } = renderHook(() => useRealtimeUpdates())

      const notificationHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'notification'
      )?.[1]

      const activityHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'activity'
      )?.[1]

      act(() => {
        // Simulate concurrent updates
        notificationHandler?.({ id: '1', type: 'test', message: 'Test', timestamp: '2024-01-01', read: false })
        activityHandler?.({ id: 'a1', type: 'view', user: { id: 'u1', name: 'User' }, data: {}, timestamp: '2024-01-01' })
        notificationHandler?.({ id: '2', type: 'test2', message: 'Test2', timestamp: '2024-01-02', read: false })
      })

      expect(result.current.notifications).toHaveLength(2)
      expect(result.current.activities).toHaveLength(1)
    })
  })
})