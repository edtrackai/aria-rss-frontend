import { renderHook, act } from '@testing-library/react'
import { useTheme } from '../useTheme'
import { useTheme as useNextTheme } from 'next-themes'

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn()
}))

const mockUseNextTheme = useNextTheme as jest.MockedFunction<typeof useNextTheme>

describe('useTheme', () => {
  const mockNextTheme = {
    theme: 'light',
    setTheme: jest.fn(),
    systemTheme: 'light',
    themes: ['light', 'dark', 'system'],
    resolvedTheme: 'light'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseNextTheme.mockReturnValue(mockNextTheme as any)
  })

  describe('initial state', () => {
    it('should return current theme from next-themes', () => {
      const { result } = renderHook(() => useTheme())
      
      expect(result.current.theme).toBe('light')
      expect(result.current.systemTheme).toBe('light')
      expect(result.current.resolvedTheme).toBe('light')
    })

    it('should handle undefined theme', () => {
      mockUseNextTheme.mockReturnValue({
        ...mockNextTheme,
        theme: undefined,
        resolvedTheme: undefined
      } as any)

      const { result } = renderHook(() => useTheme())
      
      expect(result.current.theme).toBeUndefined()
      expect(result.current.resolvedTheme).toBeUndefined()
    })
  })

  describe('theme switching', () => {
    it('should set theme to dark', () => {
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.setTheme('dark')
      })

      expect(mockNextTheme.setTheme).toHaveBeenCalledWith('dark')
    })

    it('should set theme to light', () => {
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.setTheme('light')
      })

      expect(mockNextTheme.setTheme).toHaveBeenCalledWith('light')
    })

    it('should set theme to system', () => {
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.setTheme('system')
      })

      expect(mockNextTheme.setTheme).toHaveBeenCalledWith('system')
    })

    it('should toggle theme from light to dark', () => {
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.toggleTheme()
      })

      expect(mockNextTheme.setTheme).toHaveBeenCalledWith('dark')
    })

    it('should toggle theme from dark to light', () => {
      mockUseNextTheme.mockReturnValue({
        ...mockNextTheme,
        theme: 'dark',
        resolvedTheme: 'dark'
      } as any)

      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.toggleTheme()
      })

      expect(mockNextTheme.setTheme).toHaveBeenCalledWith('light')
    })

    it('should use resolved theme for toggle when theme is system', () => {
      mockUseNextTheme.mockReturnValue({
        ...mockNextTheme,
        theme: 'system',
        resolvedTheme: 'dark',
        systemTheme: 'dark'
      } as any)

      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.toggleTheme()
      })

      expect(mockNextTheme.setTheme).toHaveBeenCalledWith('light')
    })
  })

  describe('theme detection', () => {
    it('should detect dark theme', () => {
      mockUseNextTheme.mockReturnValue({
        ...mockNextTheme,
        theme: 'dark',
        resolvedTheme: 'dark'
      } as any)

      const { result } = renderHook(() => useTheme())
      
      expect(result.current.isDark).toBe(true)
      expect(result.current.isLight).toBe(false)
      expect(result.current.isSystem).toBe(false)
    })

    it('should detect light theme', () => {
      const { result } = renderHook(() => useTheme())
      
      expect(result.current.isDark).toBe(false)
      expect(result.current.isLight).toBe(true)
      expect(result.current.isSystem).toBe(false)
    })

    it('should detect system theme', () => {
      mockUseNextTheme.mockReturnValue({
        ...mockNextTheme,
        theme: 'system'
      } as any)

      const { result } = renderHook(() => useTheme())
      
      expect(result.current.isDark).toBe(false)
      expect(result.current.isLight).toBe(false)
      expect(result.current.isSystem).toBe(true)
    })

    it('should detect dark mode when system theme is dark', () => {
      mockUseNextTheme.mockReturnValue({
        ...mockNextTheme,
        theme: 'system',
        resolvedTheme: 'dark',
        systemTheme: 'dark'
      } as any)

      const { result } = renderHook(() => useTheme())
      
      expect(result.current.isDarkMode).toBe(true)
    })

    it('should detect light mode when system theme is light', () => {
      mockUseNextTheme.mockReturnValue({
        ...mockNextTheme,
        theme: 'system',
        resolvedTheme: 'light',
        systemTheme: 'light'
      } as any)

      const { result } = renderHook(() => useTheme())
      
      expect(result.current.isDarkMode).toBe(false)
    })
  })

  describe('available themes', () => {
    it('should return list of available themes', () => {
      const { result } = renderHook(() => useTheme())
      
      expect(result.current.themes).toEqual(['light', 'dark', 'system'])
    })

    it('should handle custom theme list', () => {
      mockUseNextTheme.mockReturnValue({
        ...mockNextTheme,
        themes: ['light', 'dark', 'system', 'custom']
      } as any)

      const { result } = renderHook(() => useTheme())
      
      expect(result.current.themes).toEqual(['light', 'dark', 'system', 'custom'])
    })
  })

  describe('edge cases', () => {
    it('should handle missing setTheme function', () => {
      mockUseNextTheme.mockReturnValue({
        ...mockNextTheme,
        setTheme: undefined
      } as any)

      const { result } = renderHook(() => useTheme())

      expect(() => {
        act(() => {
          result.current.setTheme('dark')
        })
      }).not.toThrow()
    })

    it('should handle theme changes', () => {
      const { result, rerender } = renderHook(() => useTheme())
      
      expect(result.current.theme).toBe('light')

      // Simulate theme change
      mockUseNextTheme.mockReturnValue({
        ...mockNextTheme,
        theme: 'dark',
        resolvedTheme: 'dark'
      } as any)

      rerender()

      expect(result.current.theme).toBe('dark')
      expect(result.current.isDark).toBe(true)
    })

    it('should handle undefined resolved theme for toggle', () => {
      mockUseNextTheme.mockReturnValue({
        ...mockNextTheme,
        theme: undefined,
        resolvedTheme: undefined
      } as any)

      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.toggleTheme()
      })

      // Should default to setting dark theme
      expect(mockNextTheme.setTheme).toHaveBeenCalledWith('dark')
    })

    it('should memoize boolean flags', () => {
      const { result, rerender } = renderHook(() => useTheme())
      
      const isDark1 = result.current.isDark
      const isLight1 = result.current.isLight
      
      rerender()
      
      const isDark2 = result.current.isDark
      const isLight2 = result.current.isLight
      
      expect(isDark1).toBe(isDark2)
      expect(isLight1).toBe(isLight2)
    })

    it('should handle all theme types', () => {
      const themes = ['light', 'dark', 'system']
      
      themes.forEach(theme => {
        mockUseNextTheme.mockReturnValue({
          ...mockNextTheme,
          theme,
          resolvedTheme: theme === 'system' ? 'light' : theme
        } as any)

        const { result } = renderHook(() => useTheme())
        
        expect(result.current.theme).toBe(theme)
      })
    })
  })
})