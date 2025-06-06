"use client"

import React, { useState } from 'react'
import { Editor } from '@tiptap/react'
import { 
  Type, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Image, 
  Video, 
  Table, 
  Plus,
  Minus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export interface BlockSelectorProps {
  editor: Editor
  className?: string
  variant?: 'dropdown' | 'sidebar' | 'floating'
  onBlockInsert?: (blockType: string) => void
}

interface BlockType {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  action: () => void
  category: 'text' | 'media' | 'structure' | 'code'
}

export function BlockSelector({ 
  editor, 
  className, 
  variant = 'dropdown',
  onBlockInsert 
}: BlockSelectorProps) {
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [showVideoDialog, setShowVideoDialog] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoCaption, setVideoCaption] = useState('')

  const insertImage = () => {
    if (imageUrl) {
      editor.commands.insertContent(`<img src="${imageUrl}" alt="${imageAlt}" />`)
      setImageUrl('')
      setImageAlt('')
      setShowImageDialog(false)
      onBlockInsert?.('image')
    }
  }

  const insertVideo = () => {
    if (videoUrl) {
      // For now, insert as a link - in a real implementation you'd handle video embeds
      const videoHtml = videoCaption 
        ? `<p><a href="${videoUrl}">${videoCaption}</a></p>`
        : `<p><a href="${videoUrl}">Video: ${videoUrl}</a></p>`
      
      editor.commands.insertContent(videoHtml)
      setVideoUrl('')
      setVideoCaption('')
      setShowVideoDialog(false)
      onBlockInsert?.('video')
    }
  }

  const insertTable = () => {
    editor.commands.insertContent(`
      <table>
        <tr>
          <th>Header 1</th>
          <th>Header 2</th>
          <th>Header 3</th>
        </tr>
        <tr>
          <td>Cell 1</td>
          <td>Cell 2</td>
          <td>Cell 3</td>
        </tr>
        <tr>
          <td>Cell 4</td>
          <td>Cell 5</td>
          <td>Cell 6</td>
        </tr>
      </table>
    `)
    onBlockInsert?.('table')
  }

  const blockTypes: BlockType[] = [
    // Text blocks
    {
      id: 'paragraph',
      name: 'Paragraph',
      description: 'Regular text paragraph',
      icon: Type,
      action: () => {
        editor.commands.setParagraph()
        onBlockInsert?.('paragraph')
      },
      category: 'text'
    },
    {
      id: 'heading1',
      name: 'Heading 1',
      description: 'Large section heading',
      icon: Heading1,
      action: () => {
        editor.commands.setHeading({ level: 1 })
        onBlockInsert?.('heading1')
      },
      category: 'text'
    },
    {
      id: 'heading2',
      name: 'Heading 2',
      description: 'Medium section heading',
      icon: Heading2,
      action: () => {
        editor.commands.setHeading({ level: 2 })
        onBlockInsert?.('heading2')
      },
      category: 'text'
    },
    {
      id: 'heading3',
      name: 'Heading 3',
      description: 'Small section heading',
      icon: Heading3,
      action: () => {
        editor.commands.setHeading({ level: 3 })
        onBlockInsert?.('heading3')
      },
      category: 'text'
    },
    
    // Structure blocks
    {
      id: 'bulletList',
      name: 'Bullet List',
      description: 'Unordered list with bullets',
      icon: List,
      action: () => {
        editor.commands.toggleBulletList()
        onBlockInsert?.('bulletList')
      },
      category: 'structure'
    },
    {
      id: 'orderedList',
      name: 'Numbered List',
      description: 'Ordered list with numbers',
      icon: ListOrdered,
      action: () => {
        editor.commands.toggleOrderedList()
        onBlockInsert?.('orderedList')
      },
      category: 'structure'
    },
    {
      id: 'blockquote',
      name: 'Quote',
      description: 'Block quote for citations',
      icon: Quote,
      action: () => {
        editor.commands.toggleBlockquote()
        onBlockInsert?.('blockquote')
      },
      category: 'structure'
    },
    {
      id: 'horizontalRule',
      name: 'Divider',
      description: 'Horizontal line separator',
      icon: Minus,
      action: () => {
        editor.commands.setHorizontalRule()
        onBlockInsert?.('horizontalRule')
      },
      category: 'structure'
    },

    // Code blocks
    {
      id: 'codeBlock',
      name: 'Code Block',
      description: 'Formatted code with syntax highlighting',
      icon: Code,
      action: () => {
        editor.commands.toggleCodeBlock()
        onBlockInsert?.('codeBlock')
      },
      category: 'code'
    },

    // Media blocks (with dialogs)
    {
      id: 'image',
      name: 'Image',
      description: 'Insert an image',
      icon: Image,
      action: () => setShowImageDialog(true),
      category: 'media'
    },
    {
      id: 'video',
      name: 'Video',
      description: 'Embed a video',
      icon: Video,
      action: () => setShowVideoDialog(true),
      category: 'media'
    },
    {
      id: 'table',
      name: 'Table',
      description: 'Insert a data table',
      icon: Table,
      action: insertTable,
      category: 'structure'
    }
  ]

  const groupedBlocks = {
    text: blockTypes.filter(block => block.category === 'text'),
    structure: blockTypes.filter(block => block.category === 'structure'),
    code: blockTypes.filter(block => block.category === 'code'),
    media: blockTypes.filter(block => block.category === 'media')
  }

  if (variant === 'dropdown') {
    return (
      <div className={className}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Block
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {/* Text Blocks */}
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Text
            </div>
            {groupedBlocks.text.map((block) => (
              <DropdownMenuItem
                key={block.id}
                onClick={block.action}
                className="flex items-start gap-3 p-3"
              >
                <block.icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">{block.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {block.description}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            {/* Structure Blocks */}
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Structure
            </div>
            {groupedBlocks.structure.map((block) => (
              <DropdownMenuItem
                key={block.id}
                onClick={block.action}
                className="flex items-start gap-3 p-3"
              >
                <block.icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">{block.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {block.description}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            {/* Code Blocks */}
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Code
            </div>
            {groupedBlocks.code.map((block) => (
              <DropdownMenuItem
                key={block.id}
                onClick={block.action}
                className="flex items-start gap-3 p-3"
              >
                <block.icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">{block.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {block.description}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            {/* Media Blocks */}
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Media
            </div>
            {groupedBlocks.media.map((block) => (
              <DropdownMenuItem
                key={block.id}
                onClick={block.action}
                className="flex items-start gap-3 p-3"
              >
                <block.icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">{block.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {block.description}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Image Dialog */}
        <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Insert Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="image-alt">Alt Text</Label>
                <Input
                  id="image-alt"
                  placeholder="Description of the image"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowImageDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={insertImage}
                disabled={!imageUrl}
              >
                Insert Image
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Video Dialog */}
        <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Insert Video</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="video-url">Video URL</Label>
                <Input
                  id="video-url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="video-caption">Caption (optional)</Label>
                <Input
                  id="video-caption"
                  placeholder="Video description or title"
                  value={videoCaption}
                  onChange={(e) => setVideoCaption(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowVideoDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={insertVideo}
                disabled={!videoUrl}
              >
                Insert Video
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // For sidebar or floating variants, you could implement different layouts
  return (
    <div className={cn('space-y-2', className)}>
      {/* Implementation for sidebar or floating variants */}
      <div className="text-sm font-medium">Blocks</div>
      <div className="grid grid-cols-2 gap-2">
        {blockTypes.slice(0, 8).map((block) => (
          <Button
            key={block.id}
            variant="outline"
            size="sm"
            onClick={block.action}
            className="flex items-center gap-2 h-auto p-2"
          >
            <block.icon className="h-4 w-4" />
            <span className="text-xs">{block.name}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}

export default BlockSelector