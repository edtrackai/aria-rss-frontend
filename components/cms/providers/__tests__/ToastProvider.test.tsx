import React from 'react'
import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider, useToast, useApiErrorHandler, useAsyncToast } from '../ToastProvider'

// Mock Radix UI Toast components
jest.mock('@/components/ui/toast', () => ({
  Toast: ({ children }: any) => <div data-testid="toast">{children}</div>,
  ToastProvider: ({ children }: any) => <div>{children}</div>,
  ToastTitle: ({ children }: any) => <div data-testid="toast-title">{children}</div>,
  ToastDescription: ({ children }: any) => <div data-testid="toast-description">{children}</div>,
  ToastClose: ({ children }: any) => <button data-testid="toast-close">{children}</button>,
  ToastAction: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}))

jest.mock('@/components/ui/toaster', () => ({
  Toaster: () => <div data-testid="toaster" />,
}))

// Mock timers
jest.useFakeTimers()

describe('ToastProvider', () => {
  afterEach(() => {
    jest.clearAllTimers()
    jest.clearAllMocks()
  })

  describe('Basic Functionality', () => {
    it('renders children and toaster', () => {
      render(
        <ToastProvider>
          <div>Test Child</div>
        </ToastProvider>
      )
      
      expect(screen.getByText('Test Child')).toBeInTheDocument()
      expect(screen.getByTestId('toaster')).toBeInTheDocument()
    })

    it('provides toast context to children', () => {
      const TestComponent = () => {
        const { toasts } = useToast()
        return (
          <div>
            <div data-testid="toast-count">{toasts.length}</div>
          </div>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      expect(screen.getByTestId('toast-count')).toHaveTextContent('0')
    })
  })

  describe('Toast Management', () => {
    const TestComponent = () => {
      const { toast, toasts, dismiss, dismissAll } = useToast()
      
      return (
        <div>
          <div data-testid="toast-count">{toasts.length}</div>
          <div data-testid="toasts">
            {toasts.map(t => (
              <div key={t.id} data-testid={`toast-${t.id}`}>
                {t.title} - {t.description}
              </div>
            ))}
          </div>
          <button onClick={() => toast({ title: 'Test Toast' })}>
            Add Toast
          </button>
          <button onClick={() => dismiss(toasts[0]?.id)}>
            Dismiss First
          </button>
          <button onClick={dismissAll}>
            Dismiss All
          </button>
        </div>
      )
    }

    it('adds toasts correctly', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      const addButton = screen.getByRole('button', { name: 'Add Toast' })
      
      await userEvent.click(addButton)
      
      expect(screen.getByTestId('toast-count')).toHaveTextContent('1')
      expect(screen.getByText('Test Toast -')).toBeInTheDocument()
    })

    it('auto-dismisses toasts after duration', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      const addButton = screen.getByRole('button', { name: 'Add Toast' })
      await userEvent.click(addButton)

      expect(screen.getByTestId('toast-count')).toHaveTextContent('1')

      // Fast-forward time to trigger auto-dismiss
      act(() => {
        jest.advanceTimersByTime(5000)
      })

      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('0')
      })
    })

    it('dismisses specific toast', async () => {
      const TestComponentWithDismiss = () => {
        const { toast, toasts, dismiss } = useToast()
        
        return (
          <div>
            <div data-testid="toast-count">{toasts.length}</div>
            <button onClick={() => toast({ title: 'Toast 1' })}>Add 1</button>
            <button onClick={() => toast({ title: 'Toast 2' })}>Add 2</button>
            <button onClick={() => toasts[0] && dismiss(toasts[0].id)}>
              Dismiss First
            </button>
          </div>
        )
      }

      render(
        <ToastProvider>
          <TestComponentWithDismiss />
        </ToastProvider>
      )

      await userEvent.click(screen.getByRole('button', { name: 'Add 1' }))
      await userEvent.click(screen.getByRole('button', { name: 'Add 2' }))

      expect(screen.getByTestId('toast-count')).toHaveTextContent('2')

      await userEvent.click(screen.getByRole('button', { name: 'Dismiss First' }))

      expect(screen.getByTestId('toast-count')).toHaveTextContent('1')
    })

    it('dismisses all toasts', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      const addButton = screen.getByRole('button', { name: 'Add Toast' })
      
      // Add multiple toasts
      await userEvent.click(addButton)
      await userEvent.click(addButton)
      await userEvent.click(addButton)

      expect(screen.getByTestId('toast-count')).toHaveTextContent('3')

      await userEvent.click(screen.getByRole('button', { name: 'Dismiss All' }))

      expect(screen.getByTestId('toast-count')).toHaveTextContent('0')
    })

    it('respects maxToasts limit', async () => {
      render(
        <ToastProvider maxToasts={3}>
          <TestComponent />
        </ToastProvider>
      )

      const addButton = screen.getByRole('button', { name: 'Add Toast' })
      
      // Add more than max toasts
      for (let i = 0; i < 5; i++) {
        await userEvent.click(addButton)
      }

      expect(screen.getByTestId('toast-count')).toHaveTextContent('3')
    })
  })

  describe('Toast Variants', () => {
    const TestComponent = () => {
      const { success, error, warning, info, toasts } = useToast()
      
      return (
        <div>
          <div data-testid="toasts">
            {toasts.map(t => (
              <div key={t.id} data-testid={`toast-${t.variant}`}>
                {t.title}
              </div>
            ))}
          </div>
          <button onClick={() => success('Success', 'Operation completed')}>
            Success
          </button>
          <button onClick={() => error('Error', 'Something went wrong')}>
            Error
          </button>
          <button onClick={() => warning('Warning', 'Be careful')}>
            Warning
          </button>
          <button onClick={() => info('Info', 'Just so you know')}>
            Info
          </button>
        </div>
      )
    }

    it('creates success toast with correct variant', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      await userEvent.click(screen.getByRole('button', { name: 'Success' }))
      
      expect(screen.getByTestId('toast-success')).toHaveTextContent('Success')
    })

    it('creates error toast with correct variant', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      await userEvent.click(screen.getByRole('button', { name: 'Error' }))
      
      expect(screen.getByTestId('toast-destructive')).toHaveTextContent('Error')
    })

    it('creates warning toast with correct variant', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      await userEvent.click(screen.getByRole('button', { name: 'Warning' }))
      
      expect(screen.getByTestId('toast-warning')).toHaveTextContent('Warning')
    })

    it('creates info toast with correct variant', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      await userEvent.click(screen.getByRole('button', { name: 'Info' }))
      
      expect(screen.getByTestId('toast-default')).toHaveTextContent('Info')
    })
  })

  describe('Toast with Actions', () => {
    it('handles toast with action button', async () => {
      const mockAction = jest.fn()
      
      const TestComponent = () => {
        const { toast } = useToast()
        
        return (
          <button 
            onClick={() => toast({
              title: 'Action Toast',
              action: {
                label: 'Undo',
                onClick: mockAction
              }
            })}
          >
            Add Toast with Action
          </button>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      await userEvent.click(screen.getByRole('button', { name: 'Add Toast with Action' }))

      const actionButton = screen.getByRole('button', { name: 'Undo' })
      await userEvent.click(actionButton)

      expect(mockAction).toHaveBeenCalled()
    })
  })

  describe('useApiErrorHandler Hook', () => {
    it('handles API errors correctly', async () => {
      const TestComponent = () => {
        const { handleApiError } = useApiErrorHandler()
        const { toasts } = useToast()
        
        return (
          <div>
            <div data-testid="toast-count">{toasts.length}</div>
            <button 
              onClick={() => handleApiError({ 
                response: { data: { message: 'API Error' } } 
              })}
            >
              Trigger API Error
            </button>
          </div>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      await userEvent.click(screen.getByRole('button', { name: 'Trigger API Error' }))

      expect(screen.getByTestId('toast-count')).toHaveTextContent('1')
    })

    it('uses default message when API error has no message', async () => {
      const TestComponent = () => {
        const { handleApiError } = useApiErrorHandler()
        const { toasts } = useToast()
        
        return (
          <div>
            <div data-testid="toasts">
              {toasts.map(t => (
                <div key={t.id}>{t.description}</div>
              ))}
            </div>
            <button 
              onClick={() => handleApiError({}, 'Custom default')}
            >
              Trigger Error
            </button>
          </div>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      await userEvent.click(screen.getByRole('button', { name: 'Trigger Error' }))

      expect(screen.getByText('Custom default')).toBeInTheDocument()
    })
  })

  describe('useAsyncToast Hook', () => {
    it('shows loading, success, and handles result', async () => {
      const TestComponent = () => {
        const { executeWithToast } = useAsyncToast()
        const { toasts } = useToast()
        const [result, setResult] = React.useState<string | null>(null)
        
        const handleClick = async () => {
          const res = await executeWithToast(
            async () => {
              await new Promise(resolve => setTimeout(resolve, 100))
              return 'Success Result'
            },
            {
              loadingMessage: 'Loading...',
              successMessage: 'Done!',
              showLoading: true
            }
          )
          setResult(res)
        }
        
        return (
          <div>
            <div data-testid="toasts">
              {toasts.map(t => (
                <div key={t.id} data-testid={`toast-${t.id}`}>
                  {t.title}
                </div>
              ))}
            </div>
            <div data-testid="result">{result}</div>
            <button onClick={handleClick}>Execute</button>
          </div>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      await userEvent.click(screen.getByRole('button', { name: 'Execute' }))

      // Should show loading toast
      expect(screen.getByText('Loading...')).toBeInTheDocument()

      // Fast-forward to complete the operation
      await act(async () => {
        jest.advanceTimersByTime(200)
      })

      // Should show success message and result
      await waitFor(() => {
        expect(screen.getByTestId('result')).toHaveTextContent('Success Result')
      })
    })

    it('handles errors in async operations', async () => {
      const TestComponent = () => {
        const { executeWithToast } = useAsyncToast()
        const { toasts } = useToast()
        const [error, setError] = React.useState<string | null>(null)
        
        const handleClick = async () => {
          try {
            await executeWithToast(
              async () => {
                throw new Error('Test error')
              },
              {
                errorMessage: 'Operation failed'
              }
            )
          } catch (err) {
            setError((err as Error).message)
          }
        }
        
        return (
          <div>
            <div data-testid="toasts">
              {toasts.map(t => (
                <div key={t.id}>{t.description}</div>
              ))}
            </div>
            <div data-testid="error">{error}</div>
            <button onClick={handleClick}>Execute</button>
          </div>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      await userEvent.click(screen.getByRole('button', { name: 'Execute' }))

      await waitFor(() => {
        expect(screen.getByText('Test error')).toBeInTheDocument()
        expect(screen.getByTestId('error')).toHaveTextContent('Test error')
      })
    })

    it('executes without showing loading toast', async () => {
      const TestComponent = () => {
        const { executeWithToast } = useAsyncToast()
        const { toasts } = useToast()
        
        const handleClick = async () => {
          await executeWithToast(
            async () => 'Done',
            {
              successMessage: 'Completed',
              showLoading: false
            }
          )
        }
        
        return (
          <div>
            <div data-testid="toast-count">{toasts.length}</div>
            <button onClick={handleClick}>Execute</button>
          </div>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      await userEvent.click(screen.getByRole('button', { name: 'Execute' }))

      // Should directly show success without loading
      await waitFor(() => {
        expect(screen.getByTestId('toast-count')).toHaveTextContent('1')
      })
    })
  })

  describe('Error Handling', () => {
    it('throws error when useToast is used outside provider', () => {
      const TestComponent = () => {
        useToast()
        return null
      }

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      expect(() => {
        render(<TestComponent />)
      }).toThrow('useToast must be used within a ToastProvider')

      consoleSpy.mockRestore()
    })
  })

  describe('Edge Cases', () => {
    it('handles rapid toast additions', async () => {
      const TestComponent = () => {
        const { toast, toasts } = useToast()
        
        return (
          <div>
            <div data-testid="toast-count">{toasts.length}</div>
            <button onClick={() => {
              for (let i = 0; i < 10; i++) {
                toast({ title: `Toast ${i}` })
              }
            }}>
              Add Many
            </button>
          </div>
        )
      }

      render(
        <ToastProvider maxToasts={5}>
          <TestComponent />
        </ToastProvider>
      )

      await userEvent.click(screen.getByRole('button', { name: 'Add Many' }))

      expect(screen.getByTestId('toast-count')).toHaveTextContent('5')
    })

    it('handles toasts with zero duration', async () => {
      const TestComponent = () => {
        const { toast, toasts } = useToast()
        
        return (
          <div>
            <div data-testid="toast-count">{toasts.length}</div>
            <button onClick={() => toast({ title: 'Persistent', duration: 0 })}>
              Add Persistent
            </button>
          </div>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      await userEvent.click(screen.getByRole('button', { name: 'Add Persistent' }))

      expect(screen.getByTestId('toast-count')).toHaveTextContent('1')

      // Fast-forward time - toast should still be there
      act(() => {
        jest.advanceTimersByTime(10000)
      })

      expect(screen.getByTestId('toast-count')).toHaveTextContent('1')
    })

    it('handles concurrent dismiss operations', async () => {
      const TestComponent = () => {
        const { toast, toasts, dismiss } = useToast()
        
        return (
          <div>
            <div data-testid="toast-count">{toasts.length}</div>
            <button onClick={() => {
              const id1 = toast({ title: 'Toast 1' })
              const id2 = toast({ title: 'Toast 2' })
              // Immediately dismiss both
              dismiss(id1)
              dismiss(id2)
            }}>
              Add and Dismiss
            </button>
          </div>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      await userEvent.click(screen.getByRole('button', { name: 'Add and Dismiss' }))

      expect(screen.getByTestId('toast-count')).toHaveTextContent('0')
    })
  })
})