import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { apiClient } from '../api'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// Mock localStorage
const mockLocalStorage = () => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value }),
    removeItem: jest.fn((key: string) => { delete store[key] }),
    clear: jest.fn(() => { store = {} }),
  }
}

// Mock window.location
delete (window as any).location
window.location = { href: '' } as any

describe('apiClient', () => {
  let localStorageMock: ReturnType<typeof mockLocalStorage>
  let mockAxiosInstance: any

  beforeEach(() => {
    localStorageMock = mockLocalStorage()
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })

    // Reset window.location
    window.location.href = ''

    // Mock axios instance
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    }

    mockedAxios.create.mockReturnValue(mockAxiosInstance)

    // Clear all mocks
    jest.clearAllMocks()
  })

  describe('Initialization', () => {
    it('creates axios instance with correct configuration', () => {
      // Force re-initialization
      jest.resetModules()
      require('../api')

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:4000',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })

    it('uses NEXT_PUBLIC_API_URL when available', () => {
      process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com'
      
      jest.resetModules()
      require('../api')

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://api.example.com',
        })
      )

      delete process.env.NEXT_PUBLIC_API_URL
    })

    it('sets up request and response interceptors', () => {
      jest.resetModules()
      require('../api')

      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled()
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled()
    })
  })

  describe('Request Interceptor', () => {
    let requestInterceptor: (config: any) => any

    beforeEach(() => {
      jest.resetModules()
      require('../api')
      
      // Extract request interceptor
      requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0]
    })

    it('adds auth token to headers when available', () => {
      localStorageMock.getItem.mockReturnValue('test-token')
      
      const config = { headers: {} }
      const result = requestInterceptor(config)

      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_token')
      expect(result.headers.Authorization).toBe('Bearer test-token')
    })

    it('does not add auth header when token is not available', () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      const config = { headers: {} }
      const result = requestInterceptor(config)

      expect(result.headers.Authorization).toBeUndefined()
    })

    it('preserves existing headers', () => {
      localStorageMock.getItem.mockReturnValue('test-token')
      
      const config = { 
        headers: { 
          'X-Custom-Header': 'value' 
        } 
      }
      const result = requestInterceptor(config)

      expect(result.headers['X-Custom-Header']).toBe('value')
      expect(result.headers.Authorization).toBe('Bearer test-token')
    })
  })

  describe('Response Interceptor', () => {
    let responseInterceptor: any
    let errorInterceptor: (error: any) => Promise<any>

    beforeEach(() => {
      jest.resetModules()
      require('../api')
      
      // Extract response interceptors
      const interceptorCall = mockAxiosInstance.interceptors.response.use.mock.calls[0]
      responseInterceptor = interceptorCall[0]
      errorInterceptor = interceptorCall[1]
    })

    it('passes through successful responses', () => {
      const response = { data: 'test data' }
      const result = responseInterceptor(response)

      expect(result).toBe(response)
    })

    it('handles 401 errors by clearing token and redirecting', async () => {
      const error = {
        response: { status: 401, data: { message: 'Unauthorized' } }
      }

      await expect(errorInterceptor(error)).rejects.toEqual({
        message: 'Unauthorized',
        statusCode: 401,
        details: { message: 'Unauthorized' }
      })

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
      expect(window.location.href).toBe('/login')
    })

    it('formats error response correctly', async () => {
      const error = {
        response: {
          status: 400,
          data: {
            message: 'Bad request',
            code: 'INVALID_INPUT',
            details: { field: 'email' }
          }
        }
      }

      await expect(errorInterceptor(error)).rejects.toEqual({
        message: 'Bad request',
        code: 'INVALID_INPUT',
        statusCode: 400,
        details: {
          message: 'Bad request',
          code: 'INVALID_INPUT',
          details: { field: 'email' }
        }
      })
    })

    it('handles network errors', async () => {
      const error = {
        request: {},
        message: 'Network Error'
      }

      await expect(errorInterceptor(error)).rejects.toEqual({
        message: 'Network error - please check your connection',
        code: 'NETWORK_ERROR'
      })
    })

    it('handles unknown errors', async () => {
      const error = new Error('Something went wrong')

      await expect(errorInterceptor(error)).rejects.toEqual({
        message: 'Something went wrong',
        code: 'UNKNOWN_ERROR'
      })
    })
  })

  describe('HTTP Methods', () => {
    beforeEach(() => {
      jest.resetModules()
      const api = require('../api')
      
      // Setup mock responses
      mockAxiosInstance.get.mockResolvedValue({
        data: { data: 'get data', success: true }
      })
      mockAxiosInstance.post.mockResolvedValue({
        data: { data: 'post data', success: true }
      })
      mockAxiosInstance.put.mockResolvedValue({
        data: { data: 'put data', success: true }
      })
      mockAxiosInstance.patch.mockResolvedValue({
        data: { data: 'patch data', success: true }
      })
      mockAxiosInstance.delete.mockResolvedValue({
        data: { data: 'delete data', success: true }
      })
    })

    it('GET request works correctly', async () => {
      const result = await apiClient.get('/test-endpoint', { params: { id: 1 } })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test-endpoint', { params: { id: 1 } })
      expect(result).toBe('get data')
    })

    it('POST request works correctly', async () => {
      const data = { name: 'test' }
      const result = await apiClient.post('/test-endpoint', data)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test-endpoint', data, undefined)
      expect(result).toBe('post data')
    })

    it('PUT request works correctly', async () => {
      const data = { name: 'updated' }
      const result = await apiClient.put('/test-endpoint', data)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test-endpoint', data, undefined)
      expect(result).toBe('put data')
    })

    it('PATCH request works correctly', async () => {
      const data = { name: 'patched' }
      const result = await apiClient.patch('/test-endpoint', data)

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/test-endpoint', data, undefined)
      expect(result).toBe('patch data')
    })

    it('DELETE request works correctly', async () => {
      const result = await apiClient.delete('/test-endpoint')

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test-endpoint', undefined)
      expect(result).toBe('delete data')
    })

    it('passes config to requests', async () => {
      const config: AxiosRequestConfig = {
        headers: { 'X-Custom': 'value' },
        timeout: 5000
      }

      await apiClient.get('/test', config)
      await apiClient.post('/test', { data: 'test' }, config)
      await apiClient.put('/test', { data: 'test' }, config)
      await apiClient.patch('/test', { data: 'test' }, config)
      await apiClient.delete('/test', config)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', config)
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', { data: 'test' }, config)
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test', { data: 'test' }, config)
      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/test', { data: 'test' }, config)
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test', config)
    })
  })

  describe('Upload Method', () => {
    beforeEach(() => {
      jest.resetModules()
      require('../api')
      
      mockAxiosInstance.post.mockResolvedValue({
        data: { data: { url: 'uploaded-file.jpg' }, success: true }
      })
    })

    it('uploads file with progress tracking', async () => {
      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
      const progressCallback = jest.fn()

      const result = await apiClient.upload('/upload', file, progressCallback)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/upload',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: expect.any(Function)
        })
      )

      expect(result).toEqual({ url: 'uploaded-file.jpg' })
    })

    it('calls progress callback during upload', async () => {
      const file = new File(['test content'], 'test.jpg')
      const progressCallback = jest.fn()

      // Mock the post implementation to trigger progress
      mockAxiosInstance.post.mockImplementation((url, data, config) => {
        // Simulate progress events
        if (config?.onUploadProgress) {
          config.onUploadProgress({ loaded: 50, total: 100 })
          config.onUploadProgress({ loaded: 100, total: 100 })
        }
        return Promise.resolve({
          data: { data: { url: 'uploaded-file.jpg' }, success: true }
        })
      })

      await apiClient.upload('/upload', file, progressCallback)

      expect(progressCallback).toHaveBeenCalledWith(50)
      expect(progressCallback).toHaveBeenCalledWith(100)
    })

    it('handles upload without progress callback', async () => {
      const file = new File(['test content'], 'test.jpg')
      
      const result = await apiClient.upload('/upload', file)

      expect(result).toEqual({ url: 'uploaded-file.jpg' })
    })

    it('handles progress events without total', async () => {
      const file = new File(['test content'], 'test.jpg')
      const progressCallback = jest.fn()

      mockAxiosInstance.post.mockImplementation((url, data, config) => {
        if (config?.onUploadProgress) {
          config.onUploadProgress({ loaded: 50, total: undefined })
        }
        return Promise.resolve({
          data: { data: { url: 'uploaded-file.jpg' }, success: true }
        })
      })

      await apiClient.upload('/upload', file, progressCallback)

      expect(progressCallback).not.toHaveBeenCalled()
    })
  })

  describe('Error Scenarios', () => {
    beforeEach(() => {
      jest.resetModules()
      require('../api')
    })

    it('handles axios errors in requests', async () => {
      const axiosError = new Error('Request failed') as AxiosError
      axiosError.response = {
        status: 500,
        data: { message: 'Internal server error' },
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as any
      }

      mockAxiosInstance.get.mockRejectedValue(axiosError)

      await expect(apiClient.get('/test')).rejects.toThrow()
    })

    it('handles non-standard error responses', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { error: 'Something went wrong' } // No standard format
      })

      // This will throw because data.data is undefined
      await expect(apiClient.get('/test')).rejects.toThrow()
    })
  })

  describe('SSR Compatibility', () => {
    beforeEach(() => {
      jest.resetModules()
    })

    it('handles missing window object gracefully', () => {
      // Simulate SSR environment
      const originalWindow = global.window
      delete (global as any).window

      const api = require('../api')
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0]

      const config = { headers: {} }
      const result = requestInterceptor(config)

      expect(result.headers.Authorization).toBeUndefined()

      // Restore window
      global.window = originalWindow
    })
  })

  describe('Edge Cases', () => {
    beforeEach(() => {
      jest.resetModules()
      require('../api')
    })

    it('handles empty response data', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { data: null, success: true }
      })

      const result = await apiClient.get('/test')
      expect(result).toBeNull()
    })

    it('handles undefined response data', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { data: undefined, success: true }
      })

      const result = await apiClient.get('/test')
      expect(result).toBeUndefined()
    })

    it('handles concurrent requests', async () => {
      mockAxiosInstance.get
        .mockResolvedValueOnce({ data: { data: 'response1', success: true } })
        .mockResolvedValueOnce({ data: { data: 'response2', success: true } })
        .mockResolvedValueOnce({ data: { data: 'response3', success: true } })

      const [result1, result2, result3] = await Promise.all([
        apiClient.get('/test1'),
        apiClient.get('/test2'),
        apiClient.get('/test3')
      ])

      expect(result1).toBe('response1')
      expect(result2).toBe('response2')
      expect(result3).toBe('response3')
    })
  })
})