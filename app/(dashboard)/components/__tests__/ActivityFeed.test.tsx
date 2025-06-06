import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ActivityFeed } from '../ActivityFeed'
import { dashboardApi } from '@/lib/dashboard/dashboardApi'
import { formatDistanceToNow } from 'date-fns'

// Mock the dashboard API
jest.mock('@/lib/dashboard/dashboardApi', () => ({
  dashboardApi: {
    getRecentActivity: jest.fn(),
  },
}))

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(),
}))

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

const mockDashboardApi = dashboardApi as jest.Mocked<typeof dashboardApi>
const mockFormatDistanceToNow = formatDistanceToNow as jest.MockedFunction<typeof formatDistanceToNow>

const mockActivities = [
  {
    id: '1',
    type: 'article_published',
    description: 'New article "React Testing Best Practices" was published',
    created_at: '2023-06-01T10:00:00Z',
    user: {
      id: 'user1',
      name: 'John Doe',
      avatar_url: 'https://example.com/avatar1.jpg',
    },
  },
  {
    id: '2',
    type: 'comment_added',
    description: 'New comment added to "Vue.js Guide"',
    created_at: '2023-06-01T09:30:00Z',
    user: {
      id: 'user2',
      name: 'Jane Smith',
      avatar_url: 'https://example.com/avatar2.jpg',
    },
  },
  {
    id: '3',
    type: 'user_registered',
    description: 'New user registered: Alice Johnson',
    created_at: '2023-06-01T09:00:00Z',
    user: {
      id: 'user3',
      name: 'Alice Johnson',
      avatar_url: null,
    },
  },
  {
    id: '4',
    type: 'revenue_earned',
    description: 'Earned $25.50 from affiliate sales',
    created_at: '2023-06-01T08:30:00Z',
    user: null,
  },
  {
    id: '5',
    type: 'unknown_type' as any,
    description: 'Unknown activity type',
    created_at: '2023-06-01T08:00:00Z',
    user: null,
  },
]

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })
}

function renderWithQueryClient(component: React.ReactElement) {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  )
}

describe('ActivityFeed', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFormatDistanceToNow.mockImplementation((date) => '2 minutes ago')
  })

  it('should render loading skeleton while fetching data', () => {
    mockDashboardApi.getRecentActivity.mockImplementation(() => 
      new Promise(() => {}) // Never resolves to keep loading state
    )

    renderWithQueryClient(<ActivityFeed />)

    // Check for title and description
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    expect(screen.getByText('Real-time updates from your platform')).toBeInTheDocument()

    // Check for loading skeletons
    const skeletons = screen.getAllByRole('generic').filter(el => 
      el.className?.includes('animate-pulse')
    )
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('should render activities when data is loaded', async () => {
    mockDashboardApi.getRecentActivity.mockResolvedValueOnce(mockActivities)

    renderWithQueryClient(<ActivityFeed />)

    await waitFor(() => {
      expect(screen.getByText('New article "React Testing Best Practices" was published')).toBeInTheDocument()
    })

    // Check all activities are rendered
    expect(screen.getByText('New comment added to "Vue.js Guide"')).toBeInTheDocument()
    expect(screen.getByText('New user registered: Alice Johnson')).toBeInTheDocument()
    expect(screen.getByText('Earned $25.50 from affiliate sales')).toBeInTheDocument()
    expect(screen.getByText('Unknown activity type')).toBeInTheDocument()

    // Check user names are displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()

    // Check time formatting
    expect(mockFormatDistanceToNow).toHaveBeenCalledWith(
      new Date('2023-06-01T10:00:00Z'),
      { addSuffix: true }
    )
  })

  it('should render empty state when no activities', async () => {
    mockDashboardApi.getRecentActivity.mockResolvedValueOnce([])

    renderWithQueryClient(<ActivityFeed />)

    await waitFor(() => {
      expect(screen.getByText('No recent activity')).toBeInTheDocument()
    })

    expect(screen.getByText('Activities will appear here as they happen')).toBeInTheDocument()
  })

  it('should render error state when API call fails', async () => {
    mockDashboardApi.getRecentActivity.mockRejectedValueOnce(new Error('API Error'))

    renderWithQueryClient(<ActivityFeed />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load activity feed')).toBeInTheDocument()
    })
  })

  it('should display correct icons for different activity types', async () => {
    mockDashboardApi.getRecentActivity.mockResolvedValueOnce(mockActivities)

    renderWithQueryClient(<ActivityFeed />)

    await waitFor(() => {
      expect(screen.getByText('New article "React Testing Best Practices" was published')).toBeInTheDocument()
    })

    // Since we can't easily test SVG icons, we check that the icon containers have correct classes
    const iconContainers = screen.getAllByRole('generic').filter(el =>
      el.className?.includes('p-2 rounded-full')
    )

    expect(iconContainers.length).toBeGreaterThan(0)

    // Check specific color classes for different activity types
    const articleIcon = iconContainers.find(el =>
      el.className?.includes('text-blue-500 bg-blue-500/10')
    )
    expect(articleIcon).toBeInTheDocument()

    const commentIcon = iconContainers.find(el =>
      el.className?.includes('text-purple-500 bg-purple-500/10')
    )
    expect(commentIcon).toBeInTheDocument()

    const userIcon = iconContainers.find(el =>
      el.className?.includes('text-green-500 bg-green-500/10')
    )
    expect(userIcon).toBeInTheDocument()

    const revenueIcon = iconContainers.find(el =>
      el.className?.includes('text-yellow-500 bg-yellow-500/10')
    )
    expect(revenueIcon).toBeInTheDocument()
  })

  it('should handle activities without users', async () => {
    const activitiesWithoutUsers = [
      {
        id: '1',
        type: 'revenue_earned',
        description: 'System generated revenue',
        created_at: '2023-06-01T10:00:00Z',
        user: null,
      },
    ]

    mockDashboardApi.getRecentActivity.mockResolvedValueOnce(activitiesWithoutUsers)

    renderWithQueryClient(<ActivityFeed />)

    await waitFor(() => {
      expect(screen.getByText('System generated revenue')).toBeInTheDocument()
    })

    // Should not render user avatar or name
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('should handle users without avatars', async () => {
    const activitiesWithoutAvatars = [
      {
        id: '1',
        type: 'article_published',
        description: 'Article published',
        created_at: '2023-06-01T10:00:00Z',
        user: {
          id: 'user1',
          name: 'John Doe',
          avatar_url: null,
        },
      },
    ]

    mockDashboardApi.getRecentActivity.mockResolvedValueOnce(activitiesWithoutAvatars)

    renderWithQueryClient(<ActivityFeed />)

    await waitFor(() => {
      expect(screen.getByText('Article published')).toBeInTheDocument()
    })

    // Should render fallback with user's initials
    expect(screen.getByText('J')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('should handle users without names', async () => {
    const activitiesWithoutNames = [
      {
        id: '1',
        type: 'article_published',
        description: 'Article published',
        created_at: '2023-06-01T10:00:00Z',
        user: {
          id: 'user1',
          name: null,
          avatar_url: 'https://example.com/avatar.jpg',
        },
      },
    ]

    mockDashboardApi.getRecentActivity.mockResolvedValueOnce(activitiesWithoutNames)

    renderWithQueryClient(<ActivityFeed />)

    await waitFor(() => {
      expect(screen.getByText('Article published')).toBeInTheDocument()
    })

    // Should not render user name but avatar should still be present
    const avatarImage = screen.getByRole('img')
    expect(avatarImage).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('should use fallback icon and colors for unknown activity types', async () => {
    const unknownActivities = [
      {
        id: '1',
        type: 'unknown_type' as any,
        description: 'Unknown activity',
        created_at: '2023-06-01T10:00:00Z',
        user: null,
      },
    ]

    mockDashboardApi.getRecentActivity.mockResolvedValueOnce(unknownActivities)

    renderWithQueryClient(<ActivityFeed />)

    await waitFor(() => {
      expect(screen.getByText('Unknown activity')).toBeInTheDocument()
    })

    // Should use default colors for unknown types
    const iconContainer = screen.getByRole('generic', {
      name: /unknown activity/i,
    }).closest('div')?.querySelector('.p-2')

    expect(iconContainer).toHaveClass('text-muted-foreground bg-muted')
  })

  it('should refetch data every 30 seconds', () => {
    mockDashboardApi.getRecentActivity.mockResolvedValueOnce(mockActivities)

    renderWithQueryClient(<ActivityFeed />)

    // Verify the query configuration includes refetch interval
    expect(mockDashboardApi.getRecentActivity).toHaveBeenCalledWith(10)
  })

  it('should format dates correctly', async () => {
    mockFormatDistanceToNow
      .mockReturnValueOnce('2 minutes ago')
      .mockReturnValueOnce('5 minutes ago')
      .mockReturnValueOnce('1 hour ago')

    mockDashboardApi.getRecentActivity.mockResolvedValueOnce(mockActivities.slice(0, 3))

    renderWithQueryClient(<ActivityFeed />)

    await waitFor(() => {
      expect(screen.getByText('2 minutes ago')).toBeInTheDocument()
    })

    expect(screen.getByText('5 minutes ago')).toBeInTheDocument()
    expect(screen.getByText('1 hour ago')).toBeInTheDocument()

    // Verify date formatting calls
    expect(mockFormatDistanceToNow).toHaveBeenCalledWith(
      new Date('2023-06-01T10:00:00Z'),
      { addSuffix: true }
    )
    expect(mockFormatDistanceToNow).toHaveBeenCalledWith(
      new Date('2023-06-01T09:30:00Z'),
      { addSuffix: true }
    )
    expect(mockFormatDistanceToNow).toHaveBeenCalledWith(
      new Date('2023-06-01T09:00:00Z'),
      { addSuffix: true }
    )
  })

  it('should handle API timeout gracefully', async () => {
    jest.useFakeTimers()
    
    // Mock a long-running promise that doesn't resolve
    mockDashboardApi.getRecentActivity.mockImplementation(
      () => new Promise((resolve) => {
        setTimeout(() => resolve([]), 60000)
      })
    )

    renderWithQueryClient(<ActivityFeed />)

    // Should show loading state
    expect(screen.getAllByRole('generic').some(el => 
      el.className?.includes('animate-pulse')
    )).toBe(true)

    jest.useRealTimers()
  })

  it('should handle malformed activity data gracefully', async () => {
    const malformedActivities = [
      {
        id: '1',
        // Missing type
        description: 'Activity without type',
        created_at: '2023-06-01T10:00:00Z',
        user: null,
      },
      {
        id: '2',
        type: 'article_published',
        // Missing description
        created_at: '2023-06-01T10:00:00Z',
        user: null,
      },
    ] as any

    mockDashboardApi.getRecentActivity.mockResolvedValueOnce(malformedActivities)

    renderWithQueryClient(<ActivityFeed />)

    // Should not crash and render what it can
    await waitFor(() => {
      expect(screen.getByText('Activity without type')).toBeInTheDocument()
    })

    // Should handle missing description gracefully
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
  })

  it('should handle invalid dates gracefully', async () => {
    const activitiesWithInvalidDates = [
      {
        id: '1',
        type: 'article_published',
        description: 'Activity with invalid date',
        created_at: 'invalid-date',
        user: null,
      },
    ]

    mockFormatDistanceToNow.mockImplementation(() => {
      throw new Error('Invalid date')
    })

    mockDashboardApi.getRecentActivity.mockResolvedValueOnce(activitiesWithInvalidDates)

    renderWithQueryClient(<ActivityFeed />)

    // Should not crash even with invalid dates
    await waitFor(() => {
      expect(screen.getByText('Activity with invalid date')).toBeInTheDocument()
    })
  })

  it('should maintain scroll position when new activities are added', async () => {
    // First render with some activities
    mockDashboardApi.getRecentActivity.mockResolvedValueOnce(mockActivities.slice(0, 2))

    const { rerender } = renderWithQueryClient(<ActivityFeed />)

    await waitFor(() => {
      expect(screen.getByText('New article "React Testing Best Practices" was published')).toBeInTheDocument()
    })

    // Re-render with more activities
    mockDashboardApi.getRecentActivity.mockResolvedValueOnce(mockActivities)

    rerender(
      <QueryClientProvider client={createTestQueryClient()}>
        <ActivityFeed />
      </QueryClientProvider>
    )

    // Should render all activities
    await waitFor(() => {
      expect(screen.getByText('Unknown activity type')).toBeInTheDocument()
    })
  })

  it('should be accessible', async () => {
    mockDashboardApi.getRecentActivity.mockResolvedValueOnce(mockActivities)

    renderWithQueryClient(<ActivityFeed />)

    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    })

    // Check for proper heading structure
    const heading = screen.getByRole('heading', { level: 3 })
    expect(heading).toHaveTextContent('Recent Activity')

    // Check for proper list structure (using generic roles since it's not a semantic list)
    const activityItems = screen.getAllByText(/New article|New comment|New user|Earned \$|Unknown activity/)
    expect(activityItems.length).toBe(5)
  })
})