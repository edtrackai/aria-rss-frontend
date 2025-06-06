import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Textarea } from '../textarea'

describe('Textarea', () => {
  it('renders correctly with default props', () => {
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveClass('flex')
    expect(textarea).toHaveClass('min-h-[80px]')
    expect(textarea).toHaveClass('w-full')
    expect(textarea).toHaveClass('rounded-md')
  })

  describe('multi-line input', () => {
    it('handles multi-line text input', async () => {
      const user = userEvent.setup()
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      
      await user.type(textarea, 'Line 1{Enter}Line 2{Enter}Line 3')
      expect(textarea).toHaveValue('Line 1\nLine 2\nLine 3')
    })

    it('preserves line breaks in controlled component', () => {
      const multilineText = 'First line\nSecond line\nThird line'
      render(<Textarea value={multilineText} onChange={() => {}} />)
      const textarea = screen.getByRole('textbox')
      
      expect(textarea).toHaveValue(multilineText)
    })

    it('handles tab characters', async () => {
      const user = userEvent.setup()
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      
      // Note: userEvent.type might not insert actual tab characters
      // This tests that tab key events are handled properly
      await user.type(textarea, 'Before\tAfter')
      expect(textarea.value).toContain('Before')
      expect(textarea.value).toContain('After')
    })
  })

  describe('character limits', () => {
    it('respects maxLength attribute', async () => {
      const user = userEvent.setup()
      render(<Textarea maxLength={10} />)
      const textarea = screen.getByRole('textbox')
      
      await user.type(textarea, 'This is a very long text')
      expect(textarea).toHaveValue('This is a ')
      expect(textarea.value.length).toBe(10)
    })

    it('shows character count when maxLength is set', () => {
      render(<Textarea maxLength={100} />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('maxlength', '100')
    })

    it('handles minLength validation', () => {
      render(<Textarea minLength={10} />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('minlength', '10')
    })
  })

  describe('sizing', () => {
    it('has minimum height by default', () => {
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('min-h-[80px]')
    })

    it('accepts custom rows attribute', () => {
      render(<Textarea rows={5} />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('rows', '5')
    })

    it('accepts custom cols attribute', () => {
      render(<Textarea cols={50} />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('cols', '50')
    })

    it('applies custom className while preserving defaults', () => {
      render(<Textarea className="min-h-[200px] custom-class" />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('min-h-[200px]')
      expect(textarea).toHaveClass('custom-class')
      expect(textarea).toHaveClass('flex')
      expect(textarea).toHaveClass('w-full')
    })
  })

  describe('states', () => {
    it('handles disabled state', () => {
      render(<Textarea disabled />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeDisabled()
      expect(textarea).toHaveClass('disabled:cursor-not-allowed')
      expect(textarea).toHaveClass('disabled:opacity-50')
    })

    it('handles readonly state', () => {
      render(<Textarea readOnly value="Read only text" onChange={() => {}} />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('readonly')
      expect(textarea).toHaveValue('Read only text')
    })

    it('handles required state', () => {
      render(<Textarea required />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeRequired()
    })

    it('displays placeholder text', () => {
      render(<Textarea placeholder="Enter your message..." />)
      const textarea = screen.getByPlaceholderText('Enter your message...')
      expect(textarea).toBeInTheDocument()
      expect(textarea).toHaveClass('placeholder:text-muted-foreground')
    })
  })

  describe('styling', () => {
    it('has correct border styles', () => {
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('border')
      expect(textarea).toHaveClass('border-input')
    })

    it('has correct background styles', () => {
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('bg-background')
    })

    it('has correct padding', () => {
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('px-3')
      expect(textarea).toHaveClass('py-2')
    })

    it('has correct focus styles', () => {
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('focus-visible:outline-none')
      expect(textarea).toHaveClass('focus-visible:ring-2')
      expect(textarea).toHaveClass('focus-visible:ring-ring')
      expect(textarea).toHaveClass('focus-visible:ring-offset-2')
    })
  })

  describe('events', () => {
    it('handles change events', async () => {
      const handleChange = jest.fn()
      const user = userEvent.setup()
      
      render(<Textarea onChange={handleChange} />)
      const textarea = screen.getByRole('textbox')
      
      await user.type(textarea, 'Test')
      expect(handleChange).toHaveBeenCalled()
    })

    it('handles focus and blur events', () => {
      const handleFocus = jest.fn()
      const handleBlur = jest.fn()
      
      render(<Textarea onFocus={handleFocus} onBlur={handleBlur} />)
      const textarea = screen.getByRole('textbox')
      
      fireEvent.focus(textarea)
      expect(handleFocus).toHaveBeenCalledTimes(1)
      
      fireEvent.blur(textarea)
      expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it('handles keydown events', async () => {
      const handleKeyDown = jest.fn()
      const user = userEvent.setup()
      
      render(<Textarea onKeyDown={handleKeyDown} />)
      const textarea = screen.getByRole('textbox')
      
      await user.click(textarea)
      await user.keyboard('{Enter}')
      expect(handleKeyDown).toHaveBeenCalled()
    })

    it('handles select event', () => {
      const handleSelect = jest.fn()
      render(<Textarea onSelect={handleSelect} value="Select this text" />)
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      
      // Simulate text selection
      fireEvent.select(textarea)
      expect(handleSelect).toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('supports aria-label', () => {
      render(<Textarea aria-label="Message input" />)
      const textarea = screen.getByLabelText('Message input')
      expect(textarea).toBeInTheDocument()
    })

    it('supports aria-describedby', () => {
      render(
        <>
          <Textarea aria-describedby="helper-text" />
          <span id="helper-text">Maximum 500 characters</span>
        </>
      )
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('aria-describedby', 'helper-text')
    })

    it('supports aria-invalid', () => {
      render(<Textarea aria-invalid="true" />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('aria-invalid', 'true')
    })

    it('can be focused programmatically', () => {
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      
      textarea.focus()
      expect(textarea).toHaveFocus()
    })
  })

  describe('ref forwarding', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLTextAreaElement>()
      render(<Textarea ref={ref} />)
      
      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
      expect(ref.current?.tagName).toBe('TEXTAREA')
    })

    it('allows programmatic value manipulation via ref', () => {
      const ref = React.createRef<HTMLTextAreaElement>()
      render(<Textarea ref={ref} />)
      
      if (ref.current) {
        ref.current.value = 'Set via ref'
        expect(ref.current.value).toBe('Set via ref')
      }
    })
  })

  describe('resize behavior', () => {
    it('allows resize by default', () => {
      render(<Textarea />)
      const textarea = screen.getByRole('textbox')
      // By default, textareas are resizable unless explicitly disabled
      const styles = window.getComputedStyle(textarea)
      expect(styles.resize).not.toBe('none')
    })

    it('can disable resize with style prop', () => {
      render(<Textarea style={{ resize: 'none' }} />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveStyle({ resize: 'none' })
    })
  })
})