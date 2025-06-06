"use client"

import React from 'react'
import { ThemeProvider } from '@/components/cms/providers/ThemeProvider'
import { QueryProvider } from '@/components/cms/providers/QueryProvider'
import { Toaster } from '@/components/cms/ui/toaster'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ai-reviewed-theme">
      <QueryProvider>
        {children}
        <Toaster />
      </QueryProvider>
    </ThemeProvider>
  )
}