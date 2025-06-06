import { db } from '../../../lib/supabase-client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { linkId, articleId } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];
  const referrer = req.headers['referer'] || '';

  try {
    await db.affiliateLinks.trackClick(linkId, {
      article_id: articleId,
      ip_address: ip,
      user_agent: userAgent,
      referrer: referrer
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Click tracking error:', error);
    res.status(500).json({ error: error.message });
  }
}