"use client"

import { useEditor as useTiptapEditor, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useState, useCallback, useEffect } from 'react'

export interface EditorState {
  content: string
  wordCount: number
  characterCount: number
  isEditing: boolean
  isDirty: boolean
  canUndo: boolean
  canRedo: boolean
}

export interface EditorOptions {
  initialContent?: string
  placeholder?: string
  editable?: boolean
  autofocus?: boolean
  onChange?: (content: string) => void
  onSelectionUpdate?: (editor: Editor) => void
}

export function useEditor(options: EditorOptions = {}) {
  const {
    initialContent = '',
    placeholder = 'Start writing...',
    editable = true,
    autofocus = false,
    onChange,
    onSelectionUpdate,
  } = options

  const [state, setState] = useState<EditorState>({
    content: initialContent,
    wordCount: 0,
    characterCount: 0,
    isEditing: false,
    isDirty: false,
    canUndo: false,
    canRedo: false,
  })

  const editor = useTiptapEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
    ],
    content: initialContent,
    editable,
    autofocus,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML()
      const wordCount = editor.storage.characterCount?.words() || 0
      const characterCount = editor.storage.characterCount?.characters() || 0

      setState(prev => ({
        ...prev,
        content,
        wordCount,
        characterCount,
        isDirty: content !== initialContent,
        canUndo: editor.can().undo(),
        canRedo: editor.can().redo(),
      }))

      onChange?.(content)
    },
    onSelectionUpdate: ({ editor }) => {
      onSelectionUpdate?.(editor)
    },
    onFocus: () => {
      setState(prev => ({ ...prev, isEditing: true }))
    },
    onBlur: () => {
      setState(prev => ({ ...prev, isEditing: false }))
    },
  })

  const insertContent = useCallback((content: string) => {
    editor?.commands.insertContent(content)
  }, [editor])

  const setContent = useCallback((content: string) => {
    editor?.commands.setContent(content)
    setState(prev => ({ ...prev, content, isDirty: false }))
  }, [editor])

  const clearContent = useCallback(() => {
    editor?.commands.clearContent()
  }, [editor])

  const undo = useCallback(() => {
    editor?.commands.undo()
  }, [editor])

  const redo = useCallback(() => {
    editor?.commands.redo()
  }, [editor])

  const focus = useCallback(() => {
    editor?.commands.focus()
  }, [editor])

  const blur = useCallback(() => {
    editor?.commands.blur()
  }, [editor])

  const selectAll = useCallback(() => {
    editor?.commands.selectAll()
  }, [editor])

  const getSelectedText = useCallback(() => {
    if (!editor) return ''
    const { from, to } = editor.state.selection
    return editor.state.doc.textBetween(from, to)
  }, [editor])

  const insertHeading = useCallback((level: 1 | 2 | 3 | 4 | 5 | 6) => {
    editor?.commands.setHeading({ level })
  }, [editor])

  const toggleBold = useCallback(() => {
    editor?.commands.toggleBold()
  }, [editor])

  const toggleItalic = useCallback(() => {
    editor?.commands.toggleItalic()
  }, [editor])

  const toggleStrike = useCallback(() => {
    editor?.commands.toggleStrike()
  }, [editor])

  const toggleCode = useCallback(() => {
    editor?.commands.toggleCode()
  }, [editor])

  const toggleBulletList = useCallback(() => {
    editor?.commands.toggleBulletList()
  }, [editor])

  const toggleOrderedList = useCallback(() => {
    editor?.commands.toggleOrderedList()
  }, [editor])

  const toggleBlockquote = useCallback(() => {
    editor?.commands.toggleBlockquote()
  }, [editor])

  const toggleCodeBlock = useCallback(() => {
    editor?.commands.toggleCodeBlock()
  }, [editor])

  const insertHorizontalRule = useCallback(() => {
    editor?.commands.setHorizontalRule()
  }, [editor])

  const setLink = useCallback((url: string, text?: string) => {
    if (text) {
      editor?.commands.insertContent(`<a href="${url}">${text}</a>`)
    } else {
      // Fallback for basic link insertion
      editor?.commands.insertContent(`<a href="${url}">${url}</a>`)
    }
  }, [editor])

  const unsetLink = useCallback(() => {
    editor?.commands.unsetMark('link')
  }, [editor])

  // Aliases for compatibility
  const addLink = setLink
  const removeLink = unsetLink

  const getJSON = useCallback(() => {
    return editor?.getJSON()
  }, [editor])

  const getHTML = useCallback(() => {
    return editor?.getHTML()
  }, [editor])

  const getText = useCallback(() => {
    return editor?.getText()
  }, [editor])

  const isEmpty = useCallback(() => {
    return editor?.isEmpty
  }, [editor])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      editor?.destroy()
    }
  }, [editor])

  return {
    editor,
    ...state,
    // Content methods
    insertContent,
    setContent,
    clearContent,
    getJSON,
    getHTML,
    getText,
    isEmpty: isEmpty(),
    
    // Navigation methods
    undo,
    redo,
    focus,
    blur,
    selectAll,
    getSelectedText,

    // Formatting methods
    insertHeading,
    toggleBold,
    toggleItalic,
    toggleStrike,
    toggleCode,
    toggleBulletList,
    toggleOrderedList,
    toggleBlockquote,
    toggleCodeBlock,
    insertHorizontalRule,
    setLink,
    unsetLink,
    addLink,
    removeLink,

    // State checks
    isActive: {
      bold: editor?.isActive('bold') || false,
      italic: editor?.isActive('italic') || false,
      strike: editor?.isActive('strike') || false,
      code: editor?.isActive('code') || false,
      heading: (level: number) => editor?.isActive('heading', { level }) || false,
      bulletList: editor?.isActive('bulletList') || false,
      orderedList: editor?.isActive('orderedList') || false,
      blockquote: editor?.isActive('blockquote') || false,
      codeBlock: editor?.isActive('codeBlock') || false,
      link: editor?.isActive('link') || false,
    },
  }
}

/**
 * Hook for collaborative editing features
 */
export function useCollaborativeEditor(
  documentId: string,
  options: EditorOptions = {}
) {
  const editor = useEditor(options)
  const [collaborators, setCollaborators] = useState<Array<{
    id: string
    name: string
    color: string
    cursor?: { from: number; to: number }
  }>>([])

  // In a real implementation, this would connect to a WebSocket
  // and handle collaborative editing events
  
  return {
    ...editor,
    collaborators,
    documentId,
  }
}

export default useEditor