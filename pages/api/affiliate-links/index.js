import { db } from '../../../lib/supabase-client';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        const links = await db.affiliateLinks.getAll();
        res.status(200).json(links);
        break;

      case 'POST':
        // Generate short URL
        const shortUrl = `https://ai-reviewed.com/go/${req.body.product.toLowerCase().replace(/\s+/g, '-')}`;
        const newLink = await db.affiliateLinks.create({
          ...req.body,
          short_url: shortUrl
        });
        res.status(201).json(newLink);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Affiliate links API error:', error);
    res.status(500).json({ error: error.message });
  }
}