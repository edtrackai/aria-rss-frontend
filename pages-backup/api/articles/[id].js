import { db } from '../../../lib/supabase-client';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  try {
    switch (method) {
      case 'GET':
        const article = await db.articles.getBySlug(id);
        if (!article) {
          return res.status(404).json({ error: 'Article not found' });
        }
        res.status(200).json(article);
        break;

      case 'PUT':
        const updatedArticle = await db.articles.update(id, req.body);
        res.status(200).json(updatedArticle);
        break;

      case 'DELETE':
        await db.articles.delete(id);
        res.status(204).end();
        break;

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Article API error:', error);
    res.status(500).json({ error: error.message });
  }
}