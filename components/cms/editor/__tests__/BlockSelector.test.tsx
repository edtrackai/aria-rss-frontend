import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BlockSelector } from '../BlockSelector'
import { Editor } from '@tiptap/react'

// Mock the Editor class
const mockEditor = {
  commands: {
    setParagraph: jest.fn(),
    setHeading: jest.fn(),
    toggleBulletList: jest.fn(),
    toggleOrderedList: jest.fn(),
    toggleBlockquote: jest.fn(),
    setHorizontalRule: jest.fn(),
    toggleCodeBlock: jest.fn(),
    insertContent: jest.fn(),
  },
} as unknown as Editor

describe('BlockSelector', () => {
  const user = userEvent.setup()
  const mockOnBlockInsert = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('dropdown variant', () => {
    it('should render dropdown trigger button', () => {
      render(<BlockSelector editor={mockEditor} variant="dropdown" />)

      expect(screen.getByRole('button', { name: /add block/i })).toBeInTheDocument()
    })

    it('should open dropdown menu and show all block categories', async () => {
      render(<BlockSelector editor={mockEditor} variant="dropdown" />)

      const triggerButton = screen.getByRole('button', { name: /add block/i })
      await user.click(triggerButton)

      // Check category headers
      expect(screen.getByText('Text')).toBeInTheDocument()
      expect(screen.getByText('Structure')).toBeInTheDocument()
      expect(screen.getByText('Code')).toBeInTheDocument()
      expect(screen.getByText('Media')).toBeInTheDocument()
    })

    it('should show all text block options', async () => {
      render(<BlockSelector editor={mockEditor} variant="dropdown" />)

      await user.click(screen.getByRole('button', { name: /add block/i }))

      expect(screen.getByText('Paragraph')).toBeInTheDocument()
      expect(screen.getByText('Regular text paragraph')).toBeInTheDocument()
      expect(screen.getByText('Heading 1')).toBeInTheDocument()
      expect(screen.getByText('Large section heading')).toBeInTheDocument()
      expect(screen.getByText('Heading 2')).toBeInTheDocument()
      expect(screen.getByText('Heading 3')).toBeInTheDocument()
    })

    it('should show all structure block options', async () => {
      render(<BlockSelector editor={mockEditor} variant="dropdown" />)

      await user.click(screen.getByRole('button', { name: /add block/i }))

      expect(screen.getByText('Bullet List')).toBeInTheDocument()
      expect(screen.getByText('Numbered List')).toBeInTheDocument()
      expect(screen.getByText('Quote')).toBeInTheDocument()
      expect(screen.getByText('Divider')).toBeInTheDocument()
      expect(screen.getByText('Table')).toBeInTheDocument()
    })

    it('should show code and media block options', async () => {
      render(<BlockSelector editor={mockEditor} variant="dropdown" />)

      await user.click(screen.getByRole('button', { name: /add block/i }))

      expect(screen.getByText('Code Block')).toBeInTheDocument()
      expect(screen.getByText('Image')).toBeInTheDocument()
      expect(screen.getByText('Video')).toBeInTheDocument()
    })

    it('should execute paragraph command when paragraph is selected', async () => {
      render(<BlockSelector editor={mockEditor} variant="dropdown" onBlockInsert={mockOnBlockInsert} />)

      await user.click(screen.getByRole('button', { name: /add block/i }))
      await user.click(screen.getByText('Paragraph'))

      expect(mockEditor.commands.setParagraph).toHaveBeenCalled()
      expect(mockOnBlockInsert).toHaveBeenCalledWith('paragraph')
    })

    it('should execute heading commands with correct levels', async () => {
      render(<BlockSelector editor={mockEditor} variant="dropdown" onBlockInsert={mockOnBlockInsert} />)

      await user.click(screen.getByRole('button', { name: /add block/i }))
      
      await user.click(screen.getByText('Heading 1'))
      expect(mockEditor.commands.setHeading).toHaveBeenCalledWith({ level: 1 })
      expect(mockOnBlockInsert).toHaveBeenCalledWith('heading1')

      await user.click(screen.getByRole('button', { name: /add block/i }))
      await user.click(screen.getByText('Heading 2'))
      expect(mockEditor.commands.setHeading).toHaveBeenCalledWith({ level: 2 })

      await user.click(screen.getByRole('button', { name: /add block/i }))
      await user.click(screen.getByText('Heading 3'))
      expect(mockEditor.commands.setHeading).toHaveBeenCalledWith({ level: 3 })
    })

    it('should execute list commands', async () => {
      render(<BlockSelector editor={mockEditor} variant="dropdown" onBlockInsert={mockOnBlockInsert} />)

      await user.click(screen.getByRole('button', { name: /add block/i }))
      await user.click(screen.getByText('Bullet List'))
      expect(mockEditor.commands.toggleBulletList).toHaveBeenCalled()
      expect(mockOnBlockInsert).toHaveBeenCalledWith('bulletList')

      await user.click(screen.getByRole('button', { name: /add block/i }))
      await user.click(screen.getByText('Numbered List'))
      expect(mockEditor.commands.toggleOrderedList).toHaveBeenCalled()
      expect(mockOnBlockInsert).toHaveBeenCalledWith('orderedList')
    })

    it('should execute blockquote and divider commands', async () => {
      render(<BlockSelector editor={mockEditor} variant="dropdown" onBlockInsert={mockOnBlockInsert} />)

      await user.click(screen.getByRole('button', { name: /add block/i }))
      await user.click(screen.getByText('Quote'))
      expect(mockEditor.commands.toggleBlockquote).toHaveBeenCalled()
      expect(mockOnBlockInsert).toHaveBeenCalledWith('blockquote')

      await user.click(screen.getByRole('button', { name: /add block/i }))
      await user.click(screen.getByText('Divider'))
      expect(mockEditor.commands.setHorizontalRule).toHaveBeenCalled()
      expect(mockOnBlockInsert).toHaveBeenCalledWith('horizontalRule')
    })

    it('should execute code block command', async () => {
      render(<BlockSelector editor={mockEditor} variant="dropdown" onBlockInsert={mockOnBlockInsert} />)

      await user.click(screen.getByRole('button', { name: /add block/i }))
      await user.click(screen.getByText('Code Block'))

      expect(mockEditor.commands.toggleCodeBlock).toHaveBeenCalled()
      expect(mockOnBlockInsert).toHaveBeenCalledWith('codeBlock')
    })

    it('should insert table when table is selected', async () => {
      render(<BlockSelector editor={mockEditor} variant="dropdown" onBlockInsert={mockOnBlockInsert} />)

      await user.click(screen.getByRole('button', { name: /add block/i }))
      await user.click(screen.getByText('Table'))

      expect(mockEditor.commands.insertContent).toHaveBeenCalledWith(
        expect.stringContaining('<table>')
      )
      expect(mockOnBlockInsert).toHaveBeenCalledWith('table')
    })

    it('should open image dialog when image is selected', async () => {
      render(<BlockSelector editor={mockEditor} variant="dropdown" />)

      await user.click(screen.getByRole('button', { name: /add block/i }))
      await user.click(screen.getByText('Image'))

      expect(screen.getByText('Insert Image')).toBeInTheDocument()
      expect(screen.getByLabelText('Image URL')).toBeInTheDocument()
      expect(screen.getByLabelText('Alt Text')).toBeInTheDocument()
    })

    it('should insert image with URL and alt text', async () => {
      render(<BlockSelector editor={mockEditor} variant="dropdown" onBlockInsert={mockOnBlockInsert} />)

      // Open image dialog
      await user.click(screen.getByRole('button', { name: /add block/i }))
      await user.click(screen.getByText('Image'))

      // Fill form
      await user.type(screen.getByLabelText('Image URL'), 'https://example.com/image.jpg')
      await user.type(screen.getByLabelText('Alt Text'), 'Test image')

      // Insert image
      await user.click(screen.getByRole('button', { name: 'Insert Image' }))

      expect(mockEditor.commands.insertContent).toHaveBeenCalledWith(
        '<img src="https://example.com/image.jpg" alt="Test image" />'
      )
      expect(mockOnBlockInsert).toHaveBeenCalledWith('image')
    })

    it('should insert image with URL only when alt text is empty', async () => {
      render(<BlockSelector editor={mockEditor} variant="dropdown" />)

      await user.click(screen.getByRole('button', { name: /add block/i }))
      await user.click(screen.getByText('Image'))

      await user.type(screen.getByLabelText('Image URL'), 'https://example.com/image.jpg')
      await user.click(screen.getByRole('button', { name: 'Insert Image' }))

      expect(mockEditor.commands.insertContent).toHaveBeenCalledWith(
        '<img src="https://example.com/image.jpg" alt="" />'
      )
    })

    it('should disable insert image button when URL is empty', async () => {
      render(<BlockSelector editor={mockEditor} variant="dropdown" />)

      await user.click(screen.getByRole('button', { name: /add block/i }))
      await user.click(screen.getByText('Image'))

      const insertButton = screen.getByRole('button', { name: 'Insert Image' })
      expect(insertButton).toBeDisabled()

      await user.type(screen.getByLabelText('Image URL'), 'https://example.com/image.jpg')
      expect(insertButton).not.toBeDisabled()
    })

    it('should close image dialog when cancel is clicked', async () => {
      render(<BlockSelector editor={mockEditor} variant="dropdown" />)

      await user.click(screen.getByRole('button', { name: /add block/i }))
      await user.click(screen.getByText('Image'))

      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      await waitFor(() => {
        expect(screen.queryByText('Insert Image')).not.toBeInTheDocument()
      })
    })

    it('should open video dialog when video is selected', async () => {
      render(<BlockSelector editor={mockEditor} variant="dropdown" />)

      await user.click(screen.getByRole('button', { name: /add block/i }))
      await user.click(screen.getByText('Video'))

      expect(screen.getByText('Insert Video')).toBeInTheDocument()
      expect(screen.getByLabelText('Video URL')).toBeInTheDocument()
      expect(screen.getByLabelText('Caption (optional)')).toBeInTheDocument()
    })

    it('should insert video with URL and caption', async () => {
      render(<BlockSelector editor={mockEditor} variant="dropdown" onBlockInsert={mockOnBlockInsert} />)

      await user.click(screen.getByRole('button', { name: /add block/i }))
      await user.click(screen.getByText('Video'))

      await user.type(screen.getByLabelText('Video URL'), 'https://youtube.com/watch?v=123')
      await user.type(screen.getByLabelText('Caption (optional)'), 'Test Video')

      await user.click(screen.getByRole('button', { name: 'Insert Video' }))

      expect(mockEditor.commands.insertContent).toHaveBeenCalledWith(
        '<p><a href="https://youtube.com/watch?v=123">Test Video</a></p>'
      )
      expect(mockOnBlockInsert).toHaveBeenCalledWith('video')
    })

    it('should insert video with URL only when caption is empty', async () => {
      render(<BlockSelector editor={mockEditor} variant="dropdown" />)

      await user.click(screen.getByRole('button', { name: /add block/i }))
      await user.click(screen.getByText('Video'))

      await user.type(screen.getByLabelText('Video URL'), 'https://youtube.com/watch?v=123')
      await user.click(screen.getByRole('button', { name: 'Insert Video' }))

      expect(mockEditor.commands.insertContent).toHaveBeenCalledWith(
        '<p><a href="https://youtube.com/watch?v=123">Video: https://youtube.com/watch?v=123</a></p>'
      )
    })

    it('should clear form fields after inserting image', async () => {
      render(<BlockSelector editor={mockEditor} variant="dropdown" />)

      // Open dialog and fill form
      await user.click(screen.getByRole('button', { name: /add block/i }))
      await user.click(screen.getByText('Image'))
      
      await user.type(screen.getByLabelText('Image URL'), 'https://example.com/image.jpg')
      await user.type(screen.getByLabelText('Alt Text'), 'Test')

      // Insert image
      await user.click(screen.getByRole('button', { name: 'Insert Image' }))

      // Open dialog again and check fields are cleared
      await user.click(screen.getByRole('button', { name: /add block/i }))
      await user.click(screen.getByText('Image'))
      
      expect(screen.getByLabelText('Image URL')).toHaveValue('')
      expect(screen.getByLabelText('Alt Text')).toHaveValue('')
    })

    it('should clear form fields after inserting video', async () => {
      render(<BlockSelector editor={mockEditor} variant="dropdown" />)

      // Open dialog and fill form
      await user.click(screen.getByRole('button', { name: /add block/i }))
      await user.click(screen.getByText('Video'))
      
      await user.type(screen.getByLabelText('Video URL'), 'https://youtube.com/watch?v=123')
      await user.type(screen.getByLabelText('Caption (optional)'), 'Test')

      // Insert video
      await user.click(screen.getByRole('button', { name: 'Insert Video' }))

      // Open dialog again and check fields are cleared
      await user.click(screen.getByRole('button', { name: /add block/i }))
      await user.click(screen.getByText('Video'))
      
      expect(screen.getByLabelText('Video URL')).toHaveValue('')
      expect(screen.getByLabelText('Caption (optional)')).toHaveValue('')
    })
  })

  describe('sidebar/floating variants', () => {
    it('should render sidebar variant with grid layout', () => {
      render(<BlockSelector editor={mockEditor} variant="sidebar" />)

      expect(screen.getByText('Blocks')).toBeInTheDocument()
      
      // Should render first 8 blocks in grid
      expect(screen.getByRole('button', { name: /paragraph/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /heading 1/i })).toBeInTheDocument()
    })

    it('should render floating variant with grid layout', () => {
      render(<BlockSelector editor={mockEditor} variant="floating" />)

      expect(screen.getByText('Blocks')).toBeInTheDocument()
      
      // Should render blocks as buttons
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should execute commands in sidebar variant', async () => {
      render(<BlockSelector editor={mockEditor} variant="sidebar" onBlockInsert={mockOnBlockInsert} />)

      const paragraphButton = screen.getByRole('button', { name: /paragraph/i })
      await user.click(paragraphButton)

      expect(mockEditor.commands.setParagraph).toHaveBeenCalled()
      expect(mockOnBlockInsert).toHaveBeenCalledWith('paragraph')
    })
  })

  describe('general functionality', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <BlockSelector editor={mockEditor} className="custom-class" />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('should work without onBlockInsert callback', async () => {
      render(<BlockSelector editor={mockEditor} variant="dropdown" />)

      await user.click(screen.getByRole('button', { name: /add block/i }))
      
      // Should not throw error when callback is not provided
      expect(() => {
        fireEvent.click(screen.getByText('Paragraph'))
      }).not.toThrow()

      expect(mockEditor.commands.setParagraph).toHaveBeenCalled()
    })

    it('should handle keyboard navigation in dropdown', async () => {
      render(<BlockSelector editor={mockEditor} variant="dropdown" />)

      const triggerButton = screen.getByRole('button', { name: /add block/i })
      
      // Focus and open with Enter
      triggerButton.focus()
      await user.keyboard('{Enter}')

      expect(screen.getByText('Paragraph')).toBeInTheDocument()

      // Navigate with arrow keys and select with Enter
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{Enter}')

      expect(mockEditor.commands.setParagraph).toHaveBeenCalled()
    })

    it('should handle Enter key in image dialog form', async () => {
      render(<BlockSelector editor={mockEditor} variant="dropdown" />)

      await user.click(screen.getByRole('button', { name: /add block/i }))
      await user.click(screen.getByText('Image'))

      const urlInput = screen.getByLabelText('Image URL')
      await user.type(urlInput, 'https://example.com/image.jpg')
      
      // Press Enter in form field
      await user.keyboard('{Enter}')

      expect(mockEditor.commands.insertContent).toHaveBeenCalledWith(
        '<img src="https://example.com/image.jpg" alt="" />'
      )
    })

    it('should handle Enter key in video dialog form', async () => {
      render(<BlockSelector editor={mockEditor} variant="dropdown" />)

      await user.click(screen.getByRole('button', { name: /add block/i }))
      await user.click(screen.getByText('Video'))

      const urlInput = screen.getByLabelText('Video URL')
      await user.type(urlInput, 'https://youtube.com/watch?v=123')
      
      await user.keyboard('{Enter}')

      expect(mockEditor.commands.insertContent).toHaveBeenCalledWith(
        '<p><a href="https://youtube.com/watch?v=123">Video: https://youtube.com/watch?v=123</a></p>'
      )
    })

    it('should be accessible with proper ARIA attributes', async () => {
      render(<BlockSelector editor={mockEditor} variant="dropdown" />)

      // Check main trigger button
      const triggerButton = screen.getByRole('button', { name: /add block/i })
      expect(triggerButton).toBeInTheDocument()

      await user.click(triggerButton)

      // Check that menu items are accessible
      const menuItems = screen.getAllByRole('menuitem')
      expect(menuItems.length).toBeGreaterThan(0)

      // Check dialog accessibility
      await user.click(screen.getByText('Image'))
      
      expect(screen.getByLabelText('Image URL')).toBeInTheDocument()
      expect(screen.getByLabelText('Alt Text')).toBeInTheDocument()
    })

    it('should generate correct table HTML structure', async () => {
      render(<BlockSelector editor={mockEditor} variant="dropdown" />)

      await user.click(screen.getByRole('button', { name: /add block/i }))
      await user.click(screen.getByText('Table'))

      const expectedTableHTML = expect.stringMatching(
        /<table>.*<tr>.*<th>Header 1<\/th>.*<\/tr>.*<tr>.*<td>Cell 1<\/td>.*<\/tr>.*<\/table>/s
      )
      
      expect(mockEditor.commands.insertContent).toHaveBeenCalledWith(expectedTableHTML)
    })
  })
})