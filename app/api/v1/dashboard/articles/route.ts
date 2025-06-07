import { NextRequest, NextResponse } from 'next/server'
import { mockRecentArticles } from '@/lib/dashboard/mockData'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    data: {
      articles: mockRecentArticles,
      total: mockRecentArticles.length
    },
    success: true,
    message: 'Mock data'
  })
}