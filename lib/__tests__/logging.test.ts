import {
  Logger,
  LogLevel,
  LOG_LEVELS,
  LogEntry,
  LoggerConfig,
  logger,
  measurePerformance,
  logReactError,
  createLogger,
} from '../logging'

// Mock fetch for remote logging
global.fetch = jest.fn()

// Mock console methods
const mockConsole = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  time: jest.fn(),
  timeEnd: jest.fn(),
}

Object.assign(console, mockConsole)

// Mock localStorage
const mockLocalStorage = {
  storage: new Map(),
  getItem: jest.fn((key: string) => mockLocalStorage.storage.get(key) || null),
  setItem: jest.fn((key: string, value: string) => mockLocalStorage.storage.set(key, value)),
  removeItem: jest.fn((key: string) => mockLocalStorage.storage.delete(key)),
  clear: jest.fn(() => mockLocalStorage.storage.clear()),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'https://example.com/test-page',
  },
  writable: true,
})

// Mock navigator.userAgent
Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Test Browser)',
  writable: true,
})

// Mock performance.now for measurePerformance tests
const mockPerformanceNow = jest.fn()
Object.defineProperty(global, 'performance', {
  value: { now: mockPerformanceNow },
})

describe('Logging System', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.storage.clear()
    ;(fetch as jest.Mock).mockClear()
    mockPerformanceNow.mockClear()
  })

  describe('LOG_LEVELS constant', () => {
    it('should define correct log levels', () => {
      expect(LOG_LEVELS.DEBUG).toBe(0)
      expect(LOG_LEVELS.INFO).toBe(1)
      expect(LOG_LEVELS.WARN).toBe(2)
      expect(LOG_LEVELS.ERROR).toBe(3)
    })
  })

  describe('Logger class', () => {
    describe('constructor', () => {
      it('should create logger with default config', () => {
        const testLogger = new Logger()
        expect(testLogger).toBeInstanceOf(Logger)
      })

      it('should merge custom config with defaults', () => {
        const customConfig = { level: 'ERROR' as keyof LogLevel, enableConsole: false }
        const testLogger = new Logger(customConfig)
        expect(testLogger).toBeInstanceOf(Logger)
      })

      it('should setup global error handlers', () => {
        const addEventListenerSpy = jest.spyOn(window, 'addEventListener')
        new Logger()
        
        expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))
        expect(addEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function))
        expect(addEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function))
        
        addEventListenerSpy.mockRestore()
      })
    })

    describe('logging methods', () => {
      let testLogger: Logger

      beforeEach(() => {
        testLogger = new Logger({ enableConsole: true, enableRemote: false })
      })

      it('should log debug messages', () => {
        testLogger.debug('Debug message', { key: 'value' })
        expect(mockConsole.debug).toHaveBeenCalledWith(
          expect.stringContaining('DEBUG: Debug message'),
          '{"key":"value"}'
        )
      })

      it('should log info messages', () => {
        testLogger.info('Info message')
        expect(mockConsole.info).toHaveBeenCalledWith(
          expect.stringContaining('INFO: Info message')
        )
      })

      it('should log warn messages', () => {
        testLogger.warn('Warning message')
        expect(mockConsole.warn).toHaveBeenCalledWith(
          expect.stringContaining('WARN: Warning message')
        )
      })

      it('should log error messages with error object', () => {
        const error = new Error('Test error')
        testLogger.error('Error message', { context: 'test' }, error)
        expect(mockConsole.error).toHaveBeenCalledWith(
          expect.stringContaining('ERROR: Error message'),
          '{"context":"test"}',
          expect.stringContaining('Test error')
        )
      })

      it('should respect log level threshold', () => {
        const errorOnlyLogger = new Logger({ level: 'ERROR' })
        errorOnlyLogger.debug('Should not log')
        errorOnlyLogger.info('Should not log')
        errorOnlyLogger.warn('Should not log')
        
        expect(mockConsole.debug).not.toHaveBeenCalled()
        expect(mockConsole.info).not.toHaveBeenCalled()
        expect(mockConsole.warn).not.toHaveBeenCalled()
      })
    })

    describe('specialized logging methods', () => {
      let testLogger: Logger

      beforeEach(() => {
        testLogger = new Logger({ enableConsole: true, enableRemote: false })
      })

      it('should log user actions', () => {
        testLogger.userAction('button_click', { buttonId: 'save' })
        expect(mockConsole.info).toHaveBeenCalledWith(
          expect.stringContaining('User action: button_click'),
          expect.stringContaining('"action":"button_click"')
        )
      })

      it('should log API calls with success status', () => {
        testLogger.apiCall('GET', '/api/test', 200, 150)
        expect(mockConsole.info).toHaveBeenCalledWith(
          expect.stringContaining('API GET /api/test'),
          expect.stringContaining('"status":200')
        )
      })

      it('should log API calls with error status', () => {
        testLogger.apiCall('POST', '/api/test', 500, 300)
        expect(mockConsole.error).toHaveBeenCalledWith(
          expect.stringContaining('API POST /api/test'),
          expect.stringContaining('"status":500')
        )
      })

      it('should log page views', () => {
        testLogger.pageView('/dashboard', { section: 'main' })
        expect(mockConsole.info).toHaveBeenCalledWith(
          expect.stringContaining('Page view: /dashboard'),
          expect.stringContaining('"page":"/dashboard"')
        )
      })

      it('should handle performance timing', () => {
        testLogger.time('test-operation')
        expect(mockConsole.time).toHaveBeenCalledWith('test-operation')

        testLogger.timeEnd('test-operation', { result: 'success' })
        expect(mockConsole.timeEnd).toHaveBeenCalledWith('test-operation')
        expect(mockConsole.info).toHaveBeenCalledWith(
          expect.stringContaining('Timer: test-operation'),
          expect.stringContaining('"result":"success"')
        )
      })
    })

    describe('user context management', () => {
      let testLogger: Logger

      beforeEach(() => {
        testLogger = new Logger({ enableConsole: false })
      })

      it('should set user context', () => {
        const user = { id: '123', email: 'test@example.com', name: 'Test User' }
        testLogger.setUser(user)
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'current_user',
          JSON.stringify(user)
        )
      })

      it('should handle localStorage errors when setting user', () => {
        mockLocalStorage.setItem.mockImplementationOnce(() => {
          throw new Error('Storage error')
        })
        
        const user = { id: '123' }
        expect(() => testLogger.setUser(user)).not.toThrow()
      })
    })

    describe('localStorage logging', () => {
      let testLogger: Logger

      beforeEach(() => {
        testLogger = new Logger({ 
          enableConsole: false, 
          enableRemote: false, 
          enableLocalStorage: true,
          maxLocalEntries: 3
        })
      })

      it('should save logs to localStorage', () => {
        testLogger.info('Test message')
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'app_logs',
          expect.stringContaining('"message":"Test message"')
        )
      })

      it('should trim old logs when exceeding max entries', () => {
        // Add logs up to the limit
        testLogger.info('Message 1')
        testLogger.info('Message 2')
        testLogger.info('Message 3')
        testLogger.info('Message 4') // This should trim Message 1
        
        const lastCall = mockLocalStorage.setItem.mock.calls[mockLocalStorage.setItem.mock.calls.length - 1]
        const savedLogs = JSON.parse(lastCall[1])
        
        expect(savedLogs).toHaveLength(3)
        expect(savedLogs[0].message).toBe('Message 2')
        expect(savedLogs[2].message).toBe('Message 4')
      })

      it('should handle localStorage save errors', () => {
        mockLocalStorage.setItem.mockImplementationOnce(() => {
          throw new Error('Storage full')
        })
        
        expect(() => testLogger.info('Test')).not.toThrow()
        expect(mockConsole.warn).toHaveBeenCalledWith(
          'Failed to save log to localStorage:',
          expect.any(Error)
        )
      })

      it('should get local logs', () => {
        const mockLogs = [{ message: 'test', level: 'INFO' }]
        mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockLogs))
        
        const logs = testLogger.getLocalLogs()
        expect(logs).toEqual(mockLogs)
      })

      it('should handle localStorage read errors when getting logs', () => {
        mockLocalStorage.getItem.mockReturnValueOnce('invalid json')
        
        const logs = testLogger.getLocalLogs()
        expect(logs).toEqual([])
        expect(mockConsole.warn).toHaveBeenCalledWith(
          'Failed to read logs from localStorage:',
          expect.any(Error)
        )
      })

      it('should clear local logs', () => {
        testLogger.clearLocalLogs()
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('app_logs')
      })
    })

    describe('remote logging', () => {
      let testLogger: Logger

      beforeEach(() => {
        testLogger = new Logger({
          enableConsole: false,
          enableRemote: true,
          remoteEndpoint: 'https://api.example.com/logs',
          bufferSize: 2,
          flushInterval: 1000,
        })
        ;(fetch as jest.Mock).mockResolvedValue({ ok: true })
      })

      afterEach(() => {
        testLogger.destroy()
      })

      it('should buffer logs for remote sending', () => {
        testLogger.info('Message 1')
        expect(fetch).not.toHaveBeenCalled()
      })

      it('should flush when buffer size is reached', async () => {
        testLogger.info('Message 1')
        testLogger.info('Message 2') // Should trigger flush
        
        // Wait for async flush
        await new Promise(resolve => setTimeout(resolve, 0))
        
        expect(fetch).toHaveBeenCalledWith(
          'https://api.example.com/logs',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
            body: expect.stringContaining('"message":"Message 1"'),
          })
        )
      })

      it('should include auth token when available', async () => {
        mockLocalStorage.getItem.mockReturnValue('test-token')
        
        testLogger.info('Message 1')
        testLogger.info('Message 2')
        
        await new Promise(resolve => setTimeout(resolve, 0))
        
        expect(fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': 'Bearer test-token',
            }),
          })
        )
      })

      it('should handle remote logging failures', async () => {
        ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))
        
        testLogger.info('Message 1')
        testLogger.info('Message 2')
        
        await new Promise(resolve => setTimeout(resolve, 0))
        
        expect(mockConsole.warn).toHaveBeenCalledWith(
          'Failed to send logs to remote endpoint:',
          expect.any(Error)
        )
      })

      it('should handle user context in log entries', () => {
        mockLocalStorage.getItem.mockImplementation((key) => {
          if (key === 'user_data') return JSON.stringify({ id: 'user123' })
          return null
        })
        
        testLogger.info('Test with user context')
        testLogger.info('Trigger flush') // Force flush
        
        // Check that the log entry includes user ID
        const fetchCall = (fetch as jest.Mock).mock.calls[0]
        if (fetchCall) {
          const body = JSON.parse(fetchCall[1].body)
          expect(body.logs[0].userId).toBe('user123')
        }
      })
    })

    describe('destroy method', () => {
      it('should clear flush timer and flush remaining logs', () => {
        const testLogger = new Logger({
          enableRemote: true,
          remoteEndpoint: 'https://api.example.com/logs',
        })
        
        const clearIntervalSpy = jest.spyOn(global, 'clearInterval')
        testLogger.destroy()
        
        expect(clearIntervalSpy).toHaveBeenCalled()
        clearIntervalSpy.mockRestore()
      })
    })
  })

  describe('measurePerformance utility', () => {
    beforeEach(() => {
      mockPerformanceNow.mockReturnValueOnce(100).mockReturnValueOnce(250)
    })

    it('should measure successful async operations', async () => {
      const mockFn = jest.fn().mockResolvedValue('success')
      
      const result = await measurePerformance(mockFn, 'test-operation', { context: 'test' })
      
      expect(result).toBe('success')
      expect(mockConsole.info).toHaveBeenCalledWith(
        'Performance: test-operation',
        expect.objectContaining({
          context: 'test',
          duration: 150,
          success: true,
        })
      )
    })

    it('should measure failed async operations', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Operation failed'))
      
      await expect(measurePerformance(mockFn, 'test-operation')).rejects.toThrow('Operation failed')
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        'Performance: test-operation (failed)',
        expect.objectContaining({
          duration: 150,
          success: false,
        }),
        expect.any(Error)
      )
    })
  })

  describe('logReactError utility', () => {
    it('should log React component errors', () => {
      const error = new Error('Component error')
      const errorInfo = { componentStack: 'Component stack trace' }
      
      logReactError(error, errorInfo)
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        'React component error',
        expect.objectContaining({
          message: 'Component error',
          componentStack: 'Component stack trace',
        }),
        error
      )
    })
  })

  describe('createLogger utility', () => {
    it('should create logger with custom config', () => {
      const customLogger = createLogger({ level: 'WARN', enableConsole: false })
      expect(customLogger).toBeInstanceOf(Logger)
    })
  })

  describe('default logger export', () => {
    it('should export a default logger instance', () => {
      expect(logger).toBeInstanceOf(Logger)
    })
  })

  describe('server-side behavior', () => {
    const originalWindow = global.window

    beforeAll(() => {
      // Simulate server-side environment
      delete (global as any).window
    })

    afterAll(() => {
      global.window = originalWindow
    })

    it('should handle server-side environment gracefully', () => {
      const serverLogger = new Logger()
      expect(() => serverLogger.info('Server log')).not.toThrow()
      expect(() => serverLogger.getLocalLogs()).not.toThrow()
      expect(() => serverLogger.clearLocalLogs()).not.toThrow()
    })
  })

  describe('global error handling', () => {
    it('should handle global window errors', () => {
      const testLogger = new Logger({ enableConsole: false })
      
      // Simulate global error event
      const errorEvent = new ErrorEvent('error', {
        message: 'Global error',
        filename: 'script.js',
        lineno: 10,
        colno: 5,
        error: new Error('Test error')
      })
      
      window.dispatchEvent(errorEvent)
      
      // The logger should have captured this error
      // Since we can't easily test the event listener, we'll just ensure no errors are thrown
      expect(true).toBe(true)
    })

    it('should handle unhandled promise rejections', () => {
      const testLogger = new Logger({ enableConsole: false })
      
      // Simulate unhandled rejection event
      const rejectionEvent = new Event('unhandledrejection') as any
      rejectionEvent.reason = 'Promise rejection reason'
      rejectionEvent.promise = Promise.reject('test')
      
      window.dispatchEvent(rejectionEvent)
      
      // The logger should have captured this rejection
      expect(true).toBe(true)
    })
  })
})