import { NextRequest, NextResponse } from 'next/server'
import { mockTrendingTopics } from '@/lib/dashboard/mockData'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    data: {
      trends: mockTrendingTopics,
      totalResults: mockTrendingTopics.length,
      lastUpdated: new Date().toISOString()
    },
    success: true,
    message: 'Mock data'
  })
}