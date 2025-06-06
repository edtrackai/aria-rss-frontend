"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/cms/ui/button'
import { ScrollArea } from '@/components/cms/ui/scroll-area'
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
  Upload
} from 'lucide-react'

interface SidebarProps {
  className?: string
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

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Button
              asChild
              variant="default"
              className="w-full justify-start"
            >
              <Link href="/dashboard/articles/new">
                <Plus className="mr-2 h-4 w-4" />
                New Article
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Navigation
          </h2>
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-1">
              {navigation.map((item) => (
                <div key={item.name}>
                  <Button
                    asChild
                    variant={pathname === item.href ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Link href={item.href}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Link>
                  </Button>
                  
                  {item.children && pathname && pathname.startsWith(item.href) && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={cn(
                            "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                            pathname === child.href ? "bg-accent" : "transparent"
                          )}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

export default Sidebar