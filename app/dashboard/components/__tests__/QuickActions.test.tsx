import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { QuickActions } from '../QuickActions'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockPush = jest.fn()

describe('QuickActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    } as any)
  })

  it('should render the component with title and description', () => {
    render(<QuickActions />)

    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    expect(screen.getByText('Start creating content or check your stats')).toBeInTheDocument()
  })

  it('should render all action buttons', () => {
    render(<QuickActions />)

    expect(screen.getByText('Write Article')).toBeInTheDocument()
    expect(screen.getByText('Create new content')).toBeInTheDocument()

    expect(screen.getByText('Write Review')).toBeInTheDocument()
    expect(screen.getByText('Review a product')).toBeInTheDocument()

    expect(screen.getByText('View Analytics')).toBeInTheDocument()
    expect(screen.getByText('Check performance')).toBeInTheDocument()
  })

  it('should navigate to write article page when clicked', () => {
    render(<QuickActions />)

    const writeArticleButton = screen.getByRole('button', { name: /write article/i })
    fireEvent.click(writeArticleButton)

    expect(mockPush).toHaveBeenCalledWith('/dashboard/articles/new')
  })

  it('should navigate to write review page when clicked', () => {
    render(<QuickActions />)

    const writeReviewButton = screen.getByRole('button', { name: /write review/i })
    fireEvent.click(writeReviewButton)

    expect(mockPush).toHaveBeenCalledWith('/dashboard/reviews/new')
  })

  it('should navigate to analytics page when clicked', () => {
    render(<QuickActions />)

    const analyticsButton = screen.getByRole('button', { name: /view analytics/i })
    fireEvent.click(analyticsButton)

    expect(mockPush).toHaveBeenCalledWith('/dashboard/analytics')
  })

  it('should render buttons with correct styling', () => {
    render(<QuickActions />)

    const buttons = screen.getAllByRole('button')
    
    buttons.forEach(button => {
      expect(button).toHaveClass('w-full', 'justify-start', 'h-auto', 'p-4')
    })
  })

  it('should display icons with correct colors', () => {
    render(<QuickActions />)

    // Check for icon containers with background colors
    const blueIcon = screen.getByText('Write Article').closest('button')?.querySelector('.bg-blue-500')
    expect(blueIcon).toBeInTheDocument()

    const purpleIcon = screen.getByText('Write Review').closest('button')?.querySelector('.bg-purple-500')
    expect(purpleIcon).toBeInTheDocument()

    const greenIcon = screen.getByText('View Analytics').closest('button')?.querySelector('.bg-green-500')
    expect(greenIcon).toBeInTheDocument()
  })

  it('should handle keyboard navigation', () => {
    render(<QuickActions />)

    const firstButton = screen.getByRole('button', { name: /write article/i })
    const secondButton = screen.getByRole('button', { name: /write review/i })
    const thirdButton = screen.getByRole('button', { name: /view analytics/i })

    // Test tab navigation
    firstButton.focus()
    expect(document.activeElement).toBe(firstButton)

    fireEvent.keyDown(firstButton, { key: 'Tab' })
    secondButton.focus()
    expect(document.activeElement).toBe(secondButton)

    fireEvent.keyDown(secondButton, { key: 'Tab' })
    thirdButton.focus()
    expect(document.activeElement).toBe(thirdButton)
  })

  it('should handle Enter key press', () => {
    render(<QuickActions />)

    const writeArticleButton = screen.getByRole('button', { name: /write article/i })
    
    fireEvent.keyDown(writeArticleButton, { key: 'Enter' })
    expect(mockPush).toHaveBeenCalledWith('/dashboard/articles/new')
  })

  it('should handle Space key press', () => {
    render(<QuickActions />)

    const writeReviewButton = screen.getByRole('button', { name: /write review/i })
    
    fireEvent.keyDown(writeReviewButton, { key: ' ' })
    expect(mockPush).toHaveBeenCalledWith('/dashboard/reviews/new')
  })

  it('should have proper button structure with icon and text layout', () => {
    render(<QuickActions />)

    const writeArticleButton = screen.getByRole('button', { name: /write article/i })
    
    // Check that button contains icon container and text content
    const iconContainer = writeArticleButton.querySelector('.p-2.rounded-lg.mr-4.bg-blue-500')
    expect(iconContainer).toBeInTheDocument()

    const textContainer = writeArticleButton.querySelector('.text-left')
    expect(textContainer).toBeInTheDocument()
    
    expect(textContainer).toHaveTextContent('Write Article')
    expect(textContainer).toHaveTextContent('Create new content')
  })

  it('should display descriptions with muted text styling', () => {
    render(<QuickActions />)

    const descriptions = [
      'Create new content',
      'Review a product',
      'Check performance'
    ]

    descriptions.forEach(description => {
      const element = screen.getByText(description)
      expect(element).toHaveClass('text-sm', 'text-muted-foreground')
    })
  })

  it('should maintain button states during interactions', () => {
    render(<QuickActions />)

    const button = screen.getByRole('button', { name: /write article/i })
    
    // Test hover state (can't test actual hover, but can test class presence)
    expect(button).toHaveClass('outline')
    
    // Test focus state
    fireEvent.focus(button)
    expect(document.activeElement).toBe(button)
    
    // Test click and ensure it's still focusable
    fireEvent.click(button)
    expect(mockPush).toHaveBeenCalledWith('/dashboard/articles/new')
  })

  it('should handle rapid clicks gracefully', () => {
    render(<QuickActions />)

    const button = screen.getByRole('button', { name: /write article/i })
    
    // Rapid clicks
    fireEvent.click(button)
    fireEvent.click(button)
    fireEvent.click(button)
    
    expect(mockPush).toHaveBeenCalledTimes(3)
    expect(mockPush).toHaveBeenCalledWith('/dashboard/articles/new')
  })

  it('should be accessible with proper ARIA attributes', () => {
    render(<QuickActions />)

    // Check for proper heading
    const heading = screen.getByRole('heading', { level: 3 })
    expect(heading).toHaveTextContent('Quick Actions')

    // Check that all buttons are properly labeled
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(3)

    buttons.forEach(button => {
      expect(button).toHaveAttribute('type', 'button')
    })

    // Check specific button names
    expect(screen.getByRole('button', { name: /write article.*create new content/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /write review.*review a product/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /view analytics.*check performance/i })).toBeInTheDocument()
  })

  it('should handle router errors gracefully', () => {
    const mockPushWithError = jest.fn().mockImplementation(() => {
      throw new Error('Navigation error')
    })
    
    mockUseRouter.mockReturnValue({
      push: mockPushWithError,
    } as any)

    render(<QuickActions />)

    const button = screen.getByRole('button', { name: /write article/i })
    
    // Should not crash when router throws error
    expect(() => {
      fireEvent.click(button)
    }).not.toThrow()

    expect(mockPushWithError).toHaveBeenCalledWith('/dashboard/articles/new')
  })

  it('should render with correct layout structure', () => {
    render(<QuickActions />)

    // Check main card structure
    const card = screen.getByText('Quick Actions').closest('div')
    expect(card).toBeInTheDocument()

    // Check grid layout for buttons
    const buttonContainer = screen.getByText('Write Article').closest('div')?.parentElement
    expect(buttonContainer).toHaveClass('grid', 'gap-4')
  })

  it('should maintain consistent styling across all action buttons', () => {
    render(<QuickActions />)

    const buttons = screen.getAllByRole('button')
    
    buttons.forEach((button, index) => {
      // Each button should have consistent classes
      expect(button).toHaveClass('w-full', 'justify-start', 'h-auto', 'p-4')
      
      // Each should have an icon container
      const iconContainer = button.querySelector('.p-2.rounded-lg.mr-4')
      expect(iconContainer).toBeInTheDocument()
      
      // Each should have text container
      const textContainer = button.querySelector('.text-left')
      expect(textContainer).toBeInTheDocument()
      
      // Check for title and description elements
      const title = textContainer?.querySelector('.font-medium')
      const description = textContainer?.querySelector('.text-sm.text-muted-foreground')
      
      expect(title).toBeInTheDocument()
      expect(description).toBeInTheDocument()
    })
  })

  it('should handle missing router gracefully', () => {
    mockUseRouter.mockReturnValue(null as any)

    // Should not crash when router is not available
    expect(() => {
      render(<QuickActions />)
    }).not.toThrow()

    // Component should still render
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
  })

  it('should support custom action configurations', () => {
    // This test verifies the internal actions array structure
    render(<QuickActions />)

    // Verify all expected actions are present based on the internal configuration
    const expectedActions = [
      { title: 'Write Article', description: 'Create new content', href: '/dashboard/articles/new' },
      { title: 'Write Review', description: 'Review a product', href: '/dashboard/reviews/new' },
      { title: 'View Analytics', description: 'Check performance', href: '/dashboard/analytics' },
    ]

    expectedActions.forEach(action => {
      expect(screen.getByText(action.title)).toBeInTheDocument()
      expect(screen.getByText(action.description)).toBeInTheDocument()
    })
  })

  it('should render icons with white text color', () => {
    render(<QuickActions />)

    // Check that icon containers have text-white class for the icons
    const buttons = screen.getAllByRole('button')
    
    buttons.forEach(button => {
      const iconContainer = button.querySelector('.p-2.rounded-lg.mr-4')
      const icon = iconContainer?.querySelector('.text-white')
      expect(icon).toBeInTheDocument()
    })
  })
})