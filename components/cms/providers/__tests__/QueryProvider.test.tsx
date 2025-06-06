import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, useQuery, useMutation } from '@tanstack/react-query'
import { 
  QueryProvider, 
  useOptimisticMutation, 
  useInfiniteScroll, 
  useRealtimeQuery,
  useCachedApi 
} from '../QueryProvider'

// Mock React Query Devtools
jest.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => null,
}))

describe('QueryProvider', () => {
  describe('Basic Functionality', () => {
    it('renders children correctly', () => {
      render(
        <QueryProvider>
          <div>Test Child</div>
        </QueryProvider>
      )
      
      expect(screen.getByText('Test Child')).toBeInTheDocument()
    })

    it('provides QueryClient to children', async () => {
      const TestComponent = () => {
        const { data } = useQuery({
          queryKey: ['test'],
          queryFn: async () => 'test data',
        })
        
        return <div data-testid="data">{data || 'loading'}</div>
      }

      render(
        <QueryProvider>
          <TestComponent />
        </QueryProvider>
      )

      expect(screen.getByTestId('data')).toHaveTextContent('loading')

      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('test data')
      })
    })

    it('configures default options correctly', async () => {
      let retryCount = 0
      const TestComponent = () => {
        const { data, error } = useQuery({
          queryKey: ['retry-test'],
          queryFn: async () => {
            retryCount++
            if (retryCount < 3) {
              throw new Error('Test error')
            }
            return 'success'
          },
        })
        
        return (
          <div>
            <div data-testid="data">{data || 'no data'}</div>
            <div data-testid="error">{error?.message || 'no error'}</div>
            <div data-testid="retry-count">{retryCount}</div>
          </div>
        )
      }

      render(
        <QueryProvider>
          <TestComponent />
        </QueryProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('success')
        expect(screen.getByTestId('retry-count')).toHaveTextContent('3')
      })
    })

    it('does not retry on 4xx errors', async () => {
      let callCount = 0
      const TestComponent = () => {
        const { error } = useQuery({
          queryKey: ['no-retry-test'],
          queryFn: async () => {
            callCount++
            const error: any = new Error('Client error')
            error.status = 400
            throw error
          },
        })
        
        return (
          <div>
            <div data-testid="error">{error?.message || 'no error'}</div>
            <div data-testid="call-count">{callCount}</div>
          </div>
        )
      }

      render(
        <QueryProvider>
          <TestComponent />
        </QueryProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Client error')
        expect(screen.getByTestId('call-count')).toHaveTextContent('1')
      })
    })

    it('retries on 408 and 429 errors', async () => {
      let callCount = 0
      const TestComponent = () => {
        const { data, error } = useQuery({
          queryKey: ['retry-special-test'],
          queryFn: async () => {
            callCount++
            if (callCount === 1) {
              const error: any = new Error('Request timeout')
              error.status = 408
              throw error
            }
            return 'success'
          },
        })
        
        return (
          <div>
            <div data-testid="data">{data || 'no data'}</div>
            <div data-testid="call-count">{callCount}</div>
          </div>
        )
      }

      render(
        <QueryProvider>
          <TestComponent />
        </QueryProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('success')
        expect(screen.getByTestId('call-count')).toHaveTextContent('2')
      })
    })
  })

  describe('useOptimisticMutation Hook', () => {
    it('optimistically updates data', async () => {
      const TestComponent = () => {
        const queryClient = new QueryClient()
        
        // Set initial data
        queryClient.setQueryData(['items'], ['item1', 'item2'])
        
        const mutation = useOptimisticMutation(
          async (newItem: string) => {
            await new Promise(resolve => setTimeout(resolve, 100))
            return newItem
          },
          {
            queryKey: ['items'],
            updateFn: (oldData: string[], newItem: string) => [...oldData, newItem],
            onSuccess: (data) => {
              console.log('Success:', data)
            }
          }
        )
        
        const data = queryClient.getQueryData<string[]>(['items'])
        
        return (
          <div>
            <div data-testid="items">{data?.join(',')}</div>
            <button onClick={() => mutation.mutate('item3')}>Add Item</button>
            <div data-testid="is-pending">{mutation.isPending ? 'yes' : 'no'}</div>
          </div>
        )
      }

      render(
        <QueryProvider>
          <TestComponent />
        </QueryProvider>
      )

      expect(screen.getByTestId('items')).toHaveTextContent('item1,item2')

      await userEvent.click(screen.getByRole('button', { name: 'Add Item' }))

      // Should update optimistically
      await waitFor(() => {
        expect(screen.getByTestId('items')).toHaveTextContent('item1,item2,item3')
      })
    })

    it('rolls back on error', async () => {
      const TestComponent = () => {
        const queryClient = new QueryClient()
        queryClient.setQueryData(['items'], ['item1', 'item2'])
        
        const mutation = useOptimisticMutation(
          async () => {
            throw new Error('Update failed')
          },
          {
            queryKey: ['items'],
            updateFn: (oldData: string[]) => [...oldData, 'item3'],
            onError: (error) => {
              console.log('Error:', error)
            }
          }
        )
        
        const data = queryClient.getQueryData<string[]>(['items'])
        
        return (
          <div>
            <div data-testid="items">{data?.join(',')}</div>
            <button onClick={() => mutation.mutate('item3')}>Add Item</button>
            <div data-testid="error">{mutation.error?.message || 'no error'}</div>
          </div>
        )
      }

      render(
        <QueryProvider>
          <TestComponent />
        </QueryProvider>
      )

      await userEvent.click(screen.getByRole('button', { name: 'Add Item' }))

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Update failed')
        // Should rollback to original data
        expect(screen.getByTestId('items')).toHaveTextContent('item1,item2')
      })
    })
  })

  describe('useInfiniteScroll Hook', () => {
    it('handles infinite scroll data', async () => {
      const TestComponent = () => {
        const { items, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteScroll(
          ['infinite-test'],
          async ({ pageParam }) => ({
            data: [`page${pageParam}-item1`, `page${pageParam}-item2`],
            nextPage: pageParam < 3 ? pageParam + 1 : undefined,
            hasMore: pageParam < 3,
          })
        )
        
        return (
          <div>
            <div data-testid="items">{items.join(',')}</div>
            <div data-testid="has-next">{hasNextPage ? 'yes' : 'no'}</div>
            <div data-testid="is-fetching">{isFetchingNextPage ? 'yes' : 'no'}</div>
            <button onClick={() => fetchNextPage()}>Load More</button>
          </div>
        )
      }

      render(
        <QueryProvider>
          <TestComponent />
        </QueryProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('items')).toHaveTextContent('page1-item1,page1-item2')
      })
    })

    it('handles loading states correctly', () => {
      const TestComponent = () => {
        const { isLoading, isError } = useInfiniteScroll(
          ['loading-test'],
          async () => {
            await new Promise(() => {}) // Never resolves
            return { data: [], hasMore: false }
          }
        )
        
        return (
          <div>
            <div data-testid="is-loading">{isLoading ? 'yes' : 'no'}</div>
            <div data-testid="is-error">{isError ? 'yes' : 'no'}</div>
          </div>
        )
      }

      render(
        <QueryProvider>
          <TestComponent />
        </QueryProvider>
      )

      expect(screen.getByTestId('is-loading')).toHaveTextContent('yes')
      expect(screen.getByTestId('is-error')).toHaveTextContent('no')
    })
  })

  describe('useRealtimeQuery Hook', () => {
    it('fetches data with realtime configuration', async () => {
      const TestComponent = () => {
        const { data, isLoading } = useRealtimeQuery(
          ['realtime-test'],
          async () => 'realtime data',
          {
            enabled: true,
            refetchInterval: 1000,
          }
        )
        
        return (
          <div>
            <div data-testid="data">{data || 'no data'}</div>
            <div data-testid="is-loading">{isLoading ? 'yes' : 'no'}</div>
          </div>
        )
      }

      render(
        <QueryProvider>
          <TestComponent />
        </QueryProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('realtime data')
      })
    })

    it('respects enabled option', () => {
      const queryFn = jest.fn()
      const TestComponent = () => {
        const { data } = useRealtimeQuery(
          ['disabled-test'],
          queryFn,
          {
            enabled: false,
          }
        )
        
        return <div data-testid="data">{data || 'no data'}</div>
      }

      render(
        <QueryProvider>
          <TestComponent />
        </QueryProvider>
      )

      expect(queryFn).not.toHaveBeenCalled()
      expect(screen.getByTestId('data')).toHaveTextContent('no data')
    })
  })

  describe('useCachedApi Hook', () => {
    it('caches API responses', async () => {
      let callCount = 0
      const TestComponent = () => {
        const { data } = useCachedApi(
          'cached-test',
          async () => {
            callCount++
            return `data-${callCount}`
          },
          {
            staleTime: 60000,
          }
        )
        
        return (
          <div>
            <div data-testid="data">{data || 'no data'}</div>
            <div data-testid="call-count">{callCount}</div>
          </div>
        )
      }

      const { rerender } = render(
        <QueryProvider>
          <TestComponent />
        </QueryProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('data-1')
      })

      // Re-render component
      rerender(
        <QueryProvider>
          <TestComponent />
        </QueryProvider>
      )

      // Should use cached data
      expect(screen.getByTestId('call-count')).toHaveTextContent('1')
    })

    it('refetches in background based on sync interval', async () => {
      jest.useFakeTimers()
      
      let callCount = 0
      const TestComponent = () => {
        const { data } = useCachedApi(
          'sync-test',
          async () => {
            callCount++
            return `data-${callCount}`
          },
          {
            syncInterval: 1000,
          }
        )
        
        return (
          <div>
            <div data-testid="data">{data || 'no data'}</div>
            <div data-testid="call-count">{callCount}</div>
          </div>
        )
      }

      render(
        <QueryProvider>
          <TestComponent />
        </QueryProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('data-1')
      })

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(2000)
      })

      await waitFor(() => {
        expect(screen.getByTestId('call-count')).toHaveTextContent('2')
      })

      jest.useRealTimers()
    })
  })

  describe('Mutation Configuration', () => {
    it('does not retry mutations on 4xx errors', async () => {
      let callCount = 0
      const TestComponent = () => {
        const mutation = useMutation({
          mutationFn: async () => {
            callCount++
            const error: any = new Error('Bad request')
            error.status = 400
            throw error
          },
        })
        
        return (
          <div>
            <button onClick={() => mutation.mutate()}>Mutate</button>
            <div data-testid="call-count">{callCount}</div>
            <div data-testid="error">{mutation.error?.message || 'no error'}</div>
          </div>
        )
      }

      render(
        <QueryProvider>
          <TestComponent />
        </QueryProvider>
      )

      await userEvent.click(screen.getByRole('button', { name: 'Mutate' }))

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Bad request')
        expect(screen.getByTestId('call-count')).toHaveTextContent('1')
      })
    })

    it('retries mutations on 5xx errors once', async () => {
      let callCount = 0
      const TestComponent = () => {
        const mutation = useMutation({
          mutationFn: async () => {
            callCount++
            if (callCount === 1) {
              const error: any = new Error('Server error')
              error.status = 500
              throw error
            }
            return 'success'
          },
        })
        
        return (
          <div>
            <button onClick={() => mutation.mutate()}>Mutate</button>
            <div data-testid="call-count">{callCount}</div>
            <div data-testid="data">{mutation.data || 'no data'}</div>
          </div>
        )
      }

      render(
        <QueryProvider>
          <TestComponent />
        </QueryProvider>
      )

      await userEvent.click(screen.getByRole('button', { name: 'Mutate' }))

      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent('success')
        expect(screen.getByTestId('call-count')).toHaveTextContent('2')
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles concurrent queries', async () => {
      const TestComponent = () => {
        const query1 = useQuery({
          queryKey: ['concurrent-1'],
          queryFn: async () => {
            await new Promise(resolve => setTimeout(resolve, 50))
            return 'data1'
          }
        })
        
        const query2 = useQuery({
          queryKey: ['concurrent-2'],
          queryFn: async () => {
            await new Promise(resolve => setTimeout(resolve, 100))
            return 'data2'
          }
        })
        
        return (
          <div>
            <div data-testid="data1">{query1.data || 'loading'}</div>
            <div data-testid="data2">{query2.data || 'loading'}</div>
          </div>
        )
      }

      render(
        <QueryProvider>
          <TestComponent />
        </QueryProvider>
      )

      expect(screen.getByTestId('data1')).toHaveTextContent('loading')
      expect(screen.getByTestId('data2')).toHaveTextContent('loading')

      await waitFor(() => {
        expect(screen.getByTestId('data1')).toHaveTextContent('data1')
      })

      await waitFor(() => {
        expect(screen.getByTestId('data2')).toHaveTextContent('data2')
      })
    })

    it('maintains query client across re-renders', () => {
      let queryClient1: QueryClient | null = null
      let queryClient2: QueryClient | null = null
      
      const TestComponent = ({ count }: { count: number }) => {
        const query = useQuery({
          queryKey: ['test'],
          queryFn: () => 'test',
        })
        
        if (count === 1) {
          queryClient1 = query.options.queryClient || null
        } else {
          queryClient2 = query.options.queryClient || null
        }
        
        return <div>Count: {count}</div>
      }

      const { rerender } = render(
        <QueryProvider>
          <TestComponent count={1} />
        </QueryProvider>
      )

      rerender(
        <QueryProvider>
          <TestComponent count={2} />
        </QueryProvider>
      )

      expect(queryClient1).toBe(queryClient2)
    })
  })
})