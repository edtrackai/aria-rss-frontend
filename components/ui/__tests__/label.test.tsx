import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Label } from '../label'

describe('Label', () => {
  it('renders correctly with default props', () => {
    render(<Label>Label text</Label>)
    const label = screen.getByText('Label text')
    expect(label).toBeInTheDocument()
    expect(label).toHaveClass('text-sm')
    expect(label).toHaveClass('font-medium')
    expect(label).toHaveClass('leading-none')
  })

  describe('htmlFor attribute', () => {
    it('associates with form control via htmlFor', async () => {
      const user = userEvent.setup()
      render(
        <>
          <Label htmlFor="email-input">Email</Label>
          <input id="email-input" type="email" />
        </>
      )
      const label = screen.getByText('Email')
      const input = screen.getByRole('textbox')
      
      expect(label).toHaveAttribute('for', 'email-input')
      // Clicking the label should focus the input
      await user.click(label)
      expect(input).toHaveFocus()
    })

    it('handles nested form controls', async () => {
      const user = userEvent.setup()
      render(
        <Label>
          <input type="checkbox" />
          <span>Accept terms</span>
        </Label>
      )
      const checkbox = screen.getByRole('checkbox')
      const labelText = screen.getByText('Accept terms')
      
      // Clicking the label text should toggle the checkbox
      await user.click(labelText)
      expect(checkbox).toBeChecked()
    })
  })

  describe('required indicator', () => {
    it('can display required indicator with custom content', () => {
      render(
        <Label>
          Name <span className="text-red-500">*</span>
        </Label>
      )
      const label = screen.getByText(/Name/)
      const requiredIndicator = label.querySelector('.text-red-500')
      expect(requiredIndicator).toHaveTextContent('*')
    })

    it('supports aria-required on associated input', () => {
      render(
        <>
          <Label htmlFor="required-input">Required Field</Label>
          <input id="required-input" aria-required="true" />
        </>
      )
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-required', 'true')
    })
  })

  describe('disabled state', () => {
    it('applies disabled styles when peer is disabled', () => {
      render(
        <div>
          <input className="peer" disabled />
          <Label>Disabled Label</Label>
        </div>
      )
      const label = screen.getByText('Disabled Label')
      expect(label).toHaveClass('peer-disabled:cursor-not-allowed')
      expect(label).toHaveClass('peer-disabled:opacity-70')
    })
  })

  describe('styling', () => {
    it('applies custom className', () => {
      render(<Label className="custom-class text-lg">Custom Label</Label>)
      const label = screen.getByText('Custom Label')
      expect(label).toHaveClass('custom-class')
      expect(label).toHaveClass('text-lg')
      // Should still have default classes
      expect(label).toHaveClass('font-medium')
      // Note: custom classes may override defaults
    })

    it('preserves default text styling', () => {
      render(<Label>Styled Label</Label>)
      const label = screen.getByText('Styled Label')
      expect(label).toHaveClass('text-sm')
      expect(label).toHaveClass('font-medium')
      expect(label).toHaveClass('leading-none')
    })
  })

  describe('accessibility', () => {
    it('renders as label element', () => {
      render(<Label>Accessible Label</Label>)
      const label = screen.getByText('Accessible Label')
      expect(label.tagName).toBe('LABEL')
    })

    it('can be used with aria-label', () => {
      render(<Label aria-label="Screen reader label">Visual Label</Label>)
      const label = screen.getByText('Visual Label')
      expect(label).toHaveAttribute('aria-label', 'Screen reader label')
    })

    it('supports aria-describedby for additional context', () => {
      render(
        <>
          <Label htmlFor="field" aria-describedby="field-help">
            Field Label
          </Label>
          <input id="field" />
          <span id="field-help">Additional help text</span>
        </>
      )
      const label = screen.getByText('Field Label')
      expect(label).toHaveAttribute('aria-describedby', 'field-help')
    })

    it('works with screen readers for form validation', () => {
      render(
        <>
          <Label htmlFor="error-field">Email</Label>
          <input id="error-field" aria-invalid="true" aria-describedby="error-msg" />
          <span id="error-msg">Invalid email format</span>
        </>
      )
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveAttribute('aria-describedby', 'error-msg')
    })
  })

  describe('complex label content', () => {
    it('supports icons within labels', () => {
      render(
        <Label>
          <svg className="icon" />
          <span>With Icon</span>
        </Label>
      )
      const label = screen.getByText('With Icon').parentElement
      const icon = label?.querySelector('.icon')
      expect(icon).toBeInTheDocument()
    })

    it('supports tooltips or help text', () => {
      render(
        <Label>
          Password
          <span className="ml-1 text-xs text-gray-500">(min 8 chars)</span>
        </Label>
      )
      const helpText = screen.getByText('(min 8 chars)')
      expect(helpText).toHaveClass('text-xs')
      expect(helpText).toHaveClass('text-gray-500')
    })
  })

  describe('ref forwarding', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLLabelElement>()
      render(<Label ref={ref}>Ref Label</Label>)
      
      expect(ref.current).toBeInstanceOf(HTMLLabelElement)
      expect(ref.current?.textContent).toBe('Ref Label')
    })
  })

  describe('event handling', () => {
    it('handles click events', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      
      render(<Label onClick={handleClick}>Clickable Label</Label>)
      const label = screen.getByText('Clickable Label')
      
      await user.click(label)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('propagates events to associated input', async () => {
      const handleInputFocus = jest.fn()
      const user = userEvent.setup()
      
      render(
        <>
          <Label htmlFor="test-input">Click me</Label>
          <input id="test-input" onFocus={handleInputFocus} />
        </>
      )
      const label = screen.getByText('Click me')
      
      await user.click(label)
      expect(handleInputFocus).toHaveBeenCalled()
    })
  })

  describe('display variations', () => {
    it('can be displayed inline', () => {
      render(<Label style={{ display: 'inline' }}>Inline Label</Label>)
      const label = screen.getByText('Inline Label')
      expect(label).toHaveStyle({ display: 'inline' })
    })

    it('can be displayed as block', () => {
      render(<Label style={{ display: 'block' }}>Block Label</Label>)
      const label = screen.getByText('Block Label')
      expect(label).toHaveStyle({ display: 'block' })
    })
  })
})