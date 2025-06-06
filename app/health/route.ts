import { NextResponse } from 'next/server'

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    services: {
      frontend: 'operational',
      backend: process.env.NEXT_PUBLIC_BACKEND_URL ? 'configured' : 'not configured',
      database: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'not configured',
    },
    uptime: process.uptime(),
  }

  return NextResponse.json(health, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}