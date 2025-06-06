import { NextApiRequest, NextApiResponse } from 'next'

// Mock affiliate data
const mockAffiliateLinks = [
  {
    id: '1',
    product_name: 'MacBook Pro M3',
    url: 'https://example.com/macbook',
    affiliate_network: 'Amazon',
    commission_rate: 3.5,
    clicks: 245,
    conversions: 12,
    revenue: 420.50,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    product_name: 'Sony WH-1000XM5',
    url: 'https://example.com/sony-headphones',
    affiliate_network: 'ShareASale',
    commission_rate: 5.0,
    clicks: 189,
    conversions: 8,
    revenue: 156.80,
    created_at: new Date().toISOString()
  }
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'GET':
      res.status(200).json({
        links: mockAffiliateLinks,
        total: mockAffiliateLinks.length,
        totalRevenue: mockAffiliateLinks.reduce((sum, link) => sum + link.revenue, 0)
      })
      break
      
    case 'POST':
      const newLink = {
        id: Date.now().toString(),
        ...req.body,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        created_at: new Date().toISOString()
      }
      res.status(201).json(newLink)
      break
      
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}