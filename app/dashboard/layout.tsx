"use client"

import React from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/cms/layout/Sidebar'
import { MobileNav } from '@/components/cms/layout/MobileNav'
import { cn } from '@/lib/utils'

// Dynamic import Header to prevent SSR issues with useTheme
const Header = dynamic(
  () => import('@/components/cms/layout/Header').then(mod => ({ default: mod.Header })),
  { ssr: false }
)

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const pathname = usePathname()

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    if (!pathname) return []
    const paths = pathname.split('/').filter(Boolean)
    return paths.map((path, index) => {
      const href = '/' + paths.slice(0, index + 1).join('/')
      const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ')
      return { label, href, isLast: index === paths.length - 1 }
    })
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow border-r bg-background overflow-y-auto">
          <Sidebar />
        </div>
      </aside>

      {/* Mobile navigation */}
      <MobileNav />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Breadcrumbs */}
        <div className="border-b">
          <div className="flex h-10 items-center px-4">
            <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.href}>
                  {index > 0 && <span className="mx-1">/</span>}
                  {crumb.isLast ? (
                    <span className="font-medium text-foreground">{crumb.label}</span>
                  ) : (
                    <a
                      href={crumb.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {crumb.label}
                    </a>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-muted/10">
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}