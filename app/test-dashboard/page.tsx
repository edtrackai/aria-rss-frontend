"use client"

import { useEffect, useState } from 'react'

export default function TestDashboardPage() {
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [apiTest, setApiTest] = useState<any>(null)

  useEffect(() => {
    // Capture any console errors
    const originalError = console.error
    const capturedErrors: string[] = []
    
    console.error = (...args) => {
      capturedErrors.push(args.join(' '))
      originalError(...args)
    }

    // Test API connection
    fetch('/api/test-connection')
      .then(res => res.json())
      .then(data => setApiTest(data))
      .catch(err => capturedErrors.push(`API Error: ${err.message}`))

    // Test dashboard stats endpoint
    fetch('/api/v1/dashboard/stats')
      .then(res => res.json())
      .then(data => capturedErrors.push(`Stats Response: ${JSON.stringify(data)}`))
      .catch(err => capturedErrors.push(`Stats Error: ${err.message}`))

    setTimeout(() => {
      setErrors(capturedErrors)
      setLoading(false)
      console.error = originalError
    }, 2000)
  }, [])

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Dashboard Debug Page</h1>
      
      <div className="rounded-lg border p-4">
        <h2 className="font-semibold mb-2">API Test Connection:</h2>
        <pre className="text-sm">{JSON.stringify(apiTest, null, 2)}</pre>
      </div>

      <div className="rounded-lg border p-4">
        <h2 className="font-semibold mb-2">Loading State:</h2>
        <p>{loading ? 'Loading...' : 'Loaded'}</p>
      </div>

      <div className="rounded-lg border p-4">
        <h2 className="font-semibold mb-2">Console Errors ({errors.length}):</h2>
        {errors.length === 0 ? (
          <p className="text-green-600">No errors detected</p>
        ) : (
          <ul className="space-y-2">
            {errors.map((error, i) => (
              <li key={i} className="text-red-600 text-sm font-mono">{error}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-lg border p-4">
        <h2 className="font-semibold mb-2">Environment Variables:</h2>
        <ul className="text-sm space-y-1">
          <li>API URL: {process.env.NEXT_PUBLIC_API_URL || 'Not set'}</li>
          <li>WS URL: {process.env.NEXT_PUBLIC_WS_URL || 'Not set'}</li>
          <li>Backend URL: {process.env.NEXT_PUBLIC_BACKEND_URL || 'Not set'}</li>
        </ul>
      </div>
    </div>
  )
}