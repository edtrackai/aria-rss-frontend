import { NextApiRequest, NextApiResponse } from 'next'

// Mock articles data
const mockArticles = [
  {
    id: '1',
    title: 'Welcome to NewsHub CMS',
    slug: 'welcome-to-newshub-cms',
    excerpt: 'Get started with our AI-powered content management system',
    status: 'published',
    author: {
      id: '1',
      name: 'Admin User',
      avatar: null
    },
    views: 142,
    revenue: 25.50,
    publishedAt: new Date().toISOString(),
    category: { name: 'General' }
  },
  {
    id: '2',
    title: 'How to Use AI Assistant',
    slug: 'how-to-use-ai-assistant',
    excerpt: 'Learn how to leverage AI for content creation',
    status: 'published',
    author: {
      id: '1',
      name: 'Admin User',
      avatar: null
    },
    views: 89,
    revenue: 15.75,
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    category: { name: 'Tutorial' }
  }
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'GET':
      // Return mock articles
      res.status(200).json({
        articles: mockArticles,
        total: mockArticles.length,
        page: 1,
        limit: 10
      })
      break
      
    case 'POST':
      // Mock create article
      const newArticle = {
        id: Date.now().toString(),
        ...req.body,
        status: 'draft',
        views: 0,
        revenue: 0,
        createdAt: new Date().toISOString(),
        author: {
          id: '1',
          name: 'Admin User',
          avatar: null
        }
      }
      res.status(201).json(newArticle)
      break
      
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}