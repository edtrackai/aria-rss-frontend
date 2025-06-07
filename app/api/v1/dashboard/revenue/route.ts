import { NextRequest, NextResponse } from 'next/server'
import { mockRevenueData } from '@/lib/dashboard/mockData'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    data: mockRevenueData,
    success: true,
    message: 'Mock data'
  })
}