import { supabase } from '../../lib/supabase-client';

export default async function handler(req, res) {
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('articles')
      .select('count')
      .limit(1);

    if (error) {
      return res.status(500).json({ 
        status: 'error',
        message: 'Database connection failed',
        error: error.message,
        details: 'Please run the SQL setup script in Supabase'
      });
    }

    return res.status(200).json({ 
      status: 'success',
      message: 'Database connection successful',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured',
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    });
  } catch (error) {
    return res.status(500).json({ 
      status: 'error',
      message: 'Server error',
      error: error.message 
    });
  }
}