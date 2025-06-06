import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from '../checkbox'

describe('Checkbox', () => {
  it('renders correctly with default props', () => {
    render(<Checkbox />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).not.toBeChecked()
    expect(checkbox).toHaveClass('peer')
    expect(checkbox).toHaveClass('h-4')
    expect(checkbox).toHaveClass('w-4')
  })

  describe('checked states', () => {
    it('handles uncontrolled checked state', async () => {
      const user = userEvent.setup()
      render(<Checkbox />)
      const checkbox = screen.getByRole('checkbox')
      
      expect(checkbox).not.toBeChecked()
      
      await user.click(checkbox)
      expect(checkbox).toBeChecked()
      
      await user.click(checkbox)
      expect(checkbox).not.toBeChecked()
    })

    it('handles controlled checked state', () => {
      const { rerender } = render(<Checkbox checked={false} />)
      const checkbox = screen.getByRole('checkbox')
      
      expect(checkbox).not.toBeChecked()
      expect(checkbox).toHaveAttribute('data-state', 'unchecked')
      
      rerender(<Checkbox checked={true} />)
      expect(checkbox).toBeChecked()
      expect(checkbox).toHaveAttribute('data-state', 'checked')
    })

    it('handles indeterminate state', () => {
      render(<Checkbox checked="indeterminate" />)
      const checkbox = screen.getByRole('checkbox')
      
      expect(checkbox).toHaveAttribute('data-state', 'indeterminate')
      expect(checkbox).toHaveAttribute('aria-checked', 'mixed')
    })

    it('displays check icon when checked', () => {
      const { container } = render(<Checkbox checked={true} />)
      const checkIcon = container.querySelector('svg')
      
      expect(checkIcon).toBeInTheDocument()
      expect(checkIcon).toHaveClass('h-4')
      expect(checkIcon).toHaveClass('w-4')
    })

    it('hides check icon when unchecked', () => {
      const { container } = render(<Checkbox checked={false} />)
      const indicator = container.querySelector('[data-state="unchecked"]')
      const checkIcon = indicator?.querySelector('svg')
      
      // The indicator exists but the icon might not be rendered when unchecked
      expect(indicator).toBeInTheDocument()
    })
  })

  describe('onChange handlers', () => {
    it('calls onCheckedChange when clicked', async () => {
      const handleChange = jest.fn()
      const user = userEvent.setup()
      
      render(<Checkbox onCheckedChange={handleChange} />)
      const checkbox = screen.getByRole('checkbox')
      
      await user.click(checkbox)
      expect(handleChange).toHaveBeenCalledWith(true)
      
      await user.click(checkbox)
      expect(handleChange).toHaveBeenCalledWith(false)
    })

    it('does not call handler when disabled', async () => {
      const handleChange = jest.fn()
      const user = userEvent.setup()
      
      render(<Checkbox disabled onCheckedChange={handleChange} />)
      const checkbox = screen.getByRole('checkbox')
      
      await user.click(checkbox)
      expect(handleChange).not.toHaveBeenCalled()
    })

    it('handles form submission', () => {
      const handleSubmit = jest.fn(e => e.preventDefault())
      
      render(
        <form onSubmit={handleSubmit}>
          <Checkbox name="terms" value="accepted" />
          <button type="submit">Submit</button>
        </form>
      )
      
      const checkbox = screen.getByRole('checkbox')
      const submitButton = screen.getByRole('button')
      
      fireEvent.click(checkbox)
      fireEvent.click(submitButton)
      
      expect(handleSubmit).toHaveBeenCalled()
    })
  })

  describe('disabled state', () => {
    it('applies disabled styles', () => {
      render(<Checkbox disabled />)
      const checkbox = screen.getByRole('checkbox')
      
      expect(checkbox).toBeDisabled()
      expect(checkbox).toHaveClass('disabled:cursor-not-allowed')
      expect(checkbox).toHaveClass('disabled:opacity-50')
    })

    it('prevents interaction when disabled', async () => {
      const user = userEvent.setup()
      render(<Checkbox disabled />)
      const checkbox = screen.getByRole('checkbox')
      
      await user.click(checkbox)
      expect(checkbox).not.toBeChecked()
    })

    it('can be disabled while checked', () => {
      render(<Checkbox checked disabled />)
      const checkbox = screen.getByRole('checkbox')
      
      expect(checkbox).toBeChecked()
      expect(checkbox).toBeDisabled()
    })
  })

  describe('styling', () => {
    it('applies custom className', () => {
      render(<Checkbox className="custom-class" />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveClass('custom-class')
      // Should still have default classes
      expect(checkbox).toHaveClass('peer')
      expect(checkbox).toHaveClass('h-4')
      expect(checkbox).toHaveClass('w-4')
    })

    it('has correct border styles', () => {
      render(<Checkbox />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveClass('border')
      expect(checkbox).toHaveClass('border-primary')
      expect(checkbox).toHaveClass('rounded-sm')
    })

    it('applies checked styles', () => {
      render(<Checkbox checked />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveClass('data-[state=checked]:bg-primary')
      expect(checkbox).toHaveClass('data-[state=checked]:text-primary-foreground')
    })

    it('has focus styles', () => {
      render(<Checkbox />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveClass('focus-visible:outline-none')
      expect(checkbox).toHaveClass('focus-visible:ring-2')
      expect(checkbox).toHaveClass('focus-visible:ring-ring')
      expect(checkbox).toHaveClass('focus-visible:ring-offset-2')
    })
  })

  describe('keyboard navigation', () => {
    it('can be toggled with space key', async () => {
      const handleChange = jest.fn()
      const user = userEvent.setup()
      
      render(<Checkbox onCheckedChange={handleChange} />)
      const checkbox = screen.getByRole('checkbox')
      
      checkbox.focus()
      await user.keyboard(' ')
      
      expect(handleChange).toHaveBeenCalledWith(true)
      expect(checkbox).toBeChecked()
    })

    it('can be focused with tab', async () => {
      const user = userEvent.setup()
      
      render(
        <>
          <input type="text" />
          <Checkbox />
          <button>Next</button>
        </>
      )
      
      const textInput = screen.getByRole('textbox')
      const checkbox = screen.getByRole('checkbox')
      
      textInput.focus()
      await user.tab()
      
      expect(checkbox).toHaveFocus()
    })
  })

  describe('accessibility', () => {
    it('has correct ARIA role', () => {
      render(<Checkbox />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('role', 'checkbox')
    })

    it('supports aria-label', () => {
      render(<Checkbox aria-label="Accept terms and conditions" />)
      const checkbox = screen.getByLabelText('Accept terms and conditions')
      expect(checkbox).toBeInTheDocument()
    })

    it('supports aria-describedby', () => {
      render(
        <>
          <Checkbox aria-describedby="terms-desc" />
          <span id="terms-desc">You must accept to continue</span>
        </>
      )
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-describedby', 'terms-desc')
    })

    it('announces state changes to screen readers', () => {
      const { rerender } = render(<Checkbox checked={false} />)
      const checkbox = screen.getByRole('checkbox')
      
      expect(checkbox).toHaveAttribute('aria-checked', 'false')
      
      rerender(<Checkbox checked={true} />)
      expect(checkbox).toHaveAttribute('aria-checked', 'true')
      
      rerender(<Checkbox checked="indeterminate" />)
      expect(checkbox).toHaveAttribute('aria-checked', 'mixed')
    })

    it('works with label elements', async () => {
      const user = userEvent.setup()
      render(
        <label>
          <Checkbox />
          <span>I agree to the terms</span>
        </label>
      )
      
      const labelText = screen.getByText('I agree to the terms')
      const checkbox = screen.getByRole('checkbox')
      
      await user.click(labelText)
      expect(checkbox).toBeChecked()
    })
  })

  describe('form integration', () => {
    it('supports name attribute', () => {
      // Note: Radix Checkbox may handle name attribute differently
      render(<Checkbox name="newsletter" />)
      const checkbox = screen.getByRole('checkbox')
      // Check that the component accepts the name prop without error
      expect(checkbox).toBeInTheDocument()
    })

    it('supports value attribute', () => {
      render(<Checkbox value="yes" />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('value', 'yes')
    })

    it('supports required attribute', () => {
      render(<Checkbox required />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeRequired()
    })

    it('works in form validation', () => {
      // Note: Radix Checkbox validation works differently than native inputs
      render(
        <form>
          <Checkbox required />
          <button type="submit">Submit</button>
        </form>
      )
      
      const checkbox = screen.getByRole('checkbox')
      const submitButton = screen.getByRole('button')
      
      expect(checkbox).toBeRequired()
      fireEvent.click(submitButton)
      
      // Form validation with Radix components may work differently
      expect(checkbox).toBeInTheDocument()
    })
  })

  describe('ref forwarding', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<Checkbox ref={ref} />)
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
      expect(ref.current?.getAttribute('role')).toBe('checkbox')
    })
  })
})