import React from 'react'
import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, useTheme } from '../ThemeProvider'

// Mock matchMedia
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

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

describe('ThemeProvider', () => {
  let localStorageMock: ReturnType<typeof mockLocalStorage>
  
  beforeEach(() => {
    localStorageMock = mockLocalStorage()
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })
    
    // Reset document classes
    document.documentElement.className = ''
    
    // Mock system theme as light by default
    mockMatchMedia(false)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Functionality', () => {
    it('renders children correctly', () => {
      render(
        <ThemeProvider>
          <div>Test Child</div>
        </ThemeProvider>
      )
      
      expect(screen.getByText('Test Child')).toBeInTheDocument()
    })

    it('provides theme context to children', () => {
      const TestComponent = () => {
        const { theme, actualTheme } = useTheme()
        return (
          <div>
            <div data-testid="theme">{theme}</div>
            <div data-testid="actual-theme">{actualTheme}</div>
          </div>
        )
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(screen.getByTestId('theme')).toHaveTextContent('system')
      expect(screen.getByTestId('actual-theme')).toHaveTextContent('light')
    })

    it('applies default theme from props', () => {
      const TestComponent = () => {
        const { theme } = useTheme()
        return <div data-testid="theme">{theme}</div>
      }

      render(
        <ThemeProvider defaultTheme="dark">
          <TestComponent />
        </ThemeProvider>
      )

      expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    })
  })

  describe('Theme Persistence', () => {
    it('loads theme from localStorage on mount', async () => {
      localStorageMock.getItem.mockReturnValue('dark')

      const TestComponent = () => {
        const { theme } = useTheme()
        return <div data-testid="theme">{theme}</div>
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(localStorageMock.getItem).toHaveBeenCalledWith('theme')
        expect(screen.getByTestId('theme')).toHaveTextContent('dark')
      })
    })

    it('saves theme to localStorage when changed', async () => {
      const TestComponent = () => {
        const { theme, setTheme } = useTheme()
        return (
          <div>
            <div data-testid="theme">{theme}</div>
            <button onClick={() => setTheme('dark')}>Set Dark</button>
          </div>
        )
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      const button = screen.getByRole('button', { name: 'Set Dark' })
      await userEvent.click(button)

      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark')
    })

    it('uses custom storage key when provided', async () => {
      localStorageMock.getItem.mockReturnValue('light')

      render(
        <ThemeProvider storageKey="custom-theme-key">
          <div>Test</div>
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(localStorageMock.getItem).toHaveBeenCalledWith('custom-theme-key')
      })
    })

    it('handles localStorage errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to load theme from localStorage:',
          expect.any(Error)
        )
      })

      consoleSpy.mockRestore()
    })
  })

  describe('System Theme Detection', () => {
    it('detects system dark theme preference', async () => {
      mockMatchMedia(true) // System prefers dark

      const TestComponent = () => {
        const { systemTheme, actualTheme } = useTheme()
        return (
          <div>
            <div data-testid="system-theme">{systemTheme}</div>
            <div data-testid="actual-theme">{actualTheme}</div>
          </div>
        )
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('system-theme')).toHaveTextContent('dark')
        expect(screen.getByTestId('actual-theme')).toHaveTextContent('dark')
      })
    })

    it('responds to system theme changes', async () => {
      let listener: ((e: MediaQueryListEvent) => void) | null = null
      const mockAddEventListener = jest.fn((event, handler) => {
        if (event === 'change') listener = handler
      })

      window.matchMedia = jest.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: mockAddEventListener,
        removeEventListener: jest.fn(),
      }))

      const TestComponent = () => {
        const { systemTheme } = useTheme()
        return <div data-testid="system-theme">{systemTheme}</div>
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(screen.getByTestId('system-theme')).toHaveTextContent('light')

      // Simulate system theme change
      act(() => {
        listener?.({ matches: true } as MediaQueryListEvent)
      })

      await waitFor(() => {
        expect(screen.getByTestId('system-theme')).toHaveTextContent('dark')
      })
    })

    it('removes event listener on unmount', () => {
      const mockRemoveEventListener = jest.fn()
      window.matchMedia = jest.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: mockRemoveEventListener,
      }))

      const { unmount } = render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      unmount()

      expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })
  })

  describe('Theme Application', () => {
    it('applies light theme class to document root', async () => {
      render(
        <ThemeProvider defaultTheme="light">
          <div>Test</div>
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(document.documentElement.classList.contains('light')).toBe(true)
        expect(document.documentElement.classList.contains('dark')).toBe(false)
      })
    })

    it('applies dark theme class to document root', async () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <div>Test</div>
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true)
        expect(document.documentElement.classList.contains('light')).toBe(false)
      })
    })

    it('updates CSS custom properties for dark theme', async () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <div>Test</div>
        </ThemeProvider>
      )

      await waitFor(() => {
        const styles = document.documentElement.style
        expect(styles.getPropertyValue('--background')).toBe('222.2% 84% 4.9%')
        expect(styles.getPropertyValue('--foreground')).toBe('210% 40% 98%')
      })
    })

    it('updates CSS custom properties for light theme', async () => {
      render(
        <ThemeProvider defaultTheme="light">
          <div>Test</div>
        </ThemeProvider>
      )

      await waitFor(() => {
        const styles = document.documentElement.style
        expect(styles.getPropertyValue('--background')).toBe('0 0% 100%')
        expect(styles.getPropertyValue('--foreground')).toBe('222.2% 84% 4.9%')
      })
    })
  })

  describe('Theme Toggle', () => {
    it('toggles through light -> dark -> system', async () => {
      const TestComponent = () => {
        const { theme, toggleTheme } = useTheme()
        return (
          <div>
            <div data-testid="theme">{theme}</div>
            <button onClick={toggleTheme}>Toggle</button>
          </div>
        )
      }

      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>
      )

      const button = screen.getByRole('button', { name: 'Toggle' })
      
      expect(screen.getByTestId('theme')).toHaveTextContent('light')

      await userEvent.click(button)
      expect(screen.getByTestId('theme')).toHaveTextContent('dark')

      await userEvent.click(button)
      expect(screen.getByTestId('theme')).toHaveTextContent('system')

      await userEvent.click(button)
      expect(screen.getByTestId('theme')).toHaveTextContent('light')
    })
  })

  describe('Hydration', () => {
    it('prevents hydration mismatch by not rendering theme classes initially', () => {
      // Simulate SSR environment
      const { container } = render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      )

      // Initially should not have theme classes (before mount)
      const initialHTML = container.innerHTML
      expect(initialHTML).toContain('Test')
      
      // After mount, theme should be applied
      act(() => {
        // Trigger mount effect
        jest.runAllTimers()
      })
    })
  })

  describe('Error Handling', () => {
    it('throws error when useTheme is used outside provider', () => {
      const TestComponent = () => {
        useTheme()
        return null
      }

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      expect(() => {
        render(<TestComponent />)
      }).toThrow('useTheme must be used within a ThemeProvider')

      consoleSpy.mockRestore()
    })

    it('handles invalid theme values from localStorage', async () => {
      localStorageMock.getItem.mockReturnValue('invalid-theme')

      const TestComponent = () => {
        const { theme } = useTheme()
        return <div data-testid="theme">{theme}</div>
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      // Should fall back to default theme
      expect(screen.getByTestId('theme')).toHaveTextContent('system')
    })
  })

  describe('Edge Cases', () => {
    it('handles rapid theme changes', async () => {
      const TestComponent = () => {
        const { theme, setTheme } = useTheme()
        return (
          <div>
            <div data-testid="theme">{theme}</div>
            <button onClick={() => setTheme('light')}>Light</button>
            <button onClick={() => setTheme('dark')}>Dark</button>
            <button onClick={() => setTheme('system')}>System</button>
          </div>
        )
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      const lightButton = screen.getByRole('button', { name: 'Light' })
      const darkButton = screen.getByRole('button', { name: 'Dark' })
      const systemButton = screen.getByRole('button', { name: 'System' })

      // Rapid clicks
      await userEvent.click(lightButton)
      await userEvent.click(darkButton)
      await userEvent.click(systemButton)
      await userEvent.click(lightButton)

      expect(screen.getByTestId('theme')).toHaveTextContent('light')
      expect(localStorageMock.setItem).toHaveBeenLastCalledWith('theme', 'light')
    })

    it('maintains theme across re-renders', () => {
      const TestComponent = () => {
        const { theme } = useTheme()
        const [count, setCount] = React.useState(0)
        return (
          <div>
            <div data-testid="theme">{theme}</div>
            <div data-testid="count">{count}</div>
            <button onClick={() => setCount(c => c + 1)}>Increment</button>
          </div>
        )
      }

      render(
        <ThemeProvider defaultTheme="dark">
          <TestComponent />
        </ThemeProvider>
      )

      expect(screen.getByTestId('theme')).toHaveTextContent('dark')

      // Trigger re-render
      const button = screen.getByRole('button', { name: 'Increment' })
      userEvent.click(button)

      expect(screen.getByTestId('theme')).toHaveTextContent('dark')
      expect(screen.getByTestId('count')).toHaveTextContent('1')
    })
  })

  describe('Integration Scenarios', () => {
    it('works with nested theme consumers', () => {
      const NestedComponent = () => {
        const { actualTheme } = useTheme()
        return <div data-testid="nested-theme">{actualTheme}</div>
      }

      const TestComponent = () => {
        const { theme, setTheme } = useTheme()
        return (
          <div>
            <div data-testid="theme">{theme}</div>
            <NestedComponent />
            <button onClick={() => setTheme('dark')}>Set Dark</button>
          </div>
        )
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(screen.getByTestId('theme')).toHaveTextContent('system')
      expect(screen.getByTestId('nested-theme')).toHaveTextContent('light')

      const button = screen.getByRole('button', { name: 'Set Dark' })
      userEvent.click(button)

      expect(screen.getByTestId('nested-theme')).toHaveTextContent('dark')
    })
  })
})