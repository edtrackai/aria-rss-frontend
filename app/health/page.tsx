'use client'

import { useEffect, useState } from 'react'

export default function HealthPage() {
  const [config, setConfig] = useState<any>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      setConfig({
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'Not set',
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set',
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'Not set',
        API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Health Check</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Environment Configuration:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(config, null, 2)}
        </pre>
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Diagnostics:</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Window object available: {typeof window !== 'undefined' ? 'Yes' : 'No'}</li>
          <li>Document object available: {typeof document !== 'undefined' ? 'Yes' : 'No'}</li>
          <li>Next.js version: 14.0.4</li>
        </ul>
      </div>
    </div>
  )
}