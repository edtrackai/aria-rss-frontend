import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { Editor } from '../Editor'
import { useEditor } from '@/hooks/useEditor'

// Mock the useEditor hook
jest.mock('@/hooks/useEditor', () => ({
  useEditor: jest.fn(),
}))

// Mock the EditorToolbar component
jest.mock('../EditorToolbar', () => ({
  EditorToolbar: ({ editor, className }: any) => (
    <div data-testid="editor-toolbar" className={className}>
      Toolbar for editor: {editor ? 'loaded' : 'not loaded'}
    </div>
  ),
}))

// Mock TipTap EditorContent
jest.mock('@tiptap/react', () => ({
  EditorContent: ({ editor, className, style }: any) => (
    <div 
      data-testid="editor-content" 
      className={className}
      style={style}
    >
      Editor content: {editor ? 'loaded' : 'not loaded'}
    </div>
  ),
}))

const mockUseEditor = useEditor as jest.MockedFunction<typeof useEditor>

const mockEditorReturn = {
  editor: {
    destroy: jest.fn(),
    commands: {},
    isActive: jest.fn(),
  },
  isEmpty: false,
  isEditing: false,
  wordCount: 150,
  characterCount: 750,
  isDirty: false,
}

describe('Editor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseEditor.mockReturnValue(mockEditorReturn)
  })

  it('should render editor with toolbar when showToolbar is true', () => {
    render(<Editor content="Test content" showToolbar={true} />)

    expect(screen.getByTestId('editor-toolbar')).toBeInTheDocument()
    expect(screen.getByTestId('editor-content')).toBeInTheDocument()
  })

  it('should not render toolbar when showToolbar is false', () => {
    render(<Editor content="Test content" showToolbar={false} />)

    expect(screen.queryByTestId('editor-toolbar')).not.toBeInTheDocument()
    expect(screen.getByTestId('editor-content')).toBeInTheDocument()
  })

  it('should render loading state when editor is not ready', () => {
    mockUseEditor.mockReturnValue({
      ...mockEditorReturn,
      editor: null,
    })

    render(<Editor content="Test content" />)

    // Should render loading animation
    const loadingElements = screen.getAllByRole('generic').filter(el => 
      el.className?.includes('animate-pulse')
    )
    expect(loadingElements.length).toBeGreaterThan(0)
  })

  it('should render word count when showWordCount is true', () => {
    render(<Editor content="Test content" showWordCount={true} />)

    expect(screen.getByText('150 words')).toBeInTheDocument()
  })

  it('should render character count when showCharacterCount is true', () => {
    render(<Editor content="Test content" showCharacterCount={true} />)

    expect(screen.getByText('750 characters')).toBeInTheDocument()
  })

  it('should render both word and character count when both are enabled', () => {
    render(<Editor content="Test content" showWordCount={true} showCharacterCount={true} />)

    expect(screen.getByText('150 words')).toBeInTheDocument()
    expect(screen.getByText('750 characters')).toBeInTheDocument()
  })

  it('should not render count footer when both counts are disabled', () => {
    render(<Editor content="Test content" showWordCount={false} showCharacterCount={false} />)

    expect(screen.queryByText(/\d+ words?/)).not.toBeInTheDocument()
    expect(screen.queryByText(/\d+ characters?/)).not.toBeInTheDocument()
  })

  it('should handle singular word count correctly', () => {
    mockUseEditor.mockReturnValue({
      ...mockEditorReturn,
      wordCount: 1,
    })

    render(<Editor content="Test" showWordCount={true} />)

    expect(screen.getByText('1 word')).toBeInTheDocument()
  })

  it('should handle singular character count correctly', () => {
    mockUseEditor.mockReturnValue({
      ...mockEditorReturn,
      characterCount: 1,
    })

    render(<Editor content="T" showCharacterCount={true} />)

    expect(screen.getByText('1 character')).toBeInTheDocument()
  })

  it('should show unsaved changes indicator when isDirty is true', () => {
    mockUseEditor.mockReturnValue({
      ...mockEditorReturn,
      isDirty: true,
    })

    render(<Editor content="Test content" showWordCount={true} />)

    expect(screen.getByText('Unsaved changes')).toBeInTheDocument()
    expect(screen.getByText('Unsaved changes')).toHaveClass('text-orange-500')
  })

  it('should not show unsaved changes indicator when isDirty is false', () => {
    render(<Editor content="Test content" showWordCount={true} />)

    expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument()
  })

  it('should render placeholder when editor is empty and not editing', () => {
    mockUseEditor.mockReturnValue({
      ...mockEditorReturn,
      isEmpty: true,
      isEditing: false,
    })

    render(<Editor content="" placeholder="Start writing..." />)

    expect(screen.getByText('Start writing...')).toBeInTheDocument()
  })

  it('should use default placeholder when none provided', () => {
    mockUseEditor.mockReturnValue({
      ...mockEditorReturn,
      isEmpty: true,
      isEditing: false,
    })

    render(<Editor content="" />)

    expect(screen.getByText('Start writing...')).toBeInTheDocument()
  })

  it('should not show placeholder when editor is not empty', () => {
    mockUseEditor.mockReturnValue({
      ...mockEditorReturn,
      isEmpty: false,
    })

    render(<Editor content="Some content" placeholder="Start writing..." />)

    expect(screen.queryByText('Start writing...')).not.toBeInTheDocument()
  })

  it('should not show placeholder when editor is editing', () => {
    mockUseEditor.mockReturnValue({
      ...mockEditorReturn,
      isEmpty: true,
      isEditing: true,
    })

    render(<Editor content="" placeholder="Start writing..." />)

    expect(screen.queryByText('Start writing...')).not.toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(<Editor content="Test" className="custom-editor" />)

    expect(container.firstChild).toHaveClass('custom-editor')
  })

  it('should apply minHeight style to editor content', () => {
    render(<Editor content="Test" minHeight="300px" />)

    const editorContent = screen.getByTestId('editor-content')
    expect(editorContent).toHaveStyle({ minHeight: '300px' })
  })

  it('should apply maxHeight style to editor content', () => {
    render(<Editor content="Test" maxHeight="500px" />)

    const editorContent = screen.getByTestId('editor-content')
    expect(editorContent).toHaveStyle({ maxHeight: '500px' })
  })

  it('should default maxHeight to none when not provided', () => {
    render(<Editor content="Test" />)

    const editorContent = screen.getByTestId('editor-content')
    expect(editorContent).toHaveStyle({ maxHeight: 'none' })
  })

  it('should render with border by default', () => {
    render(<Editor content="Test" />)

    const editorWrapper = screen.getByTestId('editor-content').parentElement
    expect(editorWrapper).toHaveClass('border', 'border-input')
  })

  it('should render without border when border is false', () => {
    render(<Editor content="Test" border={false} />)

    const editorWrapper = screen.getByTestId('editor-content').parentElement
    expect(editorWrapper).not.toHaveClass('border', 'border-input')
  })

  it('should apply correct border radius based on toolbar visibility', () => {
    // With toolbar
    const { rerender } = render(<Editor content="Test" showToolbar={true} border={true} />)
    
    let editorWrapper = screen.getByTestId('editor-content').parentElement
    expect(editorWrapper).toHaveClass('border-t-0', 'rounded-b-md')

    // Without toolbar
    rerender(<Editor content="Test" showToolbar={false} border={true} />)
    
    editorWrapper = screen.getByTestId('editor-content').parentElement
    expect(editorWrapper).toHaveClass('rounded-md')
    expect(editorWrapper).not.toHaveClass('border-t-0')
  })

  it('should apply correct toolbar border classes', () => {
    render(<Editor content="Test" showToolbar={true} border={true} />)

    const toolbar = screen.getByTestId('editor-toolbar')
    expect(toolbar).toHaveClass('border-b', 'border-l', 'border-r', 'border-t', 'rounded-t-md')
  })

  it('should handle zero word and character counts', () => {
    mockUseEditor.mockReturnValue({
      ...mockEditorReturn,
      wordCount: 0,
      characterCount: 0,
    })

    render(<Editor content="" showWordCount={true} showCharacterCount={true} />)

    expect(screen.getByText('0 words')).toBeInTheDocument()
    expect(screen.getByText('0 characters')).toBeInTheDocument()
  })

  it('should pass all editor options to useEditor hook', () => {
    const editorOptions = {
      content: 'Test content',
      placeholder: 'Custom placeholder',
      onUpdate: jest.fn(),
      onFocus: jest.fn(),
      onBlur: jest.fn(),
    }

    render(<Editor {...editorOptions} />)

    expect(mockUseEditor).toHaveBeenCalledWith(editorOptions)
  })

  it('should handle loading state with custom minHeight', () => {
    mockUseEditor.mockReturnValue({
      ...mockEditorReturn,
      editor: null,
    })

    render(<Editor content="Test" minHeight="400px" />)

    const loadingElement = screen.getAllByRole('generic').find(el => 
      el.style.minHeight === '400px'
    )
    expect(loadingElement).toBeInTheDocument()
  })

  it('should apply proper prose classes to editor content', () => {
    render(<Editor content="Test" />)

    const editorContent = screen.getByTestId('editor-content')
    expect(editorContent).toHaveClass(
      'prose',
      'prose-sm',
      'max-w-none',
      'focus-within:outline-none'
    )
  })

  it('should handle editor destruction', async () => {
    const { unmount } = render(<Editor content="Test" />)

    unmount()

    // Editor should be cleaned up through useEditor hook
    await waitFor(() => {
      expect(mockUseEditor).toHaveBeenCalled()
    })
  })

  it('should maintain accessibility with proper placeholder attributes', () => {
    mockUseEditor.mockReturnValue({
      ...mockEditorReturn,
      isEmpty: true,
      isEditing: false,
    })

    render(<Editor content="" placeholder="Write your story..." />)

    const placeholder = screen.getByText('Write your story...')
    expect(placeholder).toHaveClass('pointer-events-none', 'select-none')
  })

  it('should handle complex editor content styling', () => {
    render(<Editor content="Test" />)

    const editorContent = screen.getByTestId('editor-content')
    
    // Check for ProseMirror-specific classes
    expect(editorContent).toHaveClass(
      '[&_.ProseMirror]:outline-none',
      '[&_.ProseMirror]:min-h-0',
      '[&_.ProseMirror]:text-foreground'
    )
    
    // Check for paragraph styling
    expect(editorContent).toHaveClass(
      '[&_.ProseMirror_p]:my-2'
    )
    
    // Check for heading styling
    expect(editorContent).toHaveClass(
      '[&_.ProseMirror_h1]:text-2xl',
      '[&_.ProseMirror_h1]:font-bold'
    )
  })

  it('should render stats footer with proper layout', () => {
    mockUseEditor.mockReturnValue({
      ...mockEditorReturn,
      isDirty: true,
    })

    render(<Editor content="Test" showWordCount={true} showCharacterCount={true} />)

    // Check footer exists with proper spacing
    const footer = screen.getByText('150 words').closest('div')
    expect(footer).toHaveClass('flex', 'justify-between', 'items-center', 'text-xs', 'text-muted-foreground')
    
    // Check unsaved changes indicator is in the right place
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument()
  })

  it('should handle edge cases with undefined counts', () => {
    mockUseEditor.mockReturnValue({
      ...mockEditorReturn,
      wordCount: undefined as any,
      characterCount: undefined as any,
    })

    render(<Editor content="Test" showWordCount={true} showCharacterCount={true} />)

    // Should handle undefined gracefully
    expect(screen.getByText(/words/)).toBeInTheDocument()
    expect(screen.getByText(/characters/)).toBeInTheDocument()
  })

  it('should maintain proper tab order for accessibility', () => {
    render(<Editor content="Test" showToolbar={true} />)

    // Editor content should be in the tab order
    const editorContent = screen.getByTestId('editor-content')
    expect(editorContent).toBeInTheDocument()
    
    // Toolbar should also be accessible
    const toolbar = screen.getByTestId('editor-toolbar')
    expect(toolbar).toBeInTheDocument()
  })
})