import { NextRequest, NextResponse } from 'next/server'
import { mockRecentActivity } from '@/lib/dashboard/mockData'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    data: {
      items: mockRecentActivity,
      total: mockRecentActivity.length,
      hasMore: false
    },
    success: true,
    message: 'Mock data'
  })
}