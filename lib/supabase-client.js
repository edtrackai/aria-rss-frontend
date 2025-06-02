import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gimmdayqdhxfflaedles.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for database operations
export const db = {
  // Articles
  articles: {
    async create(article) {
      const { data, error } = await supabase
        .from('articles')
        .insert([article])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async update(id, updates) {
      const { data, error } = await supabase
        .from('articles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async getAll(status = null) {
      let query = supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    async getBySlug(slug) {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },

    async incrementViews(id) {
      const { error } = await supabase.rpc('increment_article_views', { article_id: id });
      if (error) throw error;
    }
  },

  // Affiliate Links
  affiliateLinks: {
    async create(link) {
      const { data, error } = await supabase
        .from('affiliate_links')
        .insert([link])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async update(id, updates) {
      const { data, error } = await supabase
        .from('affiliate_links')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async getAll() {
      const { data, error } = await supabase
        .from('affiliate_links')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    async getByShortUrl(shortUrl) {
      const { data, error } = await supabase
        .from('affiliate_links')
        .select('*')
        .eq('short_url', shortUrl)
        .single();
      
      if (error) throw error;
      return data;
    },

    async trackClick(linkId, metadata = {}) {
      const { error } = await supabase
        .from('link_clicks')
        .insert([{
          link_id: linkId,
          ...metadata
        }]);
      
      if (error) throw error;

      // Increment click count
      await supabase.rpc('increment_link_clicks', { link_id: linkId });
    },

    async delete(id) {
      const { error } = await supabase
        .from('affiliate_links')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    }
  },

  // Analytics
  analytics: {
    async recordPageView(articleId) {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('analytics')
        .upsert({
          article_id: articleId,
          date: today,
          views: 1
        }, {
          onConflict: 'article_id,date',
          count: 'exact'
        });
      
      if (error) throw error;
    },

    async getStats(dateRange = 30) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);
      
      const { data, error } = await supabase
        .from('analytics')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0]);
      
      if (error) throw error;
      return data;
    }
  }
};

// Authentication helpers
export const auth = {
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};