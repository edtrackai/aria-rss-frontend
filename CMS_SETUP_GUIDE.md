# AI-Reviewed CMS Setup Guide

## 🚀 Quick Setup to Make Everything Work

### 1. **Database Setup (Supabase)**

1. Go to your Supabase project: https://app.supabase.com/project/gimmdayqdhxfflaedles
2. Click on "SQL Editor" in the left sidebar
3. Copy and paste the entire contents of `/scripts/setup-database.sql`
4. Click "Run" to create all tables

### 2. **Environment Variables**

1. Copy `.env.local.example` to `.env.local`
2. Add your Supabase anon key:
   - Go to Supabase > Settings > API
   - Copy the "anon public" key
   - Paste it in `.env.local`

```bash
cp .env.local.example .env.local
# Edit .env.local with your keys
```

### 3. **Install Dependencies**

```bash
npm install @supabase/supabase-js
```

### 4. **Test the CMS**

1. Run the development server:
   ```bash
   npm run dev
   ```

2. Go to http://localhost:3000/admin
3. Use password: `admin123`

## 📋 Features That Are Now Working

### ✅ **Article Management**
- Create new articles with rich text editor
- Save as draft or publish
- Articles are stored in Supabase database
- SEO metadata management

### ✅ **Affiliate Link Management**
- Add affiliate links with tracking
- Automatic short URL generation
- Click tracking (when integrated with frontend)
- Revenue tracking capabilities

### ✅ **Basic Analytics**
- View counts per article
- Click tracking for affiliate links
- Basic dashboard statistics

## 🔧 Features That Need Additional Setup

### 1. **AI Content Generation**
To enable AI features:
1. Get a Claude API key from Anthropic
2. Add to `.env.local`: `CLAUDE_API_KEY=your_key`
3. Implement API route `/api/ai/generate`

### 2. **Authentication**
Currently using simple password. To add proper auth:
1. Enable Supabase Authentication
2. Create admin users in Supabase
3. Update auth checks in admin pages

### 3. **Image Uploads**
To enable image uploads:
1. Create a Supabase Storage bucket
2. Add upload functionality to the editor

### 4. **Email Notifications**
To add email features:
1. Set up Supabase Email or SendGrid
2. Create notification triggers

## 🎯 How to Use the CMS

### Creating an Article
1. Go to `/admin` → Click "New Article"
2. Fill in the details:
   - Title and slug (auto-generated)
   - Category and author
   - Write content in rich editor
   - Add pros/cons
   - Set verdict and rating
3. Click "Save Draft" or "Publish"

### Managing Affiliate Links
1. Go to `/admin/affiliates`
2. Click "Add New Link"
3. Enter product details and URLs
4. System generates short URL automatically
5. Track clicks and revenue

### Viewing Analytics
1. Dashboard shows overview stats
2. Individual article performance
3. Affiliate link performance
4. Export data as CSV

## 🐛 Troubleshooting

### "Failed to save article"
- Check Supabase connection
- Verify environment variables
- Check browser console for errors

### "Affiliate link not tracking"
- Ensure database tables are created
- Check RLS policies in Supabase
- Verify API routes are working

### Database Connection Issues
1. Check `.env.local` has correct Supabase URL and key
2. Verify tables exist in Supabase
3. Check Supabase service is running

## 📚 Next Steps

1. **Production Deployment**
   - Add environment variables to Vercel
   - Enable Supabase RLS policies
   - Set up proper authentication

2. **Enhanced Features**
   - Implement AI content generation
   - Add image optimization
   - Create automated backups

3. **Performance**
   - Add caching for articles
   - Implement CDN for images
   - Optimize database queries

## 🆘 Need Help?

- Check Supabase logs: Project > Logs
- Browser console for frontend errors
- Network tab for API issues
- Vercel logs for production issues