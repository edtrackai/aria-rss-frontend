"use client"

import { useEffect, useState, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './useAuth'

export interface SocketState {
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  lastMessage: any
  connectionId: string | null
}

export interface SocketEventMap {
  connect: () => void
  disconnect: (reason: string) => void
  error: (error: Error) => void
  message: (data: any) => void
  notification: (notification: any) => void
  presence: (data: { userId: string; status: 'online' | 'offline' }) => void
  typing: (data: { userId: string; roomId: string; isTyping: boolean }) => void
  roomJoined: (data: { roomId: string; users: string[] }) => void
  roomLeft: (data: { roomId: string }) => void
  userJoined: (data: { userId: string; roomId: string; user: any }) => void
  userLeft: (data: { userId: string; roomId: string }) => void
  articleUpdate: (data: { articleId: string; changes: any }) => void
  commentAdded: (data: { articleId: string; comment: any }) => void
  metricsUpdate: (data: { metrics: any }) => void
}

export type SocketEventName = keyof SocketEventMap

export function useSocket(url?: string) {
  const { user, isAuthenticated } = useAuth()
  const [state, setState] = useState<SocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    lastMessage: null,
    connectionId: null,
  })

  const socketRef = useRef<Socket | null>(null)
  const listenersRef = useRef<Map<string, Set<Function>>>(new Map())
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttempts = useRef(0)

  const socketUrl = url || process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000'

  const addListener = useCallback(<T extends SocketEventName>(
    event: T,
    callback: SocketEventMap[T]
  ) => {
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set())
    }
    listenersRef.current.get(event)!.add(callback)

    // Add to socket if connected
    if (socketRef.current) {
      socketRef.current.on(event, callback as any)
    }

    return () => {
      listenersRef.current.get(event)?.delete(callback)
      if (socketRef.current) {
        socketRef.current.off(event, callback as any)
      }
    }
  }, [])

  const removeListener = useCallback(<T extends SocketEventName>(
    event: T,
    callback: SocketEventMap[T]
  ) => {
    listenersRef.current.get(event)?.delete(callback)
    if (socketRef.current) {
      socketRef.current.off(event, callback as any)
    }
  }, [])

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data)
    } else {
      console.warn('Socket not connected, cannot emit event:', event)
    }
  }, [])

  const connect = useCallback(() => {
    if (socketRef.current?.connected || !isAuthenticated) {
      return
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }))

    const token = localStorage.getItem('auth_token')
    
    const socket = io(socketUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })

    // Handle connection events
    socket.on('connect', () => {
      setState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        error: null,
        connectionId: socket.id || null,
      }))
      reconnectAttempts.current = 0
    })

    socket.on('disconnect', (reason) => {
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        connectionId: null,
      }))

      // Attempt reconnection for certain disconnect reasons
      if (reason === 'io server disconnect') {
        // Server disconnected, manual reconnection needed
        setTimeout(() => {
          if (reconnectAttempts.current < 5) {
            reconnectAttempts.current++
            connect()
          }
        }, 2000 * reconnectAttempts.current)
      }
    })

    socket.on('connect_error', (error) => {
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: error.message,
      }))
    })

    // Add all registered listeners
    listenersRef.current.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        socket.on(event, callback as any)
      })
    })

    socketRef.current = socket
  }, [socketUrl, isAuthenticated])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }

    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      connectionId: null,
    }))
  }, [])

  // Auto-connect when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [isAuthenticated, user, connect, disconnect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    ...state,
    connect,
    disconnect,
    emit,
    addListener,
    removeListener,
    socket: socketRef.current,
  }
}

/**
 * Hook for managing room-based communication
 */
export function useSocketRoom(roomId: string) {
  const socket = useSocket()
  const [members, setMembers] = useState<string[]>([])
  const [isJoined, setIsJoined] = useState(false)

  const joinRoom = useCallback(() => {
    if (socket.isConnected && roomId) {
      socket.emit('join-room', { roomId })
    }
  }, [socket, roomId])

  const leaveRoom = useCallback(() => {
    if (socket.isConnected && roomId) {
      socket.emit('leave-room', { roomId })
    }
  }, [socket, roomId])

  const sendToRoom = useCallback((event: string, data: any) => {
    if (socket.isConnected && roomId) {
      socket.emit('room-message', { roomId, event, data })
    }
  }, [socket, roomId])

  useEffect(() => {
    if (!socket.isConnected) return

    const handleRoomJoined = (data: { roomId: string; users: string[] }) => {
      if (data.roomId === roomId) {
        setMembers(data.users)
        setIsJoined(true)
      }
    }

    const handleRoomLeft = (data: { roomId: string }) => {
      if (data.roomId === roomId) {
        setIsJoined(false)
        setMembers([])
      }
    }

    const handleUserJoined = (data: { roomId: string; userId: string }) => {
      if (data.roomId === roomId) {
        setMembers(prev => [...prev, data.userId])
      }
    }

    const handleUserLeft = (data: { roomId: string; userId: string }) => {
      if (data.roomId === roomId) {
        setMembers(prev => prev.filter(id => id !== data.userId))
      }
    }

    const unsubscribes = [
      socket.addListener('roomJoined', handleRoomJoined),
      socket.addListener('roomLeft', handleRoomLeft),
      socket.addListener('userJoined', handleUserJoined),
      socket.addListener('userLeft', handleUserLeft),
    ]

    // Auto-join room when connected
    joinRoom()

    return () => {
      unsubscribes.forEach(unsub => unsub())
      leaveRoom()
    }
  }, [socket, roomId, joinRoom, leaveRoom])

  return {
    members,
    isJoined,
    joinRoom,
    leaveRoom,
    sendToRoom,
    ...socket,
  }
}

/**
 * Hook for typing indicators
 */
export function useTypingIndicator(roomId: string) {
  const socket = useSocket()
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const startTyping = useCallback(() => {
    if (socket.isConnected && roomId) {
      socket.emit('typing-start', { roomId })
    }
  }, [socket, roomId])

  const stopTyping = useCallback(() => {
    if (socket.isConnected && roomId) {
      socket.emit('typing-stop', { roomId })
    }
  }, [socket, roomId])

  const handleTyping = useCallback(() => {
    startTyping()

    // Auto-stop typing after 3 seconds of inactivity
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    typingTimeoutRef.current = setTimeout(stopTyping, 3000)
  }, [startTyping, stopTyping])

  useEffect(() => {
    if (!socket.isConnected) return

    const handleTypingUpdate = (data: { userId: string; roomId: string; isTyping: boolean }) => {
      if (data.roomId === roomId) {
        setTypingUsers(prev => {
          const newSet = new Set(prev)
          if (data.isTyping) {
            newSet.add(data.userId)
          } else {
            newSet.delete(data.userId)
          }
          return newSet
        })
      }
    }

    const unsubscribe = socket.addListener('typing', handleTypingUpdate)

    return () => {
      unsubscribe()
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [socket, roomId])

  return {
    typingUsers: Array.from(typingUsers),
    isTyping: typingUsers.size > 0,
    startTyping: handleTyping,
    stopTyping,
  }
}

export default useSocket