// Mock data for dashboard when backend is not available

export const mockDashboardStats = {
  current: {
    articles: 45,
    views: 12543,
    revenue: 1847.50,
    clicks: 3421,
    conversions: 127
  },
  previous: {
    articles: 38,
    views: 9876,
    revenue: 1432.25,
    clicks: 2890,
    conversions: 98
  },
  growth: {
    articles: 18.4,
    views: 27.0,
    revenue: 29.0,
    clicks: 18.4,
    conversions: 29.6
  }
}

export const mockRecentActivity = [
  {
    id: '1',
    type: 'article_published',
    title: 'New Article Published',
    description: 'Published "Best Laptops for Developers in 2025"',
    timestamp: new Date().toISOString(),
    user: { name: 'John Doe', avatar: '' },
    metadata: {}
  },
  {
    id: '2',
    type: 'revenue_earned',
    title: 'Revenue Earned',
    description: 'Earned $25.50 from affiliate sales',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    user: { name: 'System', avatar: '' },
    metadata: { amount: 25.50 }
  },
  {
    id: '3',
    type: 'comment_added',
    title: 'New Comment',
    description: 'Sarah commented on "AI Tools for Content Creation"',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    user: { name: 'Sarah Smith', avatar: '' },
    metadata: {}
  }
]

export const mockRecentArticles = [
  {
    id: '1',
    title: 'Best Laptops for Developers in 2025',
    slug: 'best-laptops-developers-2025',
    status: 'published' as const,
    author: {
      id: '1',
      name: 'John Doe',
      avatar: ''
    },
    publishedAt: new Date().toISOString(),
    views: 523,
    revenue: 125.50,
    category: { name: 'Technology' }
  },
  {
    id: '2',
    title: 'AI Tools for Content Creation',
    slug: 'ai-tools-content-creation',
    status: 'published' as const,
    author: {
      id: '2',
      name: 'Jane Smith',
      avatar: ''
    },
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    views: 412,
    revenue: 89.25,
    category: { name: 'AI' }
  }
]

export const mockRevenueData = {
  totalRevenue: 5847.50,
  chartData: [
    { date: '2025-06-01', revenue: 245.50, clicks: 423, conversions: 12 },
    { date: '2025-06-02', revenue: 312.75, clicks: 512, conversions: 15 },
    { date: '2025-06-03', revenue: 189.25, clicks: 334, conversions: 8 },
    { date: '2025-06-04', revenue: 425.00, clicks: 623, conversions: 18 },
    { date: '2025-06-05', revenue: 367.50, clicks: 545, conversions: 14 },
    { date: '2025-06-06', revenue: 298.25, clicks: 467, conversions: 11 }
  ],
  topProducts: [
    { id: '1', name: 'MacBook Pro M3', revenue: 1250.00, clicks: 845, conversions: 32 },
    { id: '2', name: 'iPhone 15 Pro', revenue: 890.50, clicks: 723, conversions: 28 },
    { id: '3', name: 'Sony WH-1000XM5', revenue: 567.25, clicks: 512, conversions: 19 }
  ],
  affiliateBreakdown: [
    { network: 'Amazon', revenue: 2450.50, percentage: 42 },
    { network: 'ShareASale', revenue: 1890.25, percentage: 32 },
    { network: 'CJ Affiliate', revenue: 1506.75, percentage: 26 }
  ]
}

export const mockTrendingTopics = [
  { keyword: 'ai-tools', volume: 15420, difficulty: 45, competition: 'medium' as const, trend: [], relatedKeywords: [], questions: [], cpc: 2.45 },
  { keyword: 'macbook-m3', volume: 12350, difficulty: 38, competition: 'low' as const, trend: [], relatedKeywords: [], questions: [], cpc: 3.12 },
  { keyword: 'productivity-apps', volume: 9870, difficulty: 52, competition: 'high' as const, trend: [], relatedKeywords: [], questions: [], cpc: 1.89 },
  { keyword: 'web-development', volume: 18900, difficulty: 41, competition: 'medium' as const, trend: [], relatedKeywords: [], questions: [], cpc: 2.78 },
  { keyword: 'tech-reviews', volume: 7650, difficulty: 35, competition: 'low' as const, trend: [], relatedKeywords: [], questions: [], cpc: 1.56 }
]