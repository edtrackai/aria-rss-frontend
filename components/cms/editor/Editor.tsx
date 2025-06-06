"use client"

import React from 'react'
import { EditorContent } from '@tiptap/react'
import { useEditor, type EditorOptions } from '@/hooks/useEditor'
import { EditorToolbar } from './EditorToolbar'
import { cn } from '@/lib/utils'

export interface EditorProps extends EditorOptions {
  className?: string
  showToolbar?: boolean
  showWordCount?: boolean
  showCharacterCount?: boolean
  minHeight?: string
  maxHeight?: string
  border?: boolean
}

export function Editor({
  className,
  showToolbar = true,
  showWordCount = true,
  showCharacterCount = false,
  minHeight = '200px',
  maxHeight,
  border = true,
  ...editorOptions
}: EditorProps) {
  const editor = useEditor(editorOptions)

  if (!editor.editor) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-10 bg-muted rounded-t-md" />
        <div 
          className="bg-muted/50 rounded-b-md"
          style={{ minHeight }}
        />
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {showToolbar && (
        <EditorToolbar 
          editor={editor.editor}
          className={cn(
            'border-b',
            border && 'border-l border-r border-t rounded-t-md'
          )}
        />
      )}
      
      <div 
        className={cn(
          'relative overflow-hidden',
          border && 'border border-input',
          showToolbar && border ? 'border-t-0 rounded-b-md' : 'rounded-md'
        )}
      >
        <EditorContent
          editor={editor.editor}
          className={cn(
            'prose prose-sm max-w-none focus-within:outline-none',
            'p-3 overflow-y-auto',
            '[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-0',
            '[&_.ProseMirror]:text-foreground',
            '[&_.ProseMirror_p]:my-2 first:[&_.ProseMirror_p]:mt-0 last:[&_.ProseMirror_p]:mb-0',
            '[&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mt-6 [&_.ProseMirror_h1]:mb-3',
            '[&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:mt-5 [&_.ProseMirror_h2]:mb-3',
            '[&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:mt-4 [&_.ProseMirror_h3]:mb-2',
            '[&_.ProseMirror_h4]:text-base [&_.ProseMirror_h4]:font-semibold [&_.ProseMirror_h4]:mt-3 [&_.ProseMirror_h4]:mb-2',
            '[&_.ProseMirror_h5]:text-sm [&_.ProseMirror_h5]:font-semibold [&_.ProseMirror_h5]:mt-3 [&_.ProseMirror_h5]:mb-2',
            '[&_.ProseMirror_h6]:text-sm [&_.ProseMirror_h6]:font-medium [&_.ProseMirror_h6]:mt-3 [&_.ProseMirror_h6]:mb-2',
            '[&_.ProseMirror_ul]:my-3 [&_.ProseMirror_ol]:my-3',
            '[&_.ProseMirror_li]:my-1',
            '[&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-muted-foreground [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:my-4',
            '[&_.ProseMirror_pre]:bg-muted [&_.ProseMirror_pre]:rounded [&_.ProseMirror_pre]:p-3 [&_.ProseMirror_pre]:my-3 [&_.ProseMirror_pre]:overflow-x-auto',
            '[&_.ProseMirror_code]:bg-muted [&_.ProseMirror_code]:px-1 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:text-sm',
            '[&_.ProseMirror_hr]:border-t [&_.ProseMirror_hr]:border-border [&_.ProseMirror_hr]:my-6',
            '[&_.ProseMirror_a]:text-primary [&_.ProseMirror_a]:underline [&_.ProseMirror_a]:hover:text-primary/80',
            '[&_.ProseMirror.ProseMirror-focused]:outline-none'
          )}
          style={{ 
            minHeight,
            maxHeight: maxHeight || 'none'
          }}
        />

        {/* Placeholder */}
        {editor.isEmpty && !editor.isEditing && (
          <div className="absolute top-3 left-3 text-muted-foreground pointer-events-none select-none">
            {editorOptions.placeholder || 'Start writing...'}
          </div>
        )}
      </div>

      {/* Footer with stats */}
      {(showWordCount || showCharacterCount) && (
        <div className="flex justify-between items-center text-xs text-muted-foreground mt-2 px-1">
          <div className="flex gap-4">
            {showWordCount && (
              <span>
                {editor.wordCount} word{editor.wordCount !== 1 ? 's' : ''}
              </span>
            )}
            {showCharacterCount && (
              <span>
                {editor.characterCount} character{editor.characterCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          {editor.isDirty && (
            <span className="text-orange-500">Unsaved changes</span>
          )}
        </div>
      )}
    </div>
  )
}

export default Editor