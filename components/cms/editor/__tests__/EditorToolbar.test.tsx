import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditorToolbar } from '../EditorToolbar'
import { Editor } from '@tiptap/react'

// Mock the Editor class
const mockEditor = {
  commands: {
    undo: jest.fn(),
    redo: jest.fn(),
    toggleBold: jest.fn(),
    toggleItalic: jest.fn(),
    toggleStrike: jest.fn(),
    toggleCode: jest.fn(),
    toggleBulletList: jest.fn(),
    toggleOrderedList: jest.fn(),
    toggleBlockquote: jest.fn(),
    insertContent: jest.fn(),
    unsetMark: jest.fn(),
    setHorizontalRule: jest.fn(),
    setParagraph: jest.fn(),
    setHeading: jest.fn(),
  },
  can: jest.fn(() => ({
    undo: jest.fn().mockReturnValue(true),
    redo: jest.fn().mockReturnValue(true),
  })),
  isActive: jest.fn(),
} as unknown as Editor

describe('EditorToolbar', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(mockEditor.isActive as jest.Mock).mockReturnValue(false)
    ;(mockEditor.can as jest.Mock).mockReturnValue({
      undo: jest.fn().mockReturnValue(true),
      redo: jest.fn().mockReturnValue(true),
    })
  })

  it('should render all toolbar sections', () => {
    render(<EditorToolbar editor={mockEditor} />)

    // Check for undo/redo buttons
    expect(screen.getByTitle('Undo')).toBeInTheDocument()
    expect(screen.getByTitle('Redo')).toBeInTheDocument()

    // Check for heading dropdown
    expect(screen.getByRole('button', { name: /P/i })).toBeInTheDocument()

    // Check for text formatting buttons
    expect(screen.getByTitle('Bold')).toBeInTheDocument()
    expect(screen.getByTitle('Italic')).toBeInTheDocument()
    expect(screen.getByTitle('Strikethrough')).toBeInTheDocument()
    expect(screen.getByTitle('Inline Code')).toBeInTheDocument()

    // Check for list buttons
    expect(screen.getByTitle('Bullet List')).toBeInTheDocument()
    expect(screen.getByTitle('Numbered List')).toBeInTheDocument()
    expect(screen.getByTitle('Quote')).toBeInTheDocument()

    // Check for link and other elements
    expect(screen.getByTitle('Add Link')).toBeInTheDocument()
    expect(screen.getByTitle('Remove Link')).toBeInTheDocument()
    expect(screen.getByTitle('Horizontal Line')).toBeInTheDocument()
  })

  it('should handle undo and redo commands', async () => {
    render(<EditorToolbar editor={mockEditor} />)

    const undoButton = screen.getByTitle('Undo')
    const redoButton = screen.getByTitle('Redo')

    await user.click(undoButton)
    expect(mockEditor.commands.undo).toHaveBeenCalled()

    await user.click(redoButton)
    expect(mockEditor.commands.redo).toHaveBeenCalled()
  })

  it('should disable undo/redo buttons when not available', () => {
    ;(mockEditor.can as jest.Mock).mockReturnValue({
      undo: jest.fn().mockReturnValue(false),
      redo: jest.fn().mockReturnValue(false),
    })

    render(<EditorToolbar editor={mockEditor} />)

    expect(screen.getByTitle('Undo')).toBeDisabled()
    expect(screen.getByTitle('Redo')).toBeDisabled()
  })

  it('should display current heading level', () => {
    ;(mockEditor.isActive as jest.Mock).mockImplementation((type, attrs) => {
      if (type === 'heading' && attrs?.level === 2) return true
      return false
    })

    render(<EditorToolbar editor={mockEditor} />)

    expect(screen.getByText('H2')).toBeInTheDocument()
  })

  it('should show P for paragraph when no heading is active', () => {
    render(<EditorToolbar editor={mockEditor} />)

    expect(screen.getByText('P')).toBeInTheDocument()
  })

  it('should handle text formatting commands', async () => {
    render(<EditorToolbar editor={mockEditor} />)

    await user.click(screen.getByTitle('Bold'))
    expect(mockEditor.commands.toggleBold).toHaveBeenCalled()

    await user.click(screen.getByTitle('Italic'))
    expect(mockEditor.commands.toggleItalic).toHaveBeenCalled()

    await user.click(screen.getByTitle('Strikethrough'))
    expect(mockEditor.commands.toggleStrike).toHaveBeenCalled()

    await user.click(screen.getByTitle('Inline Code'))
    expect(mockEditor.commands.toggleCode).toHaveBeenCalled()
  })

  it('should show active state for formatting buttons', () => {
    ;(mockEditor.isActive as jest.Mock).mockImplementation((type) => {
      return type === 'bold' || type === 'italic'
    })

    render(<EditorToolbar editor={mockEditor} />)

    const boldButton = screen.getByTitle('Bold')
    const italicButton = screen.getByTitle('Italic')
    const strikeButton = screen.getByTitle('Strikethrough')

    expect(boldButton).toHaveClass('bg-secondary')
    expect(italicButton).toHaveClass('bg-secondary')
    expect(strikeButton).not.toHaveClass('bg-secondary')
  })

  it('should handle list commands', async () => {
    render(<EditorToolbar editor={mockEditor} />)

    await user.click(screen.getByTitle('Bullet List'))
    expect(mockEditor.commands.toggleBulletList).toHaveBeenCalled()

    await user.click(screen.getByTitle('Numbered List'))
    expect(mockEditor.commands.toggleOrderedList).toHaveBeenCalled()

    await user.click(screen.getByTitle('Quote'))
    expect(mockEditor.commands.toggleBlockquote).toHaveBeenCalled()
  })

  it('should open heading dropdown and set headings', async () => {
    render(<EditorToolbar editor={mockEditor} />)

    const headingDropdown = screen.getByRole('button', { name: /P/i })
    await user.click(headingDropdown)

    // Check dropdown items
    expect(screen.getByText('Paragraph')).toBeInTheDocument()
    expect(screen.getByText('Heading 1')).toBeInTheDocument()
    expect(screen.getByText('Heading 2')).toBeInTheDocument()
    expect(screen.getByText('Heading 3')).toBeInTheDocument()

    // Click on Heading 2
    await user.click(screen.getByText('Heading 2'))
    expect(mockEditor.commands.setHeading).toHaveBeenCalledWith({ level: 2 })
  })

  it('should set paragraph when clicking Paragraph option', async () => {
    render(<EditorToolbar editor={mockEditor} />)

    const headingDropdown = screen.getByRole('button', { name: /P/i })
    await user.click(headingDropdown)

    await user.click(screen.getByText('Paragraph'))
    expect(mockEditor.commands.setParagraph).toHaveBeenCalled()
  })

  it('should highlight active heading level in dropdown', async () => {
    ;(mockEditor.isActive as jest.Mock).mockImplementation((type, attrs) => {
      if (type === 'heading' && attrs?.level === 3) return true
      return false
    })

    render(<EditorToolbar editor={mockEditor} />)

    const headingDropdown = screen.getByRole('button', { name: /H3/i })
    await user.click(headingDropdown)

    const heading3Item = screen.getByText('Heading 3')
    expect(heading3Item).toHaveClass('bg-secondary')
  })

  it('should open link dialog and add link with URL only', async () => {
    render(<EditorToolbar editor={mockEditor} />)

    const addLinkButton = screen.getByTitle('Add Link')
    await user.click(addLinkButton)

    // Check dialog opened
    expect(screen.getByText('Add Link')).toBeInTheDocument()
    expect(screen.getByLabelText('URL')).toBeInTheDocument()
    expect(screen.getByLabelText('Link Text (optional)')).toBeInTheDocument()

    // Enter URL
    const urlInput = screen.getByLabelText('URL')
    await user.type(urlInput, 'https://example.com')

    // Click Add Link
    const addButton = screen.getByRole('button', { name: 'Add Link' })
    await user.click(addButton)

    expect(mockEditor.commands.insertContent).toHaveBeenCalledWith(
      '<a href="https://example.com">https://example.com</a>'
    )
  })

  it('should add link with custom text when provided', async () => {
    render(<EditorToolbar editor={mockEditor} />)

    const addLinkButton = screen.getByTitle('Add Link')
    await user.click(addLinkButton)

    // Enter URL and text
    await user.type(screen.getByLabelText('URL'), 'https://example.com')
    await user.type(screen.getByLabelText('Link Text (optional)'), 'Example Site')

    const addButton = screen.getByRole('button', { name: 'Add Link' })
    await user.click(addButton)

    expect(mockEditor.commands.insertContent).toHaveBeenCalledWith(
      '<a href="https://example.com">Example Site</a>'
    )
  })

  it('should disable Add Link button when URL is empty', async () => {
    render(<EditorToolbar editor={mockEditor} />)

    const addLinkButton = screen.getByTitle('Add Link')
    await user.click(addLinkButton)

    const addButton = screen.getByRole('button', { name: 'Add Link' })
    expect(addButton).toBeDisabled()

    // Type URL and check it's enabled
    await user.type(screen.getByLabelText('URL'), 'https://example.com')
    expect(addButton).not.toBeDisabled()
  })

  it('should close link dialog when cancel is clicked', async () => {
    render(<EditorToolbar editor={mockEditor} />)

    const addLinkButton = screen.getByTitle('Add Link')
    await user.click(addLinkButton)

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    await user.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByText('Add Link')).not.toBeInTheDocument()
    })
  })

  it('should clear form fields after adding link', async () => {
    render(<EditorToolbar editor={mockEditor} />)

    const addLinkButton = screen.getByTitle('Add Link')
    await user.click(addLinkButton)

    // Fill form
    await user.type(screen.getByLabelText('URL'), 'https://example.com')
    await user.type(screen.getByLabelText('Link Text (optional)'), 'Example')

    // Add link
    await user.click(screen.getByRole('button', { name: 'Add Link' }))

    // Open dialog again and check fields are cleared
    await user.click(addLinkButton)
    expect(screen.getByLabelText('URL')).toHaveValue('')
    expect(screen.getByLabelText('Link Text (optional)')).toHaveValue('')
  })

  it('should handle remove link command', async () => {
    render(<EditorToolbar editor={mockEditor} />)

    const removeLinkButton = screen.getByTitle('Remove Link')
    await user.click(removeLinkButton)

    expect(mockEditor.commands.unsetMark).toHaveBeenCalledWith('link')
  })

  it('should disable remove link button when no link is active', () => {
    ;(mockEditor.isActive as jest.Mock).mockImplementation((type) => type !== 'link')

    render(<EditorToolbar editor={mockEditor} />)

    expect(screen.getByTitle('Remove Link')).toBeDisabled()
  })

  it('should enable remove link button when link is active', () => {
    ;(mockEditor.isActive as jest.Mock).mockImplementation((type) => type === 'link')

    render(<EditorToolbar editor={mockEditor} />)

    expect(screen.getByTitle('Remove Link')).not.toBeDisabled()
  })

  it('should handle horizontal rule command', async () => {
    render(<EditorToolbar editor={mockEditor} />)

    const horizontalRuleButton = screen.getByTitle('Horizontal Line')
    await user.click(horizontalRuleButton)

    expect(mockEditor.commands.setHorizontalRule).toHaveBeenCalled()
  })

  it('should render with custom className', () => {
    const { container } = render(<EditorToolbar editor={mockEditor} className="custom-class" />)

    const toolbar = container.firstChild as HTMLElement
    expect(toolbar).toHaveClass('custom-class')
  })

  it('should handle keyboard navigation in toolbar', async () => {
    render(<EditorToolbar editor={mockEditor} />)

    const undoButton = screen.getByTitle('Undo')
    const redoButton = screen.getByTitle('Redo')

    // Test tab navigation
    undoButton.focus()
    expect(document.activeElement).toBe(undoButton)

    await user.keyboard('{Tab}')
    expect(document.activeElement).toBe(redoButton)
  })

  it('should handle Enter key in link dialog', async () => {
    render(<EditorToolbar editor={mockEditor} />)

    await user.click(screen.getByTitle('Add Link'))
    
    const urlInput = screen.getByLabelText('URL')
    await user.type(urlInput, 'https://example.com')
    
    // Press Enter in URL field
    await user.keyboard('{Enter}')

    expect(mockEditor.commands.insertContent).toHaveBeenCalledWith(
      '<a href="https://example.com">https://example.com</a>'
    )
  })

  it('should handle all heading levels correctly', async () => {
    render(<EditorToolbar editor={mockEditor} />)

    const headingDropdown = screen.getByRole('button', { name: /P/i })
    await user.click(headingDropdown)

    // Test all heading levels
    for (let level = 1; level <= 6; level++) {
      const headingItem = screen.getByText(`Heading ${level}`)
      await user.click(headingItem)
      expect(mockEditor.commands.setHeading).toHaveBeenCalledWith({ level })
      
      if (level < 6) {
        await user.click(headingDropdown)
      }
    }
  })

  it('should display correct heading indicators for all levels', () => {
    const levels = [1, 2, 3, 4, 5, 6]
    
    levels.forEach(level => {
      ;(mockEditor.isActive as jest.Mock).mockImplementation((type, attrs) => {
        return type === 'heading' && attrs?.level === level
      })

      const { rerender } = render(<EditorToolbar editor={mockEditor} />)
      expect(screen.getByText(`H${level}`)).toBeInTheDocument()
      rerender(<div />) // Clean up
    })
  })

  it('should handle separators correctly', () => {
    render(<EditorToolbar editor={mockEditor} />)

    // Check that separators are present (they should have specific orientation)
    const separators = screen.getAllByRole('separator')
    expect(separators.length).toBeGreaterThan(0)
  })

  it('should maintain toolbar state during re-renders', () => {
    const { rerender } = render(<EditorToolbar editor={mockEditor} />)

    // Change active state
    ;(mockEditor.isActive as jest.Mock).mockImplementation((type) => type === 'bold')

    rerender(<EditorToolbar editor={mockEditor} />)

    expect(screen.getByTitle('Bold')).toHaveClass('bg-secondary')
  })

  it('should handle edge cases with empty link URL', async () => {
    render(<EditorToolbar editor={mockEditor} />)

    await user.click(screen.getByTitle('Add Link'))
    
    // Don't enter URL, just click Add Link
    const addButton = screen.getByRole('button', { name: 'Add Link' })
    expect(addButton).toBeDisabled()
    
    // Commands should not be called
    expect(mockEditor.commands.insertContent).not.toHaveBeenCalled()
  })

  it('should be accessible with proper ARIA attributes', () => {
    render(<EditorToolbar editor={mockEditor} />)

    // Check that buttons have proper titles (tooltips)
    expect(screen.getByTitle('Undo')).toBeInTheDocument()
    expect(screen.getByTitle('Bold')).toBeInTheDocument()
    expect(screen.getByTitle('Add Link')).toBeInTheDocument()

    // Check that dialog has proper labels
    fireEvent.click(screen.getByTitle('Add Link'))
    expect(screen.getByLabelText('URL')).toBeInTheDocument()
    expect(screen.getByLabelText('Link Text (optional)')).toBeInTheDocument()
  })
})