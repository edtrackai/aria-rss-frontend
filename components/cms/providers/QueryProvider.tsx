"use client"

import React, { useState } from 'react'
import { QueryClient, QueryClientProvider, useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors except 408, 429
          if (error?.status >= 400 && error?.status < 500 && ![408, 429].includes(error?.status)) {
            return false
          }
          // Retry up to 3 times for other errors
          return failureCount < 3
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: (failureCount, error: any) => {
          // Don't retry mutations on 4xx errors
          if (error?.status >= 400 && error?.status < 500) {
            return false
          }
          return failureCount < 1
        },
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

/**
 * Optimistic update helper hook
 */
export function useOptimisticMutation<TData, TError, TVariables, TContext>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    queryKey: string[]
    updateFn: (oldData: any, variables: TVariables) => any
    onSuccess?: (data: TData, variables: TVariables, context: TContext) => void
    onError?: (error: TError, variables: TVariables, context: TContext) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onMutate: (async (variables: any) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: options.queryKey })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(options.queryKey)
      
      // Optimistically update
      queryClient.setQueryData(options.queryKey, (old: any) => 
        options.updateFn(old, variables)
      )
      
      return { previousData }
    }) as any,
    onError: (err, variables, context: any) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(options.queryKey, context.previousData)
      }
      options.onError?.(err as any, variables, context)
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: options.queryKey })
    },
    onSuccess: options.onSuccess,
  })
}

/**
 * Infinite query helper hook
 */
export function useInfiniteScroll<TData>(
  queryKey: string[],
  queryFn: ({ pageParam }: { pageParam: number }) => Promise<{
    data: TData[]
    nextPage?: number
    hasMore: boolean
  }>,
  options: {
    enabled?: boolean
    refetchOnWindowFocus?: boolean
  } = {}
) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 1 }) => queryFn({ pageParam }),
    getNextPageParam: (lastPage: any) => lastPage.nextPage,
    initialPageParam: 1,
    ...options,
  })

  const items = data ? [].concat(...(data as any)) : []

  return {
    items,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: status === 'pending',
    isError: status === 'error',
    error,
  }
}

/**
 * Real-time query hook that refetches on socket events
 */
export function useRealtimeQuery<TData>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
  options: {
    socketEvents?: string[]
    enabled?: boolean
    refetchInterval?: number
  } = {}
) {
  const queryClient = useQueryClient()
  
  const query = useQuery({
    queryKey,
    queryFn,
    enabled: options.enabled,
    refetchInterval: options.refetchInterval,
  })

  // TODO: Add socket event listeners here
  // This would connect to WebSocket events and trigger refetches
  
  return query
}

/**
 * Cached API call hook with background sync
 */
export function useCachedApi<TData>(
  key: string,
  apiFn: () => Promise<TData>,
  options: {
    syncInterval?: number
    enabled?: boolean
    staleTime?: number
  } = {}
) {
  const {
    syncInterval = 30000, // 30 seconds
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
  } = options

  return useQuery({
    queryKey: [key],
    queryFn: apiFn,
    enabled,
    staleTime,
    refetchInterval: syncInterval,
    refetchIntervalInBackground: true,
  })
}

export default QueryProvider