import { renderHook, act } from '@testing-library/react'
import { useEditor } from '../useEditor'
import { Editor } from '@tiptap/react'

// Mock TipTap
jest.mock('@tiptap/react', () => ({
  useEditor: jest.fn(),
  Editor: jest.fn()
}))

jest.mock('@tiptap/starter-kit', () => ({
  default: jest.fn(() => ({ name: 'StarterKit' }))
}))

jest.mock('@tiptap/extension-link', () => ({
  default: jest.fn(() => ({ 
    name: 'Link',
    configure: jest.fn(() => ({ name: 'Link' }))
  }))
}))

import { useEditor as useTipTapEditor } from '@tiptap/react'

const mockUseTipTapEditor = useTipTapEditor as jest.MockedFunction<typeof useTipTapEditor>

describe('useEditor', () => {
  let mockEditor: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockEditor = {
      commands: {
        setContent: jest.fn(),
        focus: jest.fn(),
        clearContent: jest.fn(),
        undo: jest.fn(),
        redo: jest.fn(),
        toggleBold: jest.fn(),
        toggleItalic: jest.fn(),
        toggleUnderline: jest.fn(),
        toggleStrike: jest.fn(),
        toggleHeading: jest.fn(),
        toggleBulletList: jest.fn(),
        toggleOrderedList: jest.fn(),
        toggleBlockquote: jest.fn(),
        toggleCodeBlock: jest.fn(),
        setLink: jest.fn(),
        unsetLink: jest.fn(),
        insertContent: jest.fn()
      },
      getHTML: jest.fn(() => '<p>Test content</p>'),
      getText: jest.fn(() => 'Test content'),
      getJSON: jest.fn(() => ({ type: 'doc', content: [] })),
      isEmpty: false,
      isActive: jest.fn(),
      can: jest.fn().mockReturnValue({
        undo: jest.fn().mockReturnValue(true),
        redo: jest.fn().mockReturnValue(true)
      }),
      state: {
        selection: {
          from: 0,
          to: 0
        }
      },
      destroy: jest.fn(),
      on: jest.fn(),
      off: jest.fn()
    }

    mockUseTipTapEditor.mockReturnValue(mockEditor)
  })

  describe('initialization', () => {
    it('should initialize with default content', () => {
      renderHook(() => useEditor())

      expect(mockUseTipTapEditor).toHaveBeenCalledWith({
        extensions: expect.any(Array),
        content: '',
        autofocus: true,
        editable: true,
        editorProps: expect.any(Object)
      })
    })

    it('should initialize with provided content', () => {
      const initialContent = '<p>Initial content</p>'
      renderHook(() => useEditor(initialContent))

      expect(mockUseTipTapEditor).toHaveBeenCalledWith(
        expect.objectContaining({
          content: initialContent
        })
      )
    })

    it('should configure extensions properly', () => {
      renderHook(() => useEditor())

      const config = mockUseTipTapEditor.mock.calls[0][0]
      expect(config.extensions).toHaveLength(2) // StarterKit and Link
    })
  })

  describe('content management', () => {
    it('should set content', () => {
      const { result } = renderHook(() => useEditor())

      const newContent = '<p>New content</p>'
      act(() => {
        result.current.setContent(newContent)
      })

      expect(mockEditor.commands.setContent).toHaveBeenCalledWith(newContent)
    })

    it('should get HTML content', () => {
      const { result } = renderHook(() => useEditor())

      const html = result.current.getHTML()

      expect(mockEditor.getHTML).toHaveBeenCalled()
      expect(html).toBe('<p>Test content</p>')
    })

    it('should get text content', () => {
      const { result } = renderHook(() => useEditor())

      const text = result.current.getText()

      expect(mockEditor.getText).toHaveBeenCalled()
      expect(text).toBe('Test content')
    })

    it('should get JSON content', () => {
      const { result } = renderHook(() => useEditor())

      const json = result.current.getJSON()

      expect(mockEditor.getJSON).toHaveBeenCalled()
      expect(json).toEqual({ type: 'doc', content: [] })
    })

    it('should clear content', () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.clearContent()
      })

      expect(mockEditor.commands.clearContent).toHaveBeenCalled()
      expect(mockEditor.commands.focus).toHaveBeenCalled()
    })

    it('should check if empty', () => {
      mockEditor.isEmpty = true
      const { result } = renderHook(() => useEditor())

      expect(result.current.isEmpty).toBe(true)
    })
  })

  describe('formatting commands', () => {
    it('should toggle bold', () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.toggleBold()
      })

      expect(mockEditor.commands.toggleBold).toHaveBeenCalled()
    })

    it('should toggle italic', () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.toggleItalic()
      })

      expect(mockEditor.commands.toggleItalic).toHaveBeenCalled()
    })

    it('should toggle underline', () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.toggleUnderline()
      })

      expect(mockEditor.commands.toggleUnderline).toHaveBeenCalled()
    })

    it('should toggle strike', () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.toggleStrike()
      })

      expect(mockEditor.commands.toggleStrike).toHaveBeenCalled()
    })

    it('should toggle heading with level', () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.toggleHeading(2)
      })

      expect(mockEditor.commands.toggleHeading).toHaveBeenCalledWith({ level: 2 })
    })

    it('should toggle bullet list', () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.toggleBulletList()
      })

      expect(mockEditor.commands.toggleBulletList).toHaveBeenCalled()
    })

    it('should toggle ordered list', () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.toggleOrderedList()
      })

      expect(mockEditor.commands.toggleOrderedList).toHaveBeenCalled()
    })

    it('should toggle blockquote', () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.toggleBlockquote()
      })

      expect(mockEditor.commands.toggleBlockquote).toHaveBeenCalled()
    })

    it('should toggle code block', () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.toggleCodeBlock()
      })

      expect(mockEditor.commands.toggleCodeBlock).toHaveBeenCalled()
    })
  })

  describe('link management', () => {
    it('should set link with URL', () => {
      const { result } = renderHook(() => useEditor())

      const url = 'https://example.com'
      act(() => {
        result.current.setLink(url)
      })

      expect(mockEditor.commands.setLink).toHaveBeenCalledWith({ href: url })
    })

    it('should validate URL before setting link', () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.setLink('invalid-url')
      })

      expect(mockEditor.commands.setLink).not.toHaveBeenCalled()
    })

    it('should add protocol to URL if missing', () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.setLink('example.com')
      })

      expect(mockEditor.commands.setLink).toHaveBeenCalledWith({ href: 'https://example.com' })
    })

    it('should unset link', () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.unsetLink()
      })

      expect(mockEditor.commands.unsetLink).toHaveBeenCalled()
    })
  })

  describe('history commands', () => {
    it('should undo', () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.undo()
      })

      expect(mockEditor.commands.undo).toHaveBeenCalled()
    })

    it('should redo', () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.redo()
      })

      expect(mockEditor.commands.redo).toHaveBeenCalled()
    })

    it('should check if can undo', () => {
      const { result } = renderHook(() => useEditor())

      const canUndo = result.current.canUndo()

      expect(mockEditor.can).toHaveBeenCalled()
      expect(canUndo).toBe(true)
    })

    it('should check if can redo', () => {
      const { result } = renderHook(() => useEditor())

      const canRedo = result.current.canRedo()

      expect(mockEditor.can).toHaveBeenCalled()
      expect(canRedo).toBe(true)
    })
  })

  describe('state checks', () => {
    it('should check if format is active', () => {
      mockEditor.isActive.mockReturnValue(true)
      const { result } = renderHook(() => useEditor())

      const isBold = result.current.isActive('bold')

      expect(mockEditor.isActive).toHaveBeenCalledWith('bold')
      expect(isBold).toBe(true)
    })

    it('should check multiple formats', () => {
      const { result } = renderHook(() => useEditor())

      const formats = ['bold', 'italic', 'link']
      formats.forEach(format => {
        result.current.isActive(format)
      })

      expect(mockEditor.isActive).toHaveBeenCalledTimes(formats.length)
    })
  })

  describe('custom content insertion', () => {
    it('should insert image', () => {
      const { result } = renderHook(() => useEditor())

      const imageUrl = 'https://example.com/image.jpg'
      act(() => {
        result.current.insertImage(imageUrl)
      })

      expect(mockEditor.commands.insertContent).toHaveBeenCalledWith({
        type: 'image',
        attrs: { src: imageUrl }
      })
    })

    it('should insert video embed', () => {
      const { result } = renderHook(() => useEditor())

      const videoUrl = 'https://youtube.com/watch?v=123'
      act(() => {
        result.current.insertVideo(videoUrl)
      })

      expect(mockEditor.commands.insertContent).toHaveBeenCalledWith({
        type: 'video',
        attrs: { src: videoUrl }
      })
    })

    it('should insert horizontal rule', () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.insertHorizontalRule()
      })

      expect(mockEditor.commands.insertContent).toHaveBeenCalledWith({ type: 'horizontalRule' })
    })
  })

  describe('focus management', () => {
    it('should focus editor', () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.focus()
      })

      expect(mockEditor.commands.focus).toHaveBeenCalled()
    })

    it('should focus at specific position', () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.focus('end')
      })

      expect(mockEditor.commands.focus).toHaveBeenCalledWith('end')
    })
  })

  describe('word count', () => {
    it('should calculate word count', () => {
      mockEditor.getText.mockReturnValue('This is a test content with six words')
      const { result } = renderHook(() => useEditor())

      const wordCount = result.current.getWordCount()

      expect(wordCount).toBe(8)
    })

    it('should handle empty content', () => {
      mockEditor.getText.mockReturnValue('')
      const { result } = renderHook(() => useEditor())

      const wordCount = result.current.getWordCount()

      expect(wordCount).toBe(0)
    })

    it('should handle whitespace-only content', () => {
      mockEditor.getText.mockReturnValue('   \n\t   ')
      const { result } = renderHook(() => useEditor())

      const wordCount = result.current.getWordCount()

      expect(wordCount).toBe(0)
    })
  })

  describe('character count', () => {
    it('should calculate character count', () => {
      mockEditor.getText.mockReturnValue('Test content')
      const { result } = renderHook(() => useEditor())

      const charCount = result.current.getCharacterCount()

      expect(charCount).toBe(12)
    })

    it('should calculate character count without spaces', () => {
      mockEditor.getText.mockReturnValue('Test content here')
      const { result } = renderHook(() => useEditor())

      const charCount = result.current.getCharacterCount(false)

      expect(charCount).toBe(15) // "Testcontenthere"
    })
  })

  describe('edge cases', () => {
    it('should handle null editor gracefully', () => {
      mockUseTipTapEditor.mockReturnValue(null)
      const { result } = renderHook(() => useEditor())

      // All methods should not throw errors
      expect(() => {
        result.current.setContent('test')
        result.current.toggleBold()
        result.current.getHTML()
      }).not.toThrow()

      expect(result.current.getHTML()).toBe('')
      expect(result.current.getText()).toBe('')
      expect(result.current.isEmpty).toBe(true)
    })

    it('should cleanup on unmount', () => {
      const { unmount } = renderHook(() => useEditor())

      unmount()

      expect(mockEditor.destroy).toHaveBeenCalled()
    })

    it('should handle editor update events', () => {
      const onUpdate = jest.fn()
      renderHook(() => useEditor('', { onUpdate }))

      const config = mockUseTipTapEditor.mock.calls[0][0]
      config.onUpdate?.({ editor: mockEditor })

      expect(onUpdate).toHaveBeenCalledWith('<p>Test content</p>')
    })

    it('should handle selection changes', () => {
      const onSelectionUpdate = jest.fn()
      renderHook(() => useEditor('', { onSelectionUpdate }))

      const config = mockUseTipTapEditor.mock.calls[0][0]
      config.onSelectionUpdate?.({ editor: mockEditor })

      expect(onSelectionUpdate).toHaveBeenCalledWith({
        from: 0,
        to: 0
      })
    })
  })
})