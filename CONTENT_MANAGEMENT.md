# AI-Reviewed Content Management Guide

## How to Update Content Without a CMS

### 1. Quick Article Updates

Edit `/data/articles.js`:

```javascript
// To add a new article, add to the articles array:
{
  id: '6',
  title: 'Your New Article Title',
  slug: 'your-article-slug',
  excerpt: 'Brief description of the article...',
  category: 'AI Tools', // or 'Developer Tools', 'Productivity', etc.
  author: 'Author Name',
  verdict: 'RECOMMENDED', // Options: BEST OVERALL, RECOMMENDED, GOOD VALUE, AVOID
  rating: '4.5',
  price: '$20/mo',
  quickVerdict: {
    pros: ['Pro 1', 'Pro 2'],
    cons: ['Con 1', 'Con 2']
  },
  published_date: '2025-02-06',
  featured: false
}
```

### 2. Site Configuration Updates

Edit `/data/siteConfig.js` to change:
- Site name, tagline, description
- Navigation menu items
- Categories and counts
- Social media links
- Footer links
- Trust indicators

### 3. Common Update Tasks

#### Change Featured Article
In `/data/articles.js`, update the `featuredArticle` object.

#### Add New Category
1. Add to `/data/siteConfig.js` in the categories array
2. Update the category count

#### Update Navigation
Edit the `mainNav` array in `/data/siteConfig.js`

### 4. Deployment Workflow

```bash
# 1. Test locally
npm run dev

# 2. Build for production
npm run build

# 3. Commit and deploy
git add .
git commit -m "Update content: [describe changes]"
git push origin main
```

## Three Ways to Edit Content

### Option 1: Edit on GitHub (Easiest)
1. Go to https://github.com/edtrackai/aria-rss-frontend
2. Navigate to `/data/articles.js` or `/data/siteConfig.js`
3. Click the pencil icon to edit
4. Make your changes
5. Commit directly to main branch
6. Vercel will auto-deploy in ~1 minute

### Option 2: Local Development
```bash
# Make changes locally
cd /Users/shahlal/Documents/RSS/frontend
npm run dev
# Edit files in your code editor
# Preview at http://localhost:3000
git add .
git commit -m "Update: [what you changed]"
git push
```

### Option 3: Use VS Code with GitHub
1. Install GitHub Pull Requests extension
2. Edit files directly in VS Code
3. Commit and push from VS Code

## Future CMS Options

### 1. Simple Admin Panel
We can create `/pages/admin/index.js` with forms to edit content.

### 2. Supabase Integration
Since you already have Supabase:
- Create content tables
- Build edit forms
- Real-time updates

### 3. Headless CMS Services
- **Strapi** (self-hosted)
- **Sanity.io** (developer-friendly)
- **Contentful** (enterprise)

### 4. Git-based CMS
- **Netlify CMS** (free, GitHub-based)
- **TinaCMS** (visual editing)

## Quick Reference

**Add Article**: Edit `/data/articles.js`
**Change Site Info**: Edit `/data/siteConfig.js`
**Update Categories**: Edit categories in `/data/siteConfig.js`
**Deploy**: Push to GitHub main branch

**Live Site**: https://ai-reviewed.com
**GitHub**: https://github.com/edtrackai/aria-rss-frontend
**Vercel**: https://vercel.com/blueteam17/smart-affiliate-blog