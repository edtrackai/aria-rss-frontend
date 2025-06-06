import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../input'

describe('Input', () => {
  it('renders correctly with default props', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass('flex')
    expect(input).toHaveClass('h-10')
    expect(input).toHaveClass('w-full')
    expect(input).toHaveClass('rounded-md')
  })

  describe('value handling', () => {
    it('displays initial value', () => {
      render(<Input defaultValue="Initial value" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('Initial value')
    })

    it('handles controlled value', () => {
      const { rerender } = render(<Input value="Controlled value" onChange={() => {}} />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('Controlled value')

      rerender(<Input value="Updated value" onChange={() => {}} />)
      expect(input).toHaveValue('Updated value')
    })

    it('handles value changes', async () => {
      const handleChange = jest.fn()
      const user = userEvent.setup()
      
      render(<Input onChange={handleChange} />)
      const input = screen.getByRole('textbox')
      
      await user.type(input, 'Hello')
      expect(handleChange).toHaveBeenCalled()
      expect(input).toHaveValue('Hello')
    })

    it('handles paste events', async () => {
      const handlePaste = jest.fn()
      const user = userEvent.setup()
      
      render(<Input onPaste={handlePaste} />)
      const input = screen.getByRole('textbox')
      
      await user.click(input)
      await user.paste('Pasted text')
      expect(handlePaste).toHaveBeenCalled()
      expect(input).toHaveValue('Pasted text')
    })
  })

  describe('input types', () => {
    it('renders text input by default', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      // Input type defaults to text but might not have explicit attribute
      expect(input.tagName).toBe('INPUT')
      expect(input).not.toHaveAttribute('type', 'password')
    })

    it('renders email input', () => {
      render(<Input type="email" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('renders password input', () => {
      render(<Input type="password" placeholder="Password" />)
      const input = screen.getByPlaceholderText('Password')
      expect(input).toHaveAttribute('type', 'password')
    })

    it('renders number input', () => {
      render(<Input type="number" />)
      const input = screen.getByRole('spinbutton')
      expect(input).toHaveAttribute('type', 'number')
    })

    it('renders file input with correct classes', () => {
      const { container } = render(<Input type="file" />)
      const input = container.querySelector('input[type="file"]')
      expect(input).toHaveAttribute('type', 'file')
      expect(input).toHaveClass('file:border-0')
      expect(input).toHaveClass('file:bg-transparent')
    })
  })

  describe('states', () => {
    it('handles disabled state', () => {
      render(<Input disabled />)
      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
      expect(input).toHaveClass('disabled:cursor-not-allowed')
      expect(input).toHaveClass('disabled:opacity-50')
    })

    it('handles readonly state', () => {
      render(<Input readOnly value="Read only" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('readonly')
      expect(input).toHaveValue('Read only')
    })

    it('handles required state', () => {
      render(<Input required />)
      const input = screen.getByRole('textbox')
      expect(input).toBeRequired()
    })

    it('handles placeholder', () => {
      render(<Input placeholder="Enter text..." />)
      const input = screen.getByPlaceholderText('Enter text...')
      expect(input).toBeInTheDocument()
      expect(input).toHaveClass('placeholder:text-muted-foreground')
    })
  })

  describe('validation', () => {
    it('handles maxLength', async () => {
      const user = userEvent.setup()
      render(<Input maxLength={5} />)
      const input = screen.getByRole('textbox')
      
      await user.type(input, 'Hello World')
      expect(input).toHaveValue('Hello')
    })

    it('handles minLength validation', () => {
      render(<Input minLength={3} />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('minlength', '3')
    })

    it('handles pattern validation', () => {
      render(<Input pattern="[0-9]*" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('pattern', '[0-9]*')
    })

    it('handles min/max for number inputs', () => {
      render(<Input type="number" min={0} max={100} />)
      const input = screen.getByRole('spinbutton')
      expect(input).toHaveAttribute('min', '0')
      expect(input).toHaveAttribute('max', '100')
    })
  })

  describe('styling', () => {
    it('applies custom className', () => {
      render(<Input className="custom-class" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('custom-class')
      // Should still have default classes
      expect(input).toHaveClass('flex')
      expect(input).toHaveClass('h-10')
    })

    it('has correct border styles', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border')
      expect(input).toHaveClass('border-input')
    })

    it('has correct focus styles', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('focus-visible:outline-none')
      expect(input).toHaveClass('focus-visible:ring-2')
      expect(input).toHaveClass('focus-visible:ring-ring')
      expect(input).toHaveClass('focus-visible:ring-offset-2')
    })
  })

  describe('accessibility', () => {
    it('supports aria-label', () => {
      render(<Input aria-label="Email address" />)
      const input = screen.getByLabelText('Email address')
      expect(input).toBeInTheDocument()
    })

    it('supports aria-describedby', () => {
      render(
        <>
          <Input aria-describedby="helper-text" />
          <span id="helper-text">Helper text</span>
        </>
      )
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby', 'helper-text')
    })

    it('supports aria-invalid', () => {
      render(<Input aria-invalid="true" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('can be focused programmatically', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      
      input.focus()
      expect(input).toHaveFocus()
    })
  })

  describe('events', () => {
    it('handles focus events', () => {
      const handleFocus = jest.fn()
      const handleBlur = jest.fn()
      
      render(<Input onFocus={handleFocus} onBlur={handleBlur} />)
      const input = screen.getByRole('textbox')
      
      fireEvent.focus(input)
      expect(handleFocus).toHaveBeenCalledTimes(1)
      
      fireEvent.blur(input)
      expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it('handles keydown events', async () => {
      const handleKeyDown = jest.fn()
      const user = userEvent.setup()
      
      render(<Input onKeyDown={handleKeyDown} />)
      const input = screen.getByRole('textbox')
      
      await user.click(input)
      await user.keyboard('{Enter}')
      expect(handleKeyDown).toHaveBeenCalled()
    })
  })

  describe('ref forwarding', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<Input ref={ref} />)
      
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
      expect(ref.current?.tagName).toBe('INPUT')
    })
  })
})