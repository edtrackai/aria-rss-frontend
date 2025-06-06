export interface LogLevel {
  DEBUG: 0
  INFO: 1
  WARN: 2
  ERROR: 3
}

export const LOG_LEVELS: LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
}

export interface LogEntry {
  timestamp: string
  level: keyof LogLevel
  message: string
  context?: Record<string, any>
  userId?: string
  sessionId?: string
  url?: string
  userAgent?: string
  error?: Error
}

export interface LoggerConfig {
  level: keyof LogLevel
  enableConsole: boolean
  enableRemote: boolean
  remoteEndpoint?: string
  bufferSize: number
  flushInterval: number
  enableLocalStorage: boolean
  maxLocalEntries: number
}

const DEFAULT_CONFIG: LoggerConfig = {
  level: process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG',
  enableConsole: process.env.NODE_ENV !== 'production',
  enableRemote: true,
  remoteEndpoint: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/logs` : undefined,
  bufferSize: 50,
  flushInterval: 30000, // 30 seconds
  enableLocalStorage: true,
  maxLocalEntries: 1000,
}

class Logger {
  private config: LoggerConfig
  private buffer: LogEntry[] = []
  private flushTimer?: NodeJS.Timeout
  private sessionId: string

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.sessionId = this.generateSessionId()
    
    if (this.config.enableRemote) {
      this.startFlushTimer()
    }

    // Handle page unload to flush remaining logs
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush()
      })

      // Handle errors globally
      window.addEventListener('error', (event) => {
        this.error('Global error caught', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error
        })
      })

      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.error('Unhandled promise rejection', {
          reason: event.reason,
          promise: event.promise
        })
      })
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private shouldLog(level: keyof LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level]
  }

  private createLogEntry(
    level: keyof LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      sessionId: this.sessionId,
      error,
    }

    if (typeof window !== 'undefined') {
      entry.url = window.location.href
      entry.userAgent = navigator.userAgent
      
      // Try to get user ID from auth
      try {
        const userData = localStorage.getItem('user_data')
        if (userData) {
          const user = JSON.parse(userData)
          entry.userId = user.id
        }
      } catch (e) {
        // Ignore errors reading user data
      }
    }

    return entry
  }

  private log(
    level: keyof LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): void {
    if (!this.shouldLog(level)) {
      return
    }

    const entry = this.createLogEntry(level, message, context, error)

    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(entry)
    }

    // Buffer for remote logging
    if (this.config.enableRemote) {
      this.buffer.push(entry)
      
      if (this.buffer.length >= this.config.bufferSize) {
        this.flush()
      }
    }

    // Local storage logging
    if (this.config.enableLocalStorage && typeof window !== 'undefined') {
      this.logToLocalStorage(entry)
    }
  }

  private logToConsole(entry: LogEntry): void {
    const { level, message, context, error } = entry
    const timestamp = new Date(entry.timestamp).toLocaleTimeString()
    
    const logMethod = {
      DEBUG: console.debug,
      INFO: console.info,
      WARN: console.warn,
      ERROR: console.error,
    }[level]

    const args = [`[${timestamp}] ${level}: ${message}`]
    
    if (context) {
      args.push(JSON.stringify(context))
    }
    
    if (error) {
      args.push(error.stack || error.message || String(error))
    }

    logMethod(...args)
  }

  private logToLocalStorage(entry: LogEntry): void {
    try {
      const storageKey = 'app_logs'
      const stored = localStorage.getItem(storageKey)
      const logs: LogEntry[] = stored ? JSON.parse(stored) : []
      
      logs.push(entry)
      
      // Trim logs if exceeding max entries
      if (logs.length > this.config.maxLocalEntries) {
        logs.splice(0, logs.length - this.config.maxLocalEntries)
      }
      
      localStorage.setItem(storageKey, JSON.stringify(logs))
    } catch (error) {
      console.warn('Failed to save log to localStorage:', error)
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush()
    }, this.config.flushInterval)
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0 || !this.config.remoteEndpoint) {
      return
    }

    const logsToSend = [...this.buffer]
    this.buffer = []

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ logs: logsToSend }),
      })
    } catch (error) {
      // If sending fails, put logs back in buffer
      this.buffer.unshift(...logsToSend)
      console.warn('Failed to send logs to remote endpoint:', error)
    }
  }

  // Public logging methods
  debug(message: string, context?: Record<string, any>): void {
    this.log('DEBUG', message, context)
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('INFO', message, context)
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('WARN', message, context)
  }

  error(message: string, context?: Record<string, any>, error?: Error): void {
    this.log('ERROR', message, context, error)
  }

  // Performance logging
  time(label: string): void {
    if (typeof window !== 'undefined' && console.time) {
      console.time(label)
    }
  }

  timeEnd(label: string, context?: Record<string, any>): void {
    if (typeof window !== 'undefined' && console.timeEnd) {
      console.timeEnd(label)
    }
    this.info(`Timer: ${label}`, context)
  }

  // User action logging
  userAction(action: string, context?: Record<string, any>): void {
    this.info(`User action: ${action}`, {
      action,
      ...context,
    })
  }

  // API call logging
  apiCall(method: string, url: string, status?: number, duration?: number): void {
    const level = status && status >= 400 ? 'ERROR' : 'INFO'
    this.log(level, `API ${method} ${url}`, {
      method,
      url,
      status,
      duration,
    })
  }

  // User context management
  setUser(user: { id: string; email?: string; name?: string }): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('current_user', JSON.stringify(user))
        this.info('User context updated', { userId: user.id })
      } catch (error) {
        this.warn('Failed to save user context', { error: error instanceof Error ? error.message : String(error) })
      }
    }
  }

  // Page view logging
  pageView(page: string, context?: Record<string, any>): void {
    this.info(`Page view: ${page}`, {
      page,
      ...context,
    })
  }

  // Get logs from localStorage
  getLocalLogs(): LogEntry[] {
    if (typeof window === 'undefined') {
      return []
    }

    try {
      const stored = localStorage.getItem('app_logs')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.warn('Failed to read logs from localStorage:', error)
      return []
    }
  }

  // Clear local logs
  clearLocalLogs(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('app_logs')
    }
  }

  // Destroy logger
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    this.flush()
  }
}

// Create default logger instance
export const logger = new Logger()

// Performance measurement utilities
export function measurePerformance<T>(
  fn: () => Promise<T>,
  label: string,
  context?: Record<string, any>
): Promise<T> {
  const start = performance.now()
  
  return fn().then(
    (result) => {
      const duration = performance.now() - start
      logger.info(`Performance: ${label}`, {
        ...context,
        duration: Math.round(duration),
        success: true,
      })
      return result
    },
    (error) => {
      const duration = performance.now() - start
      logger.error(`Performance: ${label} (failed)`, {
        ...context,
        duration: Math.round(duration),
        success: false,
      }, error)
      throw error
    }
  )
}

// React error boundary logging
export function logReactError(error: Error, errorInfo: { componentStack: string }): void {
  logger.error('React component error', {
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
  }, error)
}

// Create logger with custom config
export function createLogger(config: Partial<LoggerConfig>): Logger {
  return new Logger(config)
}

export default logger