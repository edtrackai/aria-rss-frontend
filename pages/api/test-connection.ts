import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // For now, return a mock success response
  res.status(200).json({
    status: 'ok',
    message: 'API is working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    backend: {
      url: process.env.NEXT_PUBLIC_BACKEND_URL || 'not configured',
      status: 'mock mode'
    }
  })
}