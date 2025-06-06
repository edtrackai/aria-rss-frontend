"use client"

import React, { useState } from 'react'
import { Editor } from '@tiptap/react'
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code, 
  List, 
  ListOrdered, 
  Quote, 
  Heading1, 
  Heading2, 
  Heading3,
  Minus,
  Link,
  Unlink,
  Undo,
  Redo,
  Type
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface EditorToolbarProps {
  editor: Editor
  className?: string
}

export function EditorToolbar({ editor, className }: EditorToolbarProps) {
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [showLinkDialog, setShowLinkDialog] = useState(false)

  const addLink = () => {
    if (linkUrl) {
      if (linkText) {
        editor.commands.insertContent(`<a href="${linkUrl}">${linkText}</a>`)
      } else {
        editor.commands.insertContent(`<a href="${linkUrl}">${linkUrl}</a>`)
      }
      setLinkUrl('')
      setLinkText('')
      setShowLinkDialog(false)
    }
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    disabled = false, 
    children, 
    title 
  }: {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    children: React.ReactNode
    title: string
  }) => (
    <Button
      type="button"
      variant={isActive ? "secondary" : "ghost"}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "h-8 w-8 p-0",
        isActive && "bg-secondary text-secondary-foreground"
      )}
    >
      {children}
    </Button>
  )

  return (
    <div className={cn(
      "flex items-center gap-1 p-2 bg-background border-b",
      className
    )}>
      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          onClick={() => editor.commands.undo()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.commands.redo()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Headings */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2 gap-1">
            <Type className="h-4 w-4" />
            <span className="text-xs">
              {editor.isActive('heading', { level: 1 }) ? 'H1' :
               editor.isActive('heading', { level: 2 }) ? 'H2' :
               editor.isActive('heading', { level: 3 }) ? 'H3' :
               editor.isActive('heading', { level: 4 }) ? 'H4' :
               editor.isActive('heading', { level: 5 }) ? 'H5' :
               editor.isActive('heading', { level: 6 }) ? 'H6' : 'P'}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onClick={() => editor.commands.setParagraph()}
            className={editor.isActive('paragraph') ? 'bg-secondary' : ''}
          >
            Paragraph
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.commands.setHeading({ level: 1 })}
            className={editor.isActive('heading', { level: 1 }) ? 'bg-secondary' : ''}
          >
            Heading 1
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.commands.setHeading({ level: 2 })}
            className={editor.isActive('heading', { level: 2 }) ? 'bg-secondary' : ''}
          >
            Heading 2
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.commands.setHeading({ level: 3 })}
            className={editor.isActive('heading', { level: 3 }) ? 'bg-secondary' : ''}
          >
            Heading 3
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.commands.setHeading({ level: 4 })}
            className={editor.isActive('heading', { level: 4 }) ? 'bg-secondary' : ''}
          >
            Heading 4
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.commands.setHeading({ level: 5 })}
            className={editor.isActive('heading', { level: 5 }) ? 'bg-secondary' : ''}
          >
            Heading 5
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.commands.setHeading({ level: 6 })}
            className={editor.isActive('heading', { level: 6 }) ? 'bg-secondary' : ''}
          >
            Heading 6
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Text formatting */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          onClick={() => editor.commands.toggleBold()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.commands.toggleItalic()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.commands.toggleStrike()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.commands.toggleCode()}
          isActive={editor.isActive('code')}
          title="Inline Code"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Lists and blocks */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          onClick={() => editor.commands.toggleBulletList()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.commands.toggleOrderedList()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.commands.toggleBlockquote()}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Links and elements */}
      <div className="flex items-center gap-1">
        <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Add Link"
            >
              <Link className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="link-text">Link Text (optional)</Label>
                <Input
                  id="link-text"
                  placeholder="Link description"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLinkDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={addLink}
                disabled={!linkUrl}
              >
                Add Link
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ToolbarButton
          onClick={() => editor.commands.unsetMark('link')}
          disabled={!editor.isActive('link')}
          title="Remove Link"
        >
          <Unlink className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.commands.setHorizontalRule()}
          title="Horizontal Line"
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>
      </div>
    </div>
  )
}

export default EditorToolbar