import { NextRequest, NextResponse } from 'next/server'
import { mockDashboardStats } from '@/lib/dashboard/mockData'

// Transform mock data to match DashboardStats interface
function transformMockData(mockData: any) {
  return {
    totalArticles: mockData.current?.articles || 45,
    publishedArticles: mockData.current?.articles || 45,
    draftArticles: 0,
    totalViews: mockData.current?.views || 12543,
    totalRevenue: mockData.current?.revenue || 1847.50,
    monthlyRevenue: mockData.current?.revenue || 1847.50,
    totalClicks: mockData.current?.clicks || 3421,
    totalComments: 234,
    conversionRate: 3.7,
    viewsChange: mockData.growth?.views || 27.0,
    revenueChange: mockData.growth?.revenue || 29.0,
    articlesChange: mockData.growth?.articles || 18.4,
    commentsChange: 15.2,
    topPerformingArticles: [
      { id: '1', title: 'Best Laptops for Developers', views: 523, revenue: 125.50 },
      { id: '2', title: 'AI Tools for Content Creation', views: 412, revenue: 89.25 },
      { id: '3', title: 'Web Development in 2025', views: 387, revenue: 67.75 }
    ],
    recentActivity: [
      { id: '1', type: 'article_published', description: 'Published "Best Laptops for Developers"', timestamp: new Date().toISOString() },
      { id: '2', type: 'revenue_earned', description: 'Earned $25.50 from affiliate sales', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: '3', type: 'comment_added', description: 'New comment on "AI Tools"', timestamp: new Date(Date.now() - 7200000).toISOString() }
    ],
    revenueChart: [
      { date: '2025-06-01', revenue: 245.50, clicks: 423 },
      { date: '2025-06-02', revenue: 312.75, clicks: 512 },
      { date: '2025-06-03', revenue: 189.25, clicks: 334 },
      { date: '2025-06-04', revenue: 425.00, clicks: 623 },
      { date: '2025-06-05', revenue: 367.50, clicks: 545 },
      { date: '2025-06-06', revenue: 298.25, clicks: 467 }
    ],
    trafficSources: [
      { source: 'Google', visits: 5234, percentage: 42 },
      { source: 'Direct', visits: 3123, percentage: 25 },
      { source: 'Social Media', visits: 2456, percentage: 20 },
      { source: 'Referral', visits: 1730, percentage: 13 }
    ]
  }
}

export async function GET(request: NextRequest) {
  // Log that we're using mock data
  console.log('Dashboard stats endpoint called - returning mock data')
  
  const transformedData = transformMockData(mockDashboardStats)
  
  return NextResponse.json({
    data: transformedData,
    success: true,
    message: 'Mock data'
  })
}