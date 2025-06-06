import React from 'react'
import { render, screen } from '@testing-library/react'
import { StatsCards } from '../StatsCards'
import { formatNumber, formatCurrency, formatPercentage } from '@/lib/dashboard/chartHelpers'

// Mock the chart helpers
jest.mock('@/lib/dashboard/chartHelpers', () => ({
  formatNumber: jest.fn(),
  formatCurrency: jest.fn(),
  formatPercentage: jest.fn(),
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

const mockFormatNumber = formatNumber as jest.MockedFunction<typeof formatNumber>
const mockFormatCurrency = formatCurrency as jest.MockedFunction<typeof formatCurrency>
const mockFormatPercentage = formatPercentage as jest.MockedFunction<typeof formatPercentage>

const mockStats = {
  totalViews: 15000,
  totalRevenue: 2500.75,
  totalArticles: 45,
  totalComments: 320,
  viewsChange: 12.5,
  revenueChange: -5.2,
  articlesChange: 8.0,
  commentsChange: 0,
}

describe('StatsCards', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFormatNumber.mockImplementation((num) => num.toLocaleString())
    mockFormatCurrency.mockImplementation((num) => `$${num.toFixed(2)}`)
    mockFormatPercentage.mockImplementation((num) => `${num > 0 ? '+' : ''}${num.toFixed(1)}%`)
  })

  it('should render all stat cards with correct titles', () => {
    render(<StatsCards stats={mockStats} isLoading={false} error={null} />)

    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('Page Views')).toBeInTheDocument()
    expect(screen.getByText('Articles Published')).toBeInTheDocument()
    expect(screen.getByText('Comments')).toBeInTheDocument()
  })

  it('should render loading skeletons when loading', () => {
    render(<StatsCards stats={undefined} isLoading={true} error={null} />)

    // Check for skeleton elements
    const skeletons = screen.getAllByRole('generic').filter(el => 
      el.className?.includes('animate-pulse')
    )
    expect(skeletons.length).toBeGreaterThan(0)

    // Check that data is not rendered while loading
    expect(screen.queryByText('$2,500.75')).not.toBeInTheDocument()
  })

  it('should render error state when error occurs', () => {
    const error = new Error('Failed to fetch stats')
    render(<StatsCards stats={undefined} isLoading={false} error={error} />)

    expect(screen.getByText('Failed to load statistics')).toBeInTheDocument()
    expect(screen.getByText('Failed to load statistics')).toHaveClass('text-destructive')
  })

  it('should format and display stats correctly', () => {
    mockFormatCurrency.mockReturnValue('$2,500.75')
    mockFormatNumber.mockReturnValueOnce('15,000').mockReturnValueOnce('320')

    render(<StatsCards stats={mockStats} isLoading={false} error={null} />)

    expect(screen.getByText('$2,500.75')).toBeInTheDocument()
    expect(screen.getByText('15,000')).toBeInTheDocument()
    expect(screen.getByText('45')).toBeInTheDocument() // Articles use toString()
    expect(screen.getByText('320')).toBeInTheDocument()

    expect(mockFormatCurrency).toHaveBeenCalledWith(2500.75)
    expect(mockFormatNumber).toHaveBeenCalledWith(15000)
    expect(mockFormatNumber).toHaveBeenCalledWith(320)
  })

  it('should display positive percentage changes with green trend up icon', () => {
    mockFormatPercentage.mockReturnValue('+12.5%')

    render(<StatsCards stats={mockStats} isLoading={false} error={null} />)

    // Check for positive changes (views and articles)
    const positiveChanges = screen.getAllByText('+12.5%')
    expect(positiveChanges.length).toBeGreaterThan(0)

    // Verify trending up icons are present for positive changes
    const trendingUpIcons = screen.getAllByTestId('trending-up')
    expect(trendingUpIcons.length).toBeGreaterThan(0)
  })

  it('should display negative percentage changes with red trend down icon', () => {
    mockFormatPercentage
      .mockReturnValueOnce('-5.2%')
      .mockReturnValueOnce('+8.0%')
      .mockReturnValueOnce('+12.5%')

    render(<StatsCards stats={mockStats} isLoading={false} error={null} />)

    // Check for negative change (revenue)
    expect(screen.getByText('-5.2%')).toBeInTheDocument()

    // Check that negative changes have red color
    const negativeChange = screen.getByText('-5.2%')
    expect(negativeChange).toHaveClass('text-red-500')
  })

  it('should not display trend indicators for zero change', () => {
    const statsWithZeroChange = {
      ...mockStats,
      commentsChange: 0,
    }

    render(<StatsCards stats={statsWithZeroChange} isLoading={false} error={null} />)

    // Comments card should not have trending indicators
    const commentsCard = screen.getByText('Comments').closest('[role="generic"]')
    expect(commentsCard?.querySelector('[data-testid="trending-up"]')).toBeNull()
    expect(commentsCard?.querySelector('[data-testid="trending-down"]')).toBeNull()
  })

  it('should render correct icons with appropriate colors', () => {
    render(<StatsCards stats={mockStats} isLoading={false} error={null} />)

    // Check that icon containers have correct color classes
    const revenueCard = screen.getByText('Total Revenue').closest('div')
    const revenueIcon = revenueCard?.querySelector('.text-green-500')
    expect(revenueIcon).toBeInTheDocument()

    const viewsCard = screen.getByText('Page Views').closest('div')
    const viewsIcon = viewsCard?.querySelector('.text-blue-500')
    expect(viewsIcon).toBeInTheDocument()

    const articlesCard = screen.getByText('Articles Published').closest('div')
    const articlesIcon = articlesCard?.querySelector('.text-purple-500')
    expect(articlesIcon).toBeInTheDocument()

    const commentsCard = screen.getByText('Comments').closest('div')
    const commentsIcon = commentsCard?.querySelector('.text-orange-500')
    expect(commentsIcon).toBeInTheDocument()
  })

  it('should display dash when stats are undefined', () => {
    render(<StatsCards stats={undefined} isLoading={false} error={null} />)

    const dashElements = screen.getAllByText('-')
    expect(dashElements.length).toBe(4) // One for each stat card
  })

  it('should handle partial stats data gracefully', () => {
    const partialStats = {
      totalViews: 1000,
      totalRevenue: 500,
      totalArticles: 10,
      totalComments: 50,
      viewsChange: 5,
      revenueChange: 3,
      // Missing articlesChange and commentsChange
    } as any

    render(<StatsCards stats={partialStats} isLoading={false} error={null} />)

    // Should render available data
    expect(screen.getByText('1,000')).toBeInTheDocument()
    expect(screen.getByText('$500.00')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
  })

  it('should render "from last month" text for all change indicators', () => {
    render(<StatsCards stats={mockStats} isLoading={false} error={null} />)

    const fromLastMonthTexts = screen.getAllByText('from last month')
    // Should appear for all non-zero changes (revenue, views, articles - comments is 0)
    expect(fromLastMonthTexts.length).toBe(3)
  })

  it('should handle very large numbers correctly', () => {
    const largeStats = {
      ...mockStats,
      totalViews: 1500000,
      totalRevenue: 999999.99,
    }

    mockFormatNumber.mockReturnValue('1.5M')
    mockFormatCurrency.mockReturnValue('$999,999.99')

    render(<StatsCards stats={largeStats} isLoading={false} error={null} />)

    expect(screen.getByText('1.5M')).toBeInTheDocument()
    expect(screen.getByText('$999,999.99')).toBeInTheDocument()
  })

  it('should handle zero values correctly', () => {
    const zeroStats = {
      totalViews: 0,
      totalRevenue: 0,
      totalArticles: 0,
      totalComments: 0,
      viewsChange: 0,
      revenueChange: 0,
      articlesChange: 0,
      commentsChange: 0,
    }

    mockFormatNumber.mockReturnValue('0')
    mockFormatCurrency.mockReturnValue('$0.00')

    render(<StatsCards stats={zeroStats} isLoading={false} error={null} />)

    expect(screen.getByText('$0.00')).toBeInTheDocument()
    expect(screen.getAllByText('0').length).toBeGreaterThan(0)

    // No trending indicators should be shown for zero changes
    expect(screen.queryByTestId('trending-up')).not.toBeInTheDocument()
    expect(screen.queryByTestId('trending-down')).not.toBeInTheDocument()
  })

  it('should handle negative numbers correctly', () => {
    const negativeStats = {
      ...mockStats,
      viewsChange: -10.5,
      revenueChange: -25.3,
      articlesChange: -2.1,
      commentsChange: -8.7,
    }

    mockFormatPercentage.mockImplementation((num) => `${num.toFixed(1)}%`)

    render(<StatsCards stats={negativeStats} isLoading={false} error={null} />)

    // All changes should show red trending down icons
    const negativeTexts = screen.getAllByText(/-\d+\.\d%/)
    expect(negativeTexts.length).toBe(4)

    negativeTexts.forEach(text => {
      expect(text).toHaveClass('text-red-500')
    })
  })

  it('should be accessible with proper structure', () => {
    render(<StatsCards stats={mockStats} isLoading={false} error={null} />)

    // Check for proper heading structure
    const headings = screen.getAllByRole('heading', { level: 3 })
    expect(headings.length).toBe(4)

    const expectedTitles = ['Total Revenue', 'Page Views', 'Articles Published', 'Comments']
    expectedTitles.forEach(title => {
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
    })
  })

  it('should maintain consistent card layout', () => {
    render(<StatsCards stats={mockStats} isLoading={false} error={null} />)

    // Check that all cards have consistent structure
    const cards = screen.getAllByRole('generic').filter(el => 
      el.className?.includes('space-y-0 pb-2')
    )
    expect(cards.length).toBe(4)
  })

  it('should handle formatter errors gracefully', () => {
    mockFormatCurrency.mockImplementation(() => {
      throw new Error('Formatting error')
    })

    // Should not crash even if formatters throw errors
    expect(() => {
      render(<StatsCards stats={mockStats} isLoading={false} error={null} />)
    }).not.toThrow()
  })

  it('should render with correct motion animation props', () => {
    render(<StatsCards stats={mockStats} isLoading={false} error={null} />)

    // Check that motion components are rendered (we can't test actual animation)
    const cards = screen.getAllByRole('heading', { level: 3 })
    expect(cards.length).toBe(4)
  })

  it('should handle mixed positive and negative changes', () => {
    const mixedStats = {
      ...mockStats,
      viewsChange: 15.2,
      revenueChange: -8.5,
      articlesChange: 0,
      commentsChange: 3.7,
    }

    mockFormatPercentage
      .mockReturnValueOnce('+15.2%')
      .mockReturnValueOnce('-8.5%')
      .mockReturnValueOnce('+3.7%')

    render(<StatsCards stats={mixedStats} isLoading={false} error={null} />)

    // Should display both positive and negative indicators
    expect(screen.getByText('+15.2%')).toHaveClass('text-green-500')
    expect(screen.getByText('-8.5%')).toHaveClass('text-red-500')
    expect(screen.getByText('+3.7%')).toHaveClass('text-green-500')
  })

  it('should format article count as string without number formatting', () => {
    render(<StatsCards stats={mockStats} isLoading={false} error={null} />)

    // Articles should use toString() and not be formatted with thousand separators
    expect(screen.getByText('45')).toBeInTheDocument()
    
    // Verify formatNumber was not called for articles
    expect(mockFormatNumber).not.toHaveBeenCalledWith(45)
  })
})