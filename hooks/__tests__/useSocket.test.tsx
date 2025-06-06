import { renderHook, act, waitFor } from '@testing-library/react'
import { useSocket } from '../useSocket'
import io from 'socket.io-client'

// Mock socket.io-client
jest.mock('socket.io-client')

const mockIo = io as jest.MockedFunction<typeof io>

describe('useSocket', () => {
  let mockSocket: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockSocket = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
      connected: false,
      id: 'socket-123'
    }

    mockIo.mockReturnValue(mockSocket)
  })

  describe('initialization', () => {
    it('should initialize with disconnected state', () => {
      const { result } = renderHook(() => useSocket())
      
      expect(result.current.socket).toBeNull()
      expect(result.current.connected).toBe(false)
    })

    it('should not auto-connect by default', () => {
      renderHook(() => useSocket())
      
      expect(mockIo).not.toHaveBeenCalled()
      expect(mockSocket.connect).not.toHaveBeenCalled()
    })

    it('should auto-connect when specified', () => {
      renderHook(() => useSocket(true))
      
      expect(mockIo).toHaveBeenCalledWith(
        process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000',
        expect.objectContaining({
          autoConnect: false
        })
      )
      expect(mockSocket.connect).toHaveBeenCalled()
    })
  })

  describe('connection management', () => {
    it('should connect to socket server', () => {
      const { result } = renderHook(() => useSocket())

      act(() => {
        result.current.connect()
      })

      expect(mockIo).toHaveBeenCalledWith(
        process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000',
        expect.objectContaining({
          autoConnect: false,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000
        })
      )
      expect(mockSocket.connect).toHaveBeenCalled()
      expect(result.current.socket).toBe(mockSocket)
    })

    it('should not create multiple connections', () => {
      const { result } = renderHook(() => useSocket())

      act(() => {
        result.current.connect()
        result.current.connect()
      })

      expect(mockIo).toHaveBeenCalledTimes(1)
    })

    it('should disconnect from socket server', () => {
      const { result } = renderHook(() => useSocket())

      act(() => {
        result.current.connect()
      })

      act(() => {
        result.current.disconnect()
      })

      expect(mockSocket.disconnect).toHaveBeenCalled()
      expect(result.current.socket).toBeNull()
      expect(result.current.connected).toBe(false)
    })

    it('should handle authentication on connect', () => {
      localStorage.setItem('accessToken', 'test-token')
      
      const { result } = renderHook(() => useSocket())

      act(() => {
        result.current.connect()
      })

      expect(mockIo).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          auth: { token: 'test-token' }
        })
      )
    })
  })

  describe('event handling', () => {
    it('should update connected state on connect', () => {
      const { result } = renderHook(() => useSocket())

      act(() => {
        result.current.connect()
      })

      // Simulate connect event
      const connectHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'connect'
      )?.[1]

      act(() => {
        mockSocket.connected = true
        connectHandler?.()
      })

      expect(result.current.connected).toBe(true)
    })

    it('should update connected state on disconnect', () => {
      const { result } = renderHook(() => useSocket())

      act(() => {
        result.current.connect()
      })

      // First connect
      const connectHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'connect'
      )?.[1]

      act(() => {
        mockSocket.connected = true
        connectHandler?.()
      })

      // Then disconnect
      const disconnectHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'disconnect'
      )?.[1]

      act(() => {
        mockSocket.connected = false
        disconnectHandler?.()
      })

      expect(result.current.connected).toBe(false)
    })

    it('should handle connection errors', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const { result } = renderHook(() => useSocket())

      act(() => {
        result.current.connect()
      })

      const errorHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'connect_error'
      )?.[1]

      const mockError = new Error('Connection failed')
      
      act(() => {
        errorHandler?.(mockError)
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith('Socket connection error:', mockError)
      
      consoleErrorSpy.mockRestore()
    })

    it('should handle reconnection attempts', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
      const { result } = renderHook(() => useSocket())

      act(() => {
        result.current.connect()
      })

      const reconnectHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'reconnect_attempt'
      )?.[1]

      act(() => {
        reconnectHandler?.(3)
      })

      expect(consoleLogSpy).toHaveBeenCalledWith('Reconnection attempt:', 3)
      
      consoleLogSpy.mockRestore()
    })

    it('should handle successful reconnection', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
      const { result } = renderHook(() => useSocket())

      act(() => {
        result.current.connect()
      })

      const reconnectHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'reconnect'
      )?.[1]

      act(() => {
        mockSocket.connected = true
        reconnectHandler?.(2)
      })

      expect(consoleLogSpy).toHaveBeenCalledWith('Reconnected after', 2, 'attempts')
      expect(result.current.connected).toBe(true)
      
      consoleLogSpy.mockRestore()
    })

    it('should handle reconnection failure', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const { result } = renderHook(() => useSocket())

      act(() => {
        result.current.connect()
      })

      const reconnectFailedHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'reconnect_failed'
      )?.[1]

      act(() => {
        reconnectFailedHandler?.()
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith('Reconnection failed')
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('cleanup', () => {
    it('should cleanup on unmount', () => {
      const { unmount } = renderHook(() => useSocket())

      act(() => {
        unmount.current?.connect()
      })

      unmount()

      const eventTypes = [
        'connect',
        'disconnect',
        'connect_error',
        'reconnect_attempt',
        'reconnect',
        'reconnect_failed'
      ]

      eventTypes.forEach(event => {
        expect(mockSocket.off).toHaveBeenCalledWith(event, expect.any(Function))
      })

      expect(mockSocket.disconnect).toHaveBeenCalled()
    })

    it('should not throw if disconnecting when not connected', () => {
      const { result } = renderHook(() => useSocket())

      expect(() => {
        act(() => {
          result.current.disconnect()
        })
      }).not.toThrow()
    })
  })

  describe('edge cases', () => {
    it('should handle missing WebSocket URL', () => {
      delete process.env.NEXT_PUBLIC_WS_URL
      
      const { result } = renderHook(() => useSocket())

      act(() => {
        result.current.connect()
      })

      expect(mockIo).toHaveBeenCalledWith(
        'http://localhost:4000',
        expect.any(Object)
      )
    })

    it('should handle socket creation failure', () => {
      mockIo.mockImplementationOnce(() => {
        throw new Error('Failed to create socket')
      })

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const { result } = renderHook(() => useSocket())

      act(() => {
        result.current.connect()
      })

      expect(result.current.socket).toBeNull()
      expect(result.current.connected).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })

    it('should handle token updates', () => {
      const { result } = renderHook(() => useSocket())

      // Connect without token
      act(() => {
        result.current.connect()
      })

      expect(mockIo).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          auth: {}
        })
      )

      // Disconnect and set token
      act(() => {
        result.current.disconnect()
      })

      localStorage.setItem('accessToken', 'new-token')

      // Reconnect with token
      act(() => {
        result.current.connect()
      })

      expect(mockIo).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({
          auth: { token: 'new-token' }
        })
      )
    })

    it('should handle rapid connect/disconnect calls', () => {
      const { result } = renderHook(() => useSocket())

      act(() => {
        result.current.connect()
        result.current.disconnect()
        result.current.connect()
        result.current.disconnect()
      })

      expect(mockSocket.connect).toHaveBeenCalledTimes(2)
      expect(mockSocket.disconnect).toHaveBeenCalledTimes(2)
    })

    it('should expose socket instance', () => {
      const { result } = renderHook(() => useSocket())

      expect(result.current.socket).toBeNull()

      act(() => {
        result.current.connect()
      })

      expect(result.current.socket).toBe(mockSocket)
      expect(result.current.socket?.emit).toBeDefined()
      expect(result.current.socket?.on).toBeDefined()
    })
  })
})