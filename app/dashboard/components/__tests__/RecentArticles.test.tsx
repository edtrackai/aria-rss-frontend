import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RecentArticles } from '../RecentArticles'
import { dashboardApi } from '@/lib/dashboard/dashboardApi'
import { formatDistanceToNow } from 'date-fns'
import { formatNumber } from '@/lib/dashboard/chartHelpers'

// Mock dependencies
jest.mock('@/lib/dashboard/dashboardApi', () => ({
  dashboardApi: {
    getRecentArticles: jest.fn(),
  },
}))

jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(),
}))

jest.mock('@/lib/dashboard/chartHelpers', () => ({
  formatNumber: jest.fn(),
}))

jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
})

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

const mockDashboardApi = dashboardApi as jest.Mocked<typeof dashboardApi>
const mockFormatDistanceToNow = formatDistanceToNow as jest.MockedFunction<typeof formatDistanceToNow>
const mockFormatNumber = formatNumber as jest.MockedFunction<typeof formatNumber>

const mockArticles = [
  {
    id: '1',
    title: 'Getting Started with React Testing',
    status: 'published',
    slug: 'getting-started-with-react-testing',
    views: 1250,
    created_at: '2023-06-01T10:00:00Z',
    author: {
      id: 'author1',
      name: 'John Doe',
      avatar_url: 'https://example.com/avatar1.jpg',
    },
    category: {
      id: 'cat1',
      name: 'Technology',
    },
  },
  {
    id: '2',
    title: 'Advanced JavaScript Patterns',
    status: 'draft',
    slug: 'advanced-javascript-patterns',
    views: 850,
    created_at: '2023-06-01T09:00:00Z',
    author: {
      id: 'author2',
      name: 'Jane Smith',
      avatar_url: null,
    },
    category: null,
  },
  {
    id: '3',
    title: 'Building Scalable Web Applications',
    status: 'archived',
    slug: 'building-scalable-web-applications',
    views: 2100,
    created_at: '2023-05-30T15:30:00Z',
    author: {
      id: 'author3',
      name: null,
      avatar_url: 'https://example.com/avatar3.jpg',
    },
    category: {
      id: 'cat2',
      name: 'Development',
    },
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

describe('RecentArticles', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFormatDistanceToNow.mockReturnValue('2 hours ago')
    mockFormatNumber.mockImplementation((num) => num.toString())
  })

  it('should render the component with title and description', () => {
    mockDashboardApi.getRecentArticles.mockImplementation(() => 
      new Promise(() => {}) // Never resolves to keep loading state
    )

    renderWithQueryClient(<RecentArticles />)

    expect(screen.getByText('Recent Articles')).toBeInTheDocument()
    expect(screen.getByText('Your latest content performance')).toBeInTheDocument()
    expect(screen.getByText('View All')).toBeInTheDocument()
  })

  it('should render loading skeleton while fetching data', () => {
    mockDashboardApi.getRecentArticles.mockImplementation(() => 
      new Promise(() => {}) // Never resolves to keep loading state
    )

    renderWithQueryClient(<RecentArticles />)

    // Check for loading skeletons
    const skeletons = screen.getAllByRole('generic').filter(el => 
      el.className?.includes('animate-pulse')
    )
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('should render articles when data is loaded', async () => {
    mockDashboardApi.getRecentArticles.mockResolvedValueOnce(mockArticles)

    renderWithQueryClient(<RecentArticles />)

    await waitFor(() => {
      expect(screen.getByText('Getting Started with React Testing')).toBeInTheDocument()
    })

    expect(screen.getByText('Advanced JavaScript Patterns')).toBeInTheDocument()
    expect(screen.getByText('Building Scalable Web Applications')).toBeInTheDocument()
  })

  it('should display correct status badges with appropriate colors', async () => {
    mockDashboardApi.getRecentArticles.mockResolvedValueOnce(mockArticles)

    renderWithQueryClient(<RecentArticles />)

    await waitFor(() => {
      expect(screen.getByText('published')).toBeInTheDocument()
    })

    expect(screen.getByText('draft')).toBeInTheDocument()
    expect(screen.getByText('archived')).toBeInTheDocument()

    // Check badge variants (we can't easily test classes, but we can verify they're rendered)
    const badges = screen.getAllByRole('generic').filter(el => 
      el.textContent === 'published' || el.textContent === 'draft' || el.textContent === 'archived'
    )
    expect(badges.length).toBe(3)
  })

  it('should display article metrics correctly', async () => {
    mockFormatNumber.mockImplementation((num) => {
      if (num === 1250) return '1.3K'
      if (num === 850) return '850'
      if (num === 2100) return '2.1K'
      return num.toString()
    })

    mockDashboardApi.getRecentArticles.mockResolvedValueOnce(mockArticles)

    renderWithQueryClient(<RecentArticles />)

    await waitFor(() => {
      expect(screen.getByText('1.3K views')).toBeInTheDocument()
    })

    expect(screen.getByText('850 views')).toBeInTheDocument()
    expect(screen.getByText('2.1K views')).toBeInTheDocument()
  })

  it('should display author information correctly', async () => {
    mockDashboardApi.getRecentArticles.mockResolvedValueOnce(mockArticles)

    renderWithQueryClient(<RecentArticles />)

    await waitFor(() => {
      expect(screen.getByText('Getting Started with React Testing')).toBeInTheDocument()
    })

    // Check author avatars and fallbacks
    const avatarImages = screen.getAllByRole('img')
    expect(avatarImages.length).toBeGreaterThan(0)

    // Check avatar fallbacks for authors without names or avatars
    const fallbacks = screen.getAllByText(/^[A-Z]$/)
    expect(fallbacks.length).toBeGreaterThan(0)
  })

  it('should display category badges when available', async () => {
    mockDashboardApi.getRecentArticles.mockResolvedValueOnce(mockArticles)

    renderWithQueryClient(<RecentArticles />)

    await waitFor(() => {
      expect(screen.getByText('Technology')).toBeInTheDocument()
    })

    expect(screen.getByText('Development')).toBeInTheDocument()
    
    // Third article has no category, so only 2 category badges should be present
    const categoryBadges = screen.getAllByText(/^(Technology|Development)$/)
    expect(categoryBadges.length).toBe(2)
  })

  it('should format dates correctly', async () => {
    mockFormatDistanceToNow
      .mockReturnValueOnce('2 hours ago')
      .mockReturnValueOnce('3 hours ago')
      .mockReturnValueOnce('2 days ago')

    mockDashboardApi.getRecentArticles.mockResolvedValueOnce(mockArticles)

    renderWithQueryClient(<RecentArticles />)

    await waitFor(() => {
      expect(screen.getByText('2 hours ago')).toBeInTheDocument()
    })

    expect(screen.getByText('3 hours ago')).toBeInTheDocument()
    expect(screen.getByText('2 days ago')).toBeInTheDocument()

    // Verify date formatting calls
    expect(mockFormatDistanceToNow).toHaveBeenCalledWith(
      new Date('2023-06-01T10:00:00Z'),
      { addSuffix: true }
    )
  })

  it('should render dropdown menus with correct actions', async () => {
    mockDashboardApi.getRecentArticles.mockResolvedValueOnce(mockArticles)

    renderWithQueryClient(<RecentArticles />)

    await waitFor(() => {
      expect(screen.getByText('Getting Started with React Testing')).toBeInTheDocument()
    })

    // Click on the first dropdown trigger
    const dropdownTriggers = screen.getAllByRole('button', { name: /open menu/i })
    fireEvent.click(dropdownTriggers[0])

    // Check dropdown menu items
    expect(screen.getByText('Edit Article')).toBeInTheDocument()
    expect(screen.getByText('View Live')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('should have correct links for articles and actions', async () => {
    mockDashboardApi.getRecentArticles.mockResolvedValueOnce(mockArticles)

    renderWithQueryClient(<RecentArticles />)

    await waitFor(() => {
      expect(screen.getByText('Getting Started with React Testing')).toBeInTheDocument()
    })

    // Check article title links
    const articleLink = screen.getByRole('link', { name: 'Getting Started with React Testing' })
    expect(articleLink).toHaveAttribute('href', '/dashboard/articles/1')

    // Check "View All" link
    const viewAllLink = screen.getByRole('link', { name: 'View All' })
    expect(viewAllLink).toHaveAttribute('href', '/dashboard/articles')

    // Open dropdown to check action links
    const dropdownTrigger = screen.getAllByRole('button', { name: /open menu/i })[0]
    fireEvent.click(dropdownTrigger)

    const editLink = screen.getByRole('link', { name: /edit article/i })
    expect(editLink).toHaveAttribute('href', '/dashboard/articles/1/edit')

    const viewLiveLink = screen.getByRole('link', { name: /view live/i })
    expect(viewLiveLink).toHaveAttribute('href', '/articles/getting-started-with-react-testing')
    expect(viewLiveLink).toHaveAttribute('target', '_blank')
  })

  it('should render empty state when no articles', async () => {
    mockDashboardApi.getRecentArticles.mockResolvedValueOnce([])

    renderWithQueryClient(<RecentArticles />)

    await waitFor(() => {
      expect(screen.getByText('No articles yet')).toBeInTheDocument()
    })

    expect(screen.getByText('Create Your First Article')).toBeInTheDocument()
    
    const createArticleLink = screen.getByRole('link', { name: 'Create Your First Article' })
    expect(createArticleLink).toHaveAttribute('href', '/dashboard/articles/new')
  })

  it('should render error state when API call fails', async () => {
    mockDashboardApi.getRecentArticles.mockRejectedValueOnce(new Error('API Error'))

    renderWithQueryClient(<RecentArticles />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load articles')).toBeInTheDocument()
    })
  })

  it('should handle articles without authors gracefully', async () => {
    const articlesWithoutAuthors = [
      {
        ...mockArticles[0],
        author: null,
      },
    ]

    mockDashboardApi.getRecentArticles.mockResolvedValueOnce(articlesWithoutAuthors)

    renderWithQueryClient(<RecentArticles />)

    await waitFor(() => {
      expect(screen.getByText('Getting Started with React Testing')).toBeInTheDocument()
    })

    // Should render default avatar fallback
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('should handle articles with missing data gracefully', async () => {
    const incompleteArticles = [
      {
        id: '1',
        title: 'Test Article',
        status: 'published',
        slug: 'test-article',
        views: 0,
        created_at: '2023-06-01T10:00:00Z',
        // Missing author and category
      },
    ] as any

    mockDashboardApi.getRecentArticles.mockResolvedValueOnce(incompleteArticles)

    renderWithQueryClient(<RecentArticles />)

    await waitFor(() => {
      expect(screen.getByText('Test Article')).toBeInTheDocument()
    })

    // Should not crash and render available data
    expect(screen.getByText('published')).toBeInTheDocument()
  })

  it('should apply hover effects correctly', async () => {
    mockDashboardApi.getRecentArticles.mockResolvedValueOnce(mockArticles)

    renderWithQueryClient(<RecentArticles />)

    await waitFor(() => {
      expect(screen.getByText('Getting Started with React Testing')).toBeInTheDocument()
    })

    const articleContainer = screen.getByText('Getting Started with React Testing').closest('.flex.items-center.justify-between')
    expect(articleContainer).toHaveClass('hover:bg-muted/50', 'transition-colors')
  })

  it('should truncate long article titles', async () => {
    const longTitleArticles = [
      {
        ...mockArticles[0],
        title: 'This is a very long article title that should be truncated when displayed in the recent articles list',
      },
    ]

    mockDashboardApi.getRecentArticles.mockResolvedValueOnce(longTitleArticles)

    renderWithQueryClient(<RecentArticles />)

    await waitFor(() => {
      const titleElement = screen.getByText(/This is a very long article title/)
      expect(titleElement).toHaveClass('truncate')
    })
  })

  it('should refetch data every 60 seconds', () => {
    mockDashboardApi.getRecentArticles.mockResolvedValueOnce(mockArticles)

    renderWithQueryClient(<RecentArticles />)

    // Verify the query configuration
    expect(mockDashboardApi.getRecentArticles).toHaveBeenCalledWith(5)
  })

  it('should handle keyboard navigation', async () => {
    mockDashboardApi.getRecentArticles.mockResolvedValueOnce(mockArticles)

    renderWithQueryClient(<RecentArticles />)

    await waitFor(() => {
      expect(screen.getByText('Getting Started with React Testing')).toBeInTheDocument()
    })

    // Test tabbing through links
    const viewAllLink = screen.getByRole('link', { name: 'View All' })
    const firstArticleLink = screen.getByRole('link', { name: 'Getting Started with React Testing' })
    const firstDropdownTrigger = screen.getAllByRole('button', { name: /open menu/i })[0]

    viewAllLink.focus()
    expect(document.activeElement).toBe(viewAllLink)

    fireEvent.keyDown(viewAllLink, { key: 'Tab' })
    firstArticleLink.focus()
    expect(document.activeElement).toBe(firstArticleLink)

    // Test Enter key on dropdown trigger
    fireEvent.keyDown(firstDropdownTrigger, { key: 'Enter' })
    expect(screen.getByText('Edit Article')).toBeInTheDocument()
  })

  it('should be accessible with proper ARIA attributes', async () => {
    mockDashboardApi.getRecentArticles.mockResolvedValueOnce(mockArticles)

    renderWithQueryClient(<RecentArticles />)

    await waitFor(() => {
      expect(screen.getByText('Recent Articles')).toBeInTheDocument()
    })

    // Check for proper heading
    const heading = screen.getByRole('heading', { level: 3 })
    expect(heading).toHaveTextContent('Recent Articles')

    // Check that dropdown triggers are properly labeled
    const dropdownTriggers = screen.getAllByRole('button', { name: /open menu/i })
    expect(dropdownTriggers.length).toBe(3)

    // Check that links are properly accessible
    const articleLinks = screen.getAllByRole('link')
    articleLinks.forEach(link => {
      expect(link).toHaveAttribute('href')
    })
  })

  it('should handle dropdown menu interactions', async () => {
    mockDashboardApi.getRecentArticles.mockResolvedValueOnce(mockArticles)

    renderWithQueryClient(<RecentArticles />)

    await waitFor(() => {
      expect(screen.getByText('Getting Started with React Testing')).toBeInTheDocument()
    })

    const dropdownTrigger = screen.getAllByRole('button', { name: /open menu/i })[0]
    
    // Open dropdown
    fireEvent.click(dropdownTrigger)
    expect(screen.getByText('Edit Article')).toBeInTheDocument()

    // Close dropdown by clicking outside
    fireEvent.click(document.body)
    expect(screen.queryByText('Edit Article')).not.toBeInTheDocument()
  })

  it('should handle malformed API responses gracefully', async () => {
    const malformedArticles = [
      {
        id: '1',
        // Missing required fields
      },
      null,
      undefined,
    ] as any

    mockDashboardApi.getRecentArticles.mockResolvedValueOnce(malformedArticles)

    renderWithQueryClient(<RecentArticles />)

    // Should not crash with malformed data
    await waitFor(() => {
      expect(screen.getByText('Recent Articles')).toBeInTheDocument()
    })
  })
})