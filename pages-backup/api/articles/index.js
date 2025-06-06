import { db } from '../../../lib/supabase-client';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        const { status } = req.query;
        const articles = await db.articles.getAll(status);
        res.status(200).json(articles);
        break;

      case 'POST':
        const newArticle = await db.articles.create(req.body);
        res.status(201).json(newArticle);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Articles API error:', error);
    res.status(500).json({ error: error.message });
  }
}