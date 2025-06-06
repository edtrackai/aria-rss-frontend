import React from 'react'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '../card'

describe('Card', () => {
  describe('Card component', () => {
    it('renders correctly with default props', () => {
      render(<Card>Card content</Card>)
      const card = screen.getByText('Card content')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('rounded-lg')
      expect(card).toHaveClass('border')
      expect(card).toHaveClass('bg-card')
      expect(card).toHaveClass('text-card-foreground')
      expect(card).toHaveClass('shadow-sm')
    })

    it('applies custom className', () => {
      render(<Card className="custom-card">Custom card</Card>)
      const card = screen.getByText('Custom card')
      expect(card).toHaveClass('custom-card')
      // Should still have default classes
      expect(card).toHaveClass('rounded-lg')
      expect(card).toHaveClass('border')
    })

    it('forwards additional props', () => {
      render(<Card data-testid="test-card" aria-label="Test card">Content</Card>)
      const card = screen.getByTestId('test-card')
      expect(card).toHaveAttribute('aria-label', 'Test card')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Card ref={ref}>Card with ref</Card>)
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
      expect(ref.current?.textContent).toBe('Card with ref')
    })
  })

  describe('CardHeader component', () => {
    it('renders correctly with default props', () => {
      render(<CardHeader>Header content</CardHeader>)
      const header = screen.getByText('Header content')
      expect(header).toBeInTheDocument()
      expect(header).toHaveClass('flex')
      expect(header).toHaveClass('flex-col')
      expect(header).toHaveClass('space-y-1.5')
      expect(header).toHaveClass('p-6')
    })

    it('applies custom className', () => {
      render(<CardHeader className="custom-header">Custom header</CardHeader>)
      const header = screen.getByText('Custom header')
      expect(header).toHaveClass('custom-header')
      expect(header).toHaveClass('flex')
    })

    it('can contain CardTitle and CardDescription', () => {
      render(
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
      )
      
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
    })
  })

  describe('CardTitle component', () => {
    it('renders as h3 element', () => {
      render(<CardTitle>Card Title</CardTitle>)
      const title = screen.getByText('Card Title')
      expect(title).toBeInTheDocument()
      expect(title.tagName).toBe('H3')
    })

    it('has correct styling', () => {
      render(<CardTitle>Styled Title</CardTitle>)
      const title = screen.getByText('Styled Title')
      expect(title).toHaveClass('text-2xl')
      expect(title).toHaveClass('font-semibold')
      expect(title).toHaveClass('leading-none')
      expect(title).toHaveClass('tracking-tight')
    })

    it('applies custom className', () => {
      render(<CardTitle className="text-3xl">Large Title</CardTitle>)
      const title = screen.getByText('Large Title')
      expect(title).toHaveClass('text-3xl')
      expect(title).toHaveClass('font-semibold')
    })
  })

  describe('CardDescription component', () => {
    it('renders as p element', () => {
      render(<CardDescription>Card description text</CardDescription>)
      const description = screen.getByText('Card description text')
      expect(description).toBeInTheDocument()
      expect(description.tagName).toBe('P')
    })

    it('has correct styling', () => {
      render(<CardDescription>Styled description</CardDescription>)
      const description = screen.getByText('Styled description')
      expect(description).toHaveClass('text-sm')
      expect(description).toHaveClass('text-muted-foreground')
    })

    it('applies custom className', () => {
      render(<CardDescription className="text-base">Larger description</CardDescription>)
      const description = screen.getByText('Larger description')
      expect(description).toHaveClass('text-base')
      expect(description).toHaveClass('text-muted-foreground')
    })
  })

  describe('CardContent component', () => {
    it('renders correctly with default props', () => {
      render(<CardContent>Content area</CardContent>)
      const content = screen.getByText('Content area')
      expect(content).toBeInTheDocument()
      expect(content).toHaveClass('p-6')
      expect(content).toHaveClass('pt-0')
    })

    it('applies custom className', () => {
      render(<CardContent className="custom-content">Custom content</CardContent>)
      const content = screen.getByText('Custom content')
      expect(content).toHaveClass('custom-content')
      expect(content).toHaveClass('p-6')
    })

    it('can contain any content', () => {
      render(
        <CardContent>
          <p>Paragraph</p>
          <button>Button</button>
          <div>Div</div>
        </CardContent>
      )
      
      expect(screen.getByText('Paragraph')).toBeInTheDocument()
      expect(screen.getByText('Button')).toBeInTheDocument()
      expect(screen.getByText('Div')).toBeInTheDocument()
    })
  })

  describe('CardFooter component', () => {
    it('renders correctly with default props', () => {
      render(<CardFooter>Footer content</CardFooter>)
      const footer = screen.getByText('Footer content')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveClass('flex')
      expect(footer).toHaveClass('items-center')
      expect(footer).toHaveClass('p-6')
      expect(footer).toHaveClass('pt-0')
    })

    it('applies custom className', () => {
      render(<CardFooter className="justify-end">Right-aligned footer</CardFooter>)
      const footer = screen.getByText('Right-aligned footer')
      expect(footer).toHaveClass('justify-end')
      expect(footer).toHaveClass('flex')
    })

    it('is suitable for action buttons', () => {
      render(
        <CardFooter>
          <button>Cancel</button>
          <button>Save</button>
        </CardFooter>
      )
      
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Save')).toBeInTheDocument()
    })
  })

  describe('Complete card composition', () => {
    it('renders all sub-components correctly', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Complete Card</CardTitle>
            <CardDescription>This is a complete card example</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      )
      
      expect(screen.getByText('Complete Card')).toBeInTheDocument()
      expect(screen.getByText('This is a complete card example')).toBeInTheDocument()
      expect(screen.getByText('Main content goes here')).toBeInTheDocument()
      expect(screen.getByText('Action')).toBeInTheDocument()
    })

    it('maintains proper spacing between sections', () => {
      const { container } = render(
        <Card>
          <CardHeader>Header</CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      )
      
      const header = screen.getByText('Header')
      const content = screen.getByText('Content')
      const footer = screen.getByText('Footer')
      
      expect(header).toHaveClass('p-6')
      expect(content).toHaveClass('p-6', 'pt-0')
      expect(footer).toHaveClass('p-6', 'pt-0')
    })
  })

  describe('accessibility', () => {
    it('supports semantic HTML structure', () => {
      render(
        <Card role="article" aria-label="User profile card">
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      )
      
      const card = screen.getByRole('article')
      expect(card).toHaveAttribute('aria-label', 'User profile card')
    })

    it('sub-components maintain document hierarchy', () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>H3 Title</CardTitle>
            <CardDescription>Paragraph description</CardDescription>
          </CardHeader>
        </Card>
      )
      
      const h3 = container.querySelector('h3')
      const p = container.querySelector('p')
      
      expect(h3).toBeInTheDocument()
      expect(p).toBeInTheDocument()
    })
  })

  describe('styling variations', () => {
    it('can be styled as a clickable card', () => {
      render(
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          Clickable card
        </Card>
      )
      
      const card = screen.getByText('Clickable card')
      expect(card).toHaveClass('cursor-pointer')
      expect(card).toHaveClass('hover:shadow-lg')
      expect(card).toHaveClass('transition-shadow')
    })

    it('can have custom border and shadow styles', () => {
      render(
        <Card className="border-2 border-primary shadow-xl">
          Styled card
        </Card>
      )
      
      const card = screen.getByText('Styled card')
      expect(card).toHaveClass('border-2')
      expect(card).toHaveClass('border-primary')
      expect(card).toHaveClass('shadow-xl')
    })
  })

  describe('ref forwarding for all components', () => {
    it('forwards refs for all sub-components', () => {
      const cardRef = React.createRef<HTMLDivElement>()
      const headerRef = React.createRef<HTMLDivElement>()
      const titleRef = React.createRef<HTMLParagraphElement>()
      const descRef = React.createRef<HTMLParagraphElement>()
      const contentRef = React.createRef<HTMLDivElement>()
      const footerRef = React.createRef<HTMLDivElement>()
      
      render(
        <Card ref={cardRef}>
          <CardHeader ref={headerRef}>
            <CardTitle ref={titleRef}>Title</CardTitle>
            <CardDescription ref={descRef}>Description</CardDescription>
          </CardHeader>
          <CardContent ref={contentRef}>Content</CardContent>
          <CardFooter ref={footerRef}>Footer</CardFooter>
        </Card>
      )
      
      expect(cardRef.current).toBeInstanceOf(HTMLDivElement)
      expect(headerRef.current).toBeInstanceOf(HTMLDivElement)
      expect(titleRef.current?.tagName).toBe('H3')
      expect(descRef.current?.tagName).toBe('P')
      expect(contentRef.current).toBeInstanceOf(HTMLDivElement)
      expect(footerRef.current).toBeInstanceOf(HTMLDivElement)
    })
  })
})