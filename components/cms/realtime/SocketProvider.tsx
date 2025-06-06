"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useSocket, type SocketState } from '@/hooks/useSocket'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

interface SocketContextType extends SocketState {
  emit: (event: string, data?: any) => void
  subscribe: (event: string, callback: (data: any) => void) => () => void
  joinRoom: (roomId: string) => void
  leaveRoom: (roomId: string) => void
  sendToRoom: (roomId: string, event: string, data: any) => void
}

const SocketContext = createContext<SocketContextType | null>(null)

export interface SocketProviderProps {
  children: React.ReactNode
  url?: string
  autoConnect?: boolean
  showConnectionToasts?: boolean
}

export function SocketProvider({ 
  children, 
  url,
  autoConnect = true,
  showConnectionToasts = true
}: SocketProviderProps) {
  const { user, isAuthenticated } = useAuth()
  const socket = useSocket(url)
  const [rooms, setRooms] = useState<Set<string>>(new Set())

  // Show connection status toasts
  useEffect(() => {
    if (!showConnectionToasts) return

    if (socket.isConnected) {
      toast.success('Connected to real-time updates')
    } else if (socket.error) {
      toast.error(`Connection error: ${socket.error}`)
    }
  }, [socket.isConnected, socket.error, showConnectionToasts])

  // Handle authentication changes
  useEffect(() => {
    if (autoConnect && isAuthenticated && user) {
      socket.connect()
    } else if (!isAuthenticated) {
      socket.disconnect()
    }
  }, [isAuthenticated, user, autoConnect, socket])

  const subscribe = useCallback((event: string, callback: (data: any) => void) => {
    return socket.addListener(event as any, callback)
  }, [socket])

  const joinRoom = useCallback((roomId: string) => {
    if (socket.isConnected) {
      socket.emit('join-room', { roomId })
      setRooms(prev => new Set([...prev, roomId]))
    }
  }, [socket])

  const leaveRoom = useCallback((roomId: string) => {
    if (socket.isConnected) {
      socket.emit('leave-room', { roomId })
      setRooms(prev => {
        const newRooms = new Set(prev)
        newRooms.delete(roomId)
        return newRooms
      })
    }
  }, [socket])

  const sendToRoom = useCallback((roomId: string, event: string, data: any) => {
    if (socket.isConnected) {
      socket.emit('room-message', { roomId, event, data })
    }
  }, [socket])

  // Cleanup rooms on disconnect
  useEffect(() => {
    if (!socket.isConnected) {
      setRooms(new Set())
    }
  }, [socket.isConnected])

  const contextValue: SocketContextType = {
    ...socket,
    subscribe,
    joinRoom,
    leaveRoom,
    sendToRoom,
  }

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocketContext() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider')
  }
  return context
}

/**
 * Hook for subscribing to specific socket events
 */
export function useSocketEvent<T = any>(
  event: string, 
  callback: (data: T) => void, 
  deps: React.DependencyList = []
) {
  const { subscribe } = useSocketContext()

  useEffect(() => {
    const unsubscribe = subscribe(event, callback)
    return unsubscribe
  }, [subscribe, event, ...deps])
}

/**
 * Hook for managing room subscriptions
 */
export function useSocketRoom(roomId: string) {
  const { joinRoom, leaveRoom, sendToRoom, isConnected } = useSocketContext()
  const [isJoined, setIsJoined] = useState(false)

  useEffect(() => {
    if (isConnected && roomId) {
      joinRoom(roomId)
      setIsJoined(true)

      return () => {
        leaveRoom(roomId)
        setIsJoined(false)
      }
    }
  }, [isConnected, roomId, joinRoom, leaveRoom])

  const sendMessage = useCallback((event: string, data: any) => {
    sendToRoom(roomId, event, data)
  }, [sendToRoom, roomId])

  return {
    isJoined,
    sendMessage,
    roomId,
  }
}

export default SocketProvider