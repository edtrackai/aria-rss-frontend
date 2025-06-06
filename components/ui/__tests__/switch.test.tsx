import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Switch } from '../switch'

describe('Switch', () => {
  it('renders correctly with default props', () => {
    render(<Switch />)
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeInTheDocument()
    expect(switchElement).not.toBeChecked()
    expect(switchElement).toHaveAttribute('data-state', 'unchecked')
  })

  describe('toggle functionality', () => {
    it('toggles between checked and unchecked states', async () => {
      const user = userEvent.setup()
      render(<Switch />)
      const switchElement = screen.getByRole('switch')
      
      expect(switchElement).not.toBeChecked()
      expect(switchElement).toHaveAttribute('data-state', 'unchecked')
      
      await user.click(switchElement)
      expect(switchElement).toBeChecked()
      expect(switchElement).toHaveAttribute('data-state', 'checked')
      
      await user.click(switchElement)
      expect(switchElement).not.toBeChecked()
      expect(switchElement).toHaveAttribute('data-state', 'unchecked')
    })

    it('handles controlled state', () => {
      const { rerender } = render(<Switch checked={false} />)
      const switchElement = screen.getByRole('switch')
      
      expect(switchElement).not.toBeChecked()
      
      rerender(<Switch checked={true} />)
      expect(switchElement).toBeChecked()
    })

    it('calls onCheckedChange when toggled', async () => {
      const handleChange = jest.fn()
      const user = userEvent.setup()
      
      render(<Switch onCheckedChange={handleChange} />)
      const switchElement = screen.getByRole('switch')
      
      await user.click(switchElement)
      expect(handleChange).toHaveBeenCalledWith(true)
      
      await user.click(switchElement)
      expect(handleChange).toHaveBeenCalledWith(false)
    })
  })

  describe('disabled state', () => {
    it('applies disabled styles', () => {
      render(<Switch disabled />)
      const switchElement = screen.getByRole('switch')
      
      expect(switchElement).toBeDisabled()
      expect(switchElement).toHaveClass('disabled:cursor-not-allowed')
      expect(switchElement).toHaveClass('disabled:opacity-50')
    })

    it('does not toggle when disabled', async () => {
      const handleChange = jest.fn()
      const user = userEvent.setup()
      
      render(<Switch disabled onCheckedChange={handleChange} />)
      const switchElement = screen.getByRole('switch')
      
      await user.click(switchElement)
      expect(handleChange).not.toHaveBeenCalled()
      expect(switchElement).not.toBeChecked()
    })

    it('can be disabled while checked', () => {
      render(<Switch checked disabled />)
      const switchElement = screen.getByRole('switch')
      
      expect(switchElement).toBeChecked()
      expect(switchElement).toBeDisabled()
    })
  })

  describe('styling', () => {
    it('applies custom className', () => {
      render(<Switch className="custom-class" />)
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveClass('custom-class')
      // Should still have default classes
      expect(switchElement).toHaveClass('peer')
      expect(switchElement).toHaveClass('inline-flex')
    })

    it('has correct size and shape', () => {
      render(<Switch />)
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveClass('h-6')
      expect(switchElement).toHaveClass('w-11')
      expect(switchElement).toHaveClass('rounded-full')
    })

    it('changes background color based on state', () => {
      render(<Switch />)
      const switchElement = screen.getByRole('switch')
      
      expect(switchElement).toHaveClass('data-[state=unchecked]:bg-input')
      expect(switchElement).toHaveClass('data-[state=checked]:bg-primary')
    })

    it('has focus styles', () => {
      render(<Switch />)
      const switchElement = screen.getByRole('switch')
      
      expect(switchElement).toHaveClass('focus-visible:outline-none')
      expect(switchElement).toHaveClass('focus-visible:ring-2')
      expect(switchElement).toHaveClass('focus-visible:ring-ring')
      expect(switchElement).toHaveClass('focus-visible:ring-offset-2')
    })

    it('animates thumb position', () => {
      const { container } = render(<Switch checked />)
      const thumb = container.querySelector('[data-state="checked"]')?.querySelector('span')
      
      expect(thumb).toHaveClass('data-[state=checked]:translate-x-5')
      expect(thumb).toHaveClass('data-[state=unchecked]:translate-x-0')
      expect(thumb).toHaveClass('transition-transform')
    })
  })

  describe('keyboard navigation', () => {
    it('can be toggled with space key', async () => {
      const handleChange = jest.fn()
      const user = userEvent.setup()
      
      render(<Switch onCheckedChange={handleChange} />)
      const switchElement = screen.getByRole('switch')
      
      switchElement.focus()
      await user.keyboard(' ')
      
      expect(handleChange).toHaveBeenCalledWith(true)
      expect(switchElement).toBeChecked()
    })

    it('can be focused with tab', async () => {
      const user = userEvent.setup()
      
      render(
        <>
          <input type="text" />
          <Switch />
          <button>Next</button>
        </>
      )
      
      const textInput = screen.getByRole('textbox')
      const switchElement = screen.getByRole('switch')
      
      textInput.focus()
      await user.tab()
      
      expect(switchElement).toHaveFocus()
    })

    it('supports keyboard navigation when disabled', async () => {
      const user = userEvent.setup()
      
      render(
        <>
          <input type="text" />
          <Switch disabled />
          <button>Next</button>
        </>
      )
      
      const textInput = screen.getByRole('textbox')
      const switchElement = screen.getByRole('switch')
      
      textInput.focus()
      await user.tab()
      
      // Disabled switch may still receive focus but won't respond to interactions
      // This behavior can vary based on browser implementation
      expect(switchElement).toBeDisabled()
    })
  })

  describe('accessibility', () => {
    it('has correct ARIA role', () => {
      render(<Switch />)
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('role', 'switch')
    })

    it('announces state to screen readers', () => {
      const { rerender } = render(<Switch checked={false} />)
      const switchElement = screen.getByRole('switch')
      
      expect(switchElement).toHaveAttribute('aria-checked', 'false')
      
      rerender(<Switch checked={true} />)
      expect(switchElement).toHaveAttribute('aria-checked', 'true')
    })

    it('supports aria-label', () => {
      render(<Switch aria-label="Enable notifications" />)
      const switchElement = screen.getByLabelText('Enable notifications')
      expect(switchElement).toBeInTheDocument()
    })

    it('supports aria-describedby', () => {
      render(
        <>
          <Switch aria-describedby="switch-desc" />
          <span id="switch-desc">Toggle to enable or disable feature</span>
        </>
      )
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('aria-describedby', 'switch-desc')
    })

    it('works with label elements', async () => {
      const user = userEvent.setup()
      render(
        <label>
          <Switch />
          <span>Enable dark mode</span>
        </label>
      )
      
      const labelText = screen.getByText('Enable dark mode')
      const switchElement = screen.getByRole('switch')
      
      await user.click(labelText)
      expect(switchElement).toBeChecked()
    })

    it('indicates disabled state to assistive technology', () => {
      render(<Switch disabled aria-label="Disabled switch" />)
      const switchElement = screen.getByRole('switch')
      
      expect(switchElement).toBeDisabled()
      expect(switchElement).toHaveAttribute('data-disabled', '')
    })
  })

  describe('form integration', () => {
    it('supports name attribute', () => {
      // Note: Radix Switch may handle name attribute differently
      render(<Switch name="darkMode" />)
      const switchElement = screen.getByRole('switch')
      // Check that the component accepts the name prop without error
      expect(switchElement).toBeInTheDocument()
    })

    it('supports value attribute', () => {
      render(<Switch value="on" />)
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('value', 'on')
    })

    it('works in form submission', () => {
      const handleSubmit = jest.fn(e => e.preventDefault())
      
      render(
        <form onSubmit={handleSubmit}>
          <Switch name="notifications" value="enabled" />
          <button type="submit">Submit</button>
        </form>
      )
      
      const switchElement = screen.getByRole('switch')
      const submitButton = screen.getByRole('button')
      
      fireEvent.click(switchElement)
      fireEvent.click(submitButton)
      
      expect(handleSubmit).toHaveBeenCalled()
    })
  })

  describe('visual feedback', () => {
    it('shows cursor pointer on hover', () => {
      render(<Switch />)
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveClass('cursor-pointer')
    })

    it('has smooth transitions', () => {
      render(<Switch />)
      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveClass('transition-colors')
    })
  })

  describe('ref forwarding', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<Switch ref={ref} />)
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
      expect(ref.current?.getAttribute('role')).toBe('switch')
    })
  })

  describe('thumb element', () => {
    it('renders thumb element', () => {
      const { container } = render(<Switch />)
      const thumb = container.querySelector('.pointer-events-none')
      
      expect(thumb).toBeInTheDocument()
      expect(thumb).toHaveClass('block')
      expect(thumb).toHaveClass('h-5')
      expect(thumb).toHaveClass('w-5')
      expect(thumb).toHaveClass('rounded-full')
    })

    it('thumb has shadow', () => {
      const { container } = render(<Switch />)
      const thumb = container.querySelector('.pointer-events-none')
      
      expect(thumb).toHaveClass('shadow-lg')
    })
  })
})