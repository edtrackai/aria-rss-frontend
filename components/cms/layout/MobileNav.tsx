"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/cms/ui/button'
import { ScrollArea } from '@/components/cms/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/cms/ui/sheet'
import { 
  LayoutDashboard,
  FileText,
  TrendingUp,
  Settings,
  Users,
  BarChart3,
  Image,
  Calendar,
  Tag,
  Zap,
  Plus,
  MessageSquare,
  Menu,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface MobileNavProps {
  children?: React.ReactNode
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Articles',
    href: '/dashboard/articles',
    icon: FileText,
    children: [
      { name: 'All Articles', href: '/dashboard/articles' },
      { name: 'New Article', href: '/dashboard/articles/new' },
      { name: 'Drafts', href: '/dashboard/articles/drafts' },
      { name: 'Published', href: '/dashboard/articles/published' },
    ]
  },
  {
    name: 'Revenue',
    href: '/dashboard/revenue',
    icon: TrendingUp,
    children: [
      { name: 'Overview', href: '/dashboard/revenue' },
      { name: 'Analytics', href: '/dashboard/revenue/analytics' },
      { name: 'Links', href: '/dashboard/revenue/links' },
      { name: 'Payouts', href: '/dashboard/revenue/payouts' },
    ]
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    name: 'Media',
    href: '/dashboard/media',
    icon: Image,
    children: [
      { name: 'Library', href: '/dashboard/media' },
      { name: 'Upload', href: '/dashboard/media/upload' },
    ]
  },
  {
    name: 'Comments',
    href: '/dashboard/comments',
    icon: MessageSquare,
  },
  {
    name: 'Categories',
    href: '/dashboard/categories',
    icon: Tag,
  },
  {
    name: 'Schedule',
    href: '/dashboard/schedule',
    icon: Calendar,
  },
  {
    name: 'AI Assistant',
    href: '/dashboard/ai',
    icon: Zap,
  },
  {
    name: 'Users',
    href: '/dashboard/users',
    icon: Users,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export function MobileNav({ children }: MobileNavProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const NavItem = ({ item, isChild = false }: { item: any; isChild?: boolean }) => {
    const isActive = pathname === item.href
    const isExpanded = expandedItems.includes(item.name)
    const hasChildren = item.children && item.children.length > 0

    return (
      <div>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start",
            isChild && "ml-4 text-sm"
          )}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.name)
            } else {
              setOpen(false)
            }
          }}
          asChild={!hasChildren}
        >
          {hasChildren ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </div>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          ) : (
            <Link href={item.href} className="flex items-center w-full">
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
            </Link>
          )}
        </Button>
        
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children.map((child: any) => (
              <NavItem key={child.name} item={child} isChild />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <div className="px-6">
          <Link
            href="/dashboard"
            className="flex items-center space-x-2"
            onClick={() => setOpen(false)}
          >
            <FileText className="h-6 w-6" />
            <span className="font-bold">NewsHub CMS</span>
          </Link>
        </div>
        
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] px-6">
          <div className="space-y-2">
            {/* Quick Action */}
            <div className="pb-4">
              <Button
                asChild
                variant="default"
                className="w-full justify-start"
                onClick={() => setOpen(false)}
              >
                <Link href="/dashboard/articles/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Article
                </Link>
              </Button>
            </div>

            {/* Navigation Items */}
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

export default MobileNav