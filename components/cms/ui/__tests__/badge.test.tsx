import React from 'react'
import { render, screen } from '@testing-library/react'
import { Badge, badgeVariants } from '../badge'

describe('Badge', () => {
  it('renders correctly with default props', () => {
    render(<Badge>Default Badge</Badge>)
    const badge = screen.getByText('Default Badge')
    expect(badge).toBeInTheDocument()
    expect(badge.tagName).toBe('DIV')
    expect(badge).toHaveClass('inline-flex')
    expect(badge).toHaveClass('items-center')
    expect(badge).toHaveClass('rounded-full')
  })

  describe('variants', () => {
    it('renders default variant', () => {
      render(<Badge variant="default">Default</Badge>)
      const badge = screen.getByText('Default')
      expect(badge).toHaveClass('border-transparent')
      expect(badge).toHaveClass('bg-primary')
      expect(badge).toHaveClass('text-primary-foreground')
      expect(badge).toHaveClass('hover:bg-primary/80')
    })

    it('renders secondary variant', () => {
      render(<Badge variant="secondary">Secondary</Badge>)
      const badge = screen.getByText('Secondary')
      expect(badge).toHaveClass('border-transparent')
      expect(badge).toHaveClass('bg-secondary')
      expect(badge).toHaveClass('text-secondary-foreground')
      expect(badge).toHaveClass('hover:bg-secondary/80')
    })

    it('renders destructive variant', () => {
      render(<Badge variant="destructive">Destructive</Badge>)
      const badge = screen.getByText('Destructive')
      expect(badge).toHaveClass('border-transparent')
      expect(badge).toHaveClass('bg-destructive')
      expect(badge).toHaveClass('text-destructive-foreground')
      expect(badge).toHaveClass('hover:bg-destructive/80')
    })

    it('renders outline variant', () => {
      render(<Badge variant="outline">Outline</Badge>)
      const badge = screen.getByText('Outline')
      expect(badge).toHaveClass('text-foreground')
      // Outline variant has border but not border-transparent
      expect(badge).not.toHaveClass('border-transparent')
    })
  })

  describe('styling', () => {
    it('has correct default styling', () => {
      render(<Badge>Styled Badge</Badge>)
      const badge = screen.getByText('Styled Badge')
      expect(badge).toHaveClass('inline-flex')
      expect(badge).toHaveClass('items-center')
      expect(badge).toHaveClass('rounded-full')
      expect(badge).toHaveClass('border')
      expect(badge).toHaveClass('px-2.5')
      expect(badge).toHaveClass('py-0.5')
      expect(badge).toHaveClass('text-xs')
      expect(badge).toHaveClass('font-semibold')
    })

    it('applies custom className', () => {
      render(<Badge className="custom-badge ml-2">Custom</Badge>)
      const badge = screen.getByText('Custom')
      expect(badge).toHaveClass('custom-badge')
      expect(badge).toHaveClass('ml-2')
      // Should still have default classes
      expect(badge).toHaveClass('inline-flex')
      expect(badge).toHaveClass('rounded-full')
    })

    it('has transition effects', () => {
      render(<Badge>Transition Badge</Badge>)
      const badge = screen.getByText('Transition Badge')
      expect(badge).toHaveClass('transition-colors')
    })

    it('has focus styles', () => {
      render(<Badge>Focus Badge</Badge>)
      const badge = screen.getByText('Focus Badge')
      expect(badge).toHaveClass('focus:outline-none')
      expect(badge).toHaveClass('focus:ring-2')
      expect(badge).toHaveClass('focus:ring-ring')
      expect(badge).toHaveClass('focus:ring-offset-2')
    })
  })

  describe('content', () => {
    it('can contain text', () => {
      render(<Badge>Text Content</Badge>)
      expect(screen.getByText('Text Content')).toBeInTheDocument()
    })

    it('can contain numbers', () => {
      render(<Badge>42</Badge>)
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('can contain icons and text', () => {
      render(
        <Badge>
          <svg className="w-3 h-3 mr-1" />
          <span>With Icon</span>
        </Badge>
      )
      const badge = screen.getByText('With Icon').parentElement
      const icon = badge?.querySelector('svg')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('w-3', 'h-3', 'mr-1')
    })

    it('can be used for status indicators', () => {
      render(
        <>
          <Badge variant="default">Active</Badge>
          <Badge variant="secondary">Pending</Badge>
          <Badge variant="destructive">Error</Badge>
          <Badge variant="outline">Draft</Badge>
        </>
      )
      
      expect(screen.getByText('Active')).toHaveClass('bg-primary')
      expect(screen.getByText('Pending')).toHaveClass('bg-secondary')
      expect(screen.getByText('Error')).toHaveClass('bg-destructive')
      expect(screen.getByText('Draft')).toHaveClass('text-foreground')
    })
  })

  describe('use cases', () => {
    it('works as a count indicator', () => {
      render(<Badge className="ml-2">99+</Badge>)
      const badge = screen.getByText('99+')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('ml-2')
    })

    it('works as a tag', () => {
      render(
        <div>
          <Badge variant="outline">JavaScript</Badge>
          <Badge variant="outline">React</Badge>
          <Badge variant="outline">TypeScript</Badge>
        </div>
      )
      
      expect(screen.getByText('JavaScript')).toBeInTheDocument()
      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
    })

    it('works as a notification badge', () => {
      render(
        <div className="relative">
          <button>Notifications</button>
          <Badge className="absolute -top-1 -right-1">5</Badge>
        </div>
      )
      
      const badge = screen.getByText('5')
      expect(badge).toHaveClass('absolute')
    })
  })

  describe('accessibility', () => {
    it('can have role and aria attributes', () => {
      render(
        <Badge role="status" aria-label="3 new messages">
          3
        </Badge>
      )
      const badge = screen.getByRole('status')
      expect(badge).toHaveAttribute('aria-label', '3 new messages')
    })

    it('supports aria-live for dynamic updates', () => {
      render(
        <Badge aria-live="polite" aria-atomic="true">
          Updated
        </Badge>
      )
      const badge = screen.getByText('Updated')
      expect(badge).toHaveAttribute('aria-live', 'polite')
      expect(badge).toHaveAttribute('aria-atomic', 'true')
    })

    it('can be used with screen reader only text', () => {
      render(
        <Badge>
          <span className="sr-only">Status:</span>
          Active
        </Badge>
      )
      
      expect(screen.getByText('Status:')).toHaveClass('sr-only')
      expect(screen.getByText('Active')).toBeInTheDocument()
    })
  })

  describe('additional props', () => {
    it('supports data attributes', () => {
      render(<Badge data-testid="test-badge" data-value="test">Test</Badge>)
      const badge = screen.getByTestId('test-badge')
      expect(badge).toHaveAttribute('data-value', 'test')
    })

    it('supports event handlers', () => {
      const handleClick = jest.fn()
      render(<Badge onClick={handleClick}>Clickable</Badge>)
      
      const badge = screen.getByText('Clickable')
      badge.click()
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('can be styled as interactive', () => {
      render(
        <Badge className="cursor-pointer" tabIndex={0}>
          Interactive Badge
        </Badge>
      )
      const badge = screen.getByText('Interactive Badge')
      expect(badge).toHaveClass('cursor-pointer')
      expect(badge).toHaveAttribute('tabindex', '0')
    })
  })

  describe('badgeVariants helper', () => {
    it('generates correct classes for variants', () => {
      expect(badgeVariants({ variant: 'default' })).toContain('bg-primary')
      expect(badgeVariants({ variant: 'secondary' })).toContain('bg-secondary')
      expect(badgeVariants({ variant: 'destructive' })).toContain('bg-destructive')
      expect(badgeVariants({ variant: 'outline' })).toContain('text-foreground')
    })

    it('includes base classes', () => {
      const classes = badgeVariants({ variant: 'default' })
      expect(classes).toContain('inline-flex')
      expect(classes).toContain('items-center')
      expect(classes).toContain('rounded-full')
      expect(classes).toContain('px-2.5')
      expect(classes).toContain('py-0.5')
    })
  })

  describe('composition', () => {
    it('can be composed with other components', () => {
      render(
        <button>
          Messages
          <Badge className="ml-2" variant="destructive">
            3
          </Badge>
        </button>
      )
      
      const button = screen.getByRole('button')
      const badge = screen.getByText('3')
      
      expect(button).toContainElement(badge)
      expect(badge).toHaveClass('ml-2')
      expect(badge).toHaveClass('bg-destructive')
    })
  })
})