import React from 'react'
import { render, screen } from '@testing-library/react'
import { Alert, AlertTitle, AlertDescription } from '../alert'
import { AlertCircle, Terminal } from 'lucide-react'

describe('Alert', () => {
  describe('Alert component', () => {
    it('renders correctly with default props', () => {
      render(<Alert>Default alert message</Alert>)
      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveTextContent('Default alert message')
      expect(alert).toHaveClass('relative')
      expect(alert).toHaveClass('w-full')
      expect(alert).toHaveClass('rounded-lg')
      expect(alert).toHaveClass('border')
      expect(alert).toHaveClass('p-4')
    })

    it('renders default variant', () => {
      render(<Alert variant="default">Default variant</Alert>)
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('bg-background')
      expect(alert).toHaveClass('text-foreground')
    })

    it('renders destructive variant', () => {
      render(<Alert variant="destructive">Error message</Alert>)
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('border-destructive/50')
      expect(alert).toHaveClass('text-destructive')
      expect(alert).toHaveClass('dark:border-destructive')
    })

    it('applies custom className', () => {
      render(<Alert className="custom-alert mt-4">Custom alert</Alert>)
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('custom-alert')
      expect(alert).toHaveClass('mt-4')
      // Should still have default classes
      expect(alert).toHaveClass('relative')
      expect(alert).toHaveClass('rounded-lg')
    })

    it('has correct ARIA role', () => {
      render(<Alert>Accessible alert</Alert>)
      const alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('role', 'alert')
    })
  })

  describe('AlertTitle component', () => {
    it('renders as h5 element', () => {
      render(<AlertTitle>Alert Title</AlertTitle>)
      const title = screen.getByText('Alert Title')
      expect(title).toBeInTheDocument()
      expect(title.tagName).toBe('H5')
    })

    it('has correct styling', () => {
      render(<AlertTitle>Styled Title</AlertTitle>)
      const title = screen.getByText('Styled Title')
      expect(title).toHaveClass('mb-1')
      expect(title).toHaveClass('font-medium')
      expect(title).toHaveClass('leading-none')
      expect(title).toHaveClass('tracking-tight')
    })

    it('applies custom className', () => {
      render(<AlertTitle className="text-lg">Large Title</AlertTitle>)
      const title = screen.getByText('Large Title')
      expect(title).toHaveClass('text-lg')
      expect(title).toHaveClass('font-medium')
    })
  })

  describe('AlertDescription component', () => {
    it('renders as div element', () => {
      render(<AlertDescription>Alert description text</AlertDescription>)
      const description = screen.getByText('Alert description text')
      expect(description).toBeInTheDocument()
      expect(description.tagName).toBe('DIV')
    })

    it('has correct styling', () => {
      render(<AlertDescription>Styled description</AlertDescription>)
      const description = screen.getByText('Styled description')
      expect(description).toHaveClass('text-sm')
      expect(description).toHaveClass('[&_p]:leading-relaxed')
    })

    it('applies custom className', () => {
      render(<AlertDescription className="text-base">Larger description</AlertDescription>)
      const description = screen.getByText('Larger description')
      expect(description).toHaveClass('text-base')
      // Custom class may override default, so just check it's applied
      expect(description).toHaveClass('[&_p]:leading-relaxed')
    })

    it('styles nested paragraphs', () => {
      render(
        <AlertDescription>
          <p>First paragraph</p>
          <p>Second paragraph</p>
        </AlertDescription>
      )
      
      const description = screen.getByText('First paragraph').parentElement
      expect(description).toHaveClass('[&_p]:leading-relaxed')
    })
  })

  describe('Alert with icons', () => {
    it('positions icon correctly', () => {
      render(
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Terminal</AlertTitle>
          <AlertDescription>You can use the terminal now.</AlertDescription>
        </Alert>
      )
      
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('[&>svg]:absolute')
      expect(alert).toHaveClass('[&>svg]:left-4')
      expect(alert).toHaveClass('[&>svg]:top-4')
      expect(alert).toHaveClass('[&>svg]:text-foreground')
    })

    it('applies correct padding when icon is present', () => {
      render(
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>With Icon</AlertTitle>
        </Alert>
      )
      
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('[&>svg~*]:pl-7')
      expect(alert).toHaveClass('[&>svg+div]:translate-y-[-3px]')
    })

    it('applies destructive icon color', () => {
      const { container } = render(
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
        </Alert>
      )
      
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('[&>svg]:text-destructive')
    })
  })

  describe('Complete alert composition', () => {
    it('renders all components together correctly', () => {
      render(
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            You can add components to your app using the cli.
          </AlertDescription>
        </Alert>
      )
      
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Heads up!')).toBeInTheDocument()
      expect(screen.getByText(/You can add components/)).toBeInTheDocument()
    })

    it('works without icon', () => {
      render(
        <Alert>
          <AlertTitle>No Icon Alert</AlertTitle>
          <AlertDescription>This alert has no icon.</AlertDescription>
        </Alert>
      )
      
      expect(screen.getByText('No Icon Alert')).toBeInTheDocument()
      expect(screen.getByText('This alert has no icon.')).toBeInTheDocument()
    })

    it('works with only description', () => {
      render(
        <Alert>
          <AlertDescription>Simple message without title.</AlertDescription>
        </Alert>
      )
      
      expect(screen.getByText('Simple message without title.')).toBeInTheDocument()
    })
  })

  describe('use cases', () => {
    it('can display success messages', () => {
      render(
        <Alert className="border-green-500 text-green-600">
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>Your changes have been saved.</AlertDescription>
        </Alert>
      )
      
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('border-green-500')
      expect(alert).toHaveClass('text-green-600')
    })

    it('can display warning messages', () => {
      render(
        <Alert className="border-yellow-500 text-yellow-600">
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>Please review before proceeding.</AlertDescription>
        </Alert>
      )
      
      const alert = screen.getByRole('alert')
      expect(alert).toHaveClass('border-yellow-500')
      expect(alert).toHaveClass('text-yellow-600')
    })

    it('can display informational messages', () => {
      render(
        <Alert>
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>
            New features are available. Check the changelog for details.
          </AlertDescription>
        </Alert>
      )
      
      expect(screen.getByText('Information')).toBeInTheDocument()
      expect(screen.getByText(/New features are available/)).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('supports aria-live for dynamic alerts', () => {
      render(
        <Alert aria-live="assertive" aria-atomic="true">
          <AlertDescription>Urgent message</AlertDescription>
        </Alert>
      )
      
      const alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('aria-live', 'assertive')
      expect(alert).toHaveAttribute('aria-atomic', 'true')
    })

    it('supports additional ARIA attributes', () => {
      render(
        <Alert aria-label="Error notification" aria-describedby="error-details">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription id="error-details">
            Something went wrong.
          </AlertDescription>
        </Alert>
      )
      
      const alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('aria-label', 'Error notification')
      expect(alert).toHaveAttribute('aria-describedby', 'error-details')
    })

    it('maintains semantic structure', () => {
      const { container } = render(
        <Alert>
          <AlertTitle>Title</AlertTitle>
          <AlertDescription>Description</AlertDescription>
        </Alert>
      )
      
      const h5 = container.querySelector('h5')
      const div = container.querySelector('.text-sm')
      
      expect(h5).toBeInTheDocument()
      expect(div).toBeInTheDocument()
    })
  })

  describe('ref forwarding', () => {
    it('forwards ref for Alert', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Alert ref={ref}>Alert with ref</Alert>)
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
      expect(ref.current?.getAttribute('role')).toBe('alert')
    })

    it('forwards ref for AlertTitle', () => {
      const ref = React.createRef<HTMLParagraphElement>()
      render(<AlertTitle ref={ref}>Title with ref</AlertTitle>)
      
      expect(ref.current).toBeInstanceOf(HTMLHeadingElement)
      expect(ref.current?.tagName).toBe('H5')
    })

    it('forwards ref for AlertDescription', () => {
      const ref = React.createRef<HTMLParagraphElement>()
      render(<AlertDescription ref={ref}>Description with ref</AlertDescription>)
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('styling edge cases', () => {
    it('handles long content gracefully', () => {
      const longText = 'This is a very long alert message that should wrap properly within the alert container without breaking the layout or causing any overflow issues.'
      
      render(
        <Alert>
          <AlertTitle>Long Content Alert</AlertTitle>
          <AlertDescription>{longText}</AlertDescription>
        </Alert>
      )
      
      expect(screen.getByText(longText)).toBeInTheDocument()
    })

    it('handles multiple paragraphs in description', () => {
      render(
        <Alert>
          <AlertDescription>
            <p>First paragraph of the alert.</p>
            <p>Second paragraph with more details.</p>
            <p>Third paragraph with conclusion.</p>
          </AlertDescription>
        </Alert>
      )
      
      expect(screen.getByText('First paragraph of the alert.')).toBeInTheDocument()
      expect(screen.getByText('Second paragraph with more details.')).toBeInTheDocument()
      expect(screen.getByText('Third paragraph with conclusion.')).toBeInTheDocument()
    })
  })
})