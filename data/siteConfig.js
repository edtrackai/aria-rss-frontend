// Site configuration
export const siteConfig = {
  name: 'AI-Reviewed',
  tagline: 'Independent tech reviews you can trust',
  established: 'Est. 2020',
  description: 'We buy all products with our own funds, test them extensively, and tell you exactly what\'s worth your money. No sponsored content, ever.',
  
  // SEO
  seo: {
    defaultTitle: 'AI-Reviewed | Independent Tech Reviews You Can Trust',
    titleTemplate: '%s | AI-Reviewed',
    defaultDescription: 'We buy all products with our own funds, test them extensively, and tell you exactly what\'s worth your money. No sponsored content, ever.',
    siteUrl: 'https://ai-reviewed.com',
    openGraph: {
      type: 'website',
      locale: 'en_US',
      site_name: 'AI-Reviewed',
    },
    twitter: {
      handle: '@aireviewed',
      site: '@aireviewed',
      cardType: 'summary_large_image',
    },
  },
  
  // Navigation
  mainNav: [
    { name: 'All Reviews', href: '/' },
    { name: 'Best AI Tools', href: '/best-ai-tools' },
    { name: 'Software', href: '/software' },
    { name: 'Hardware', href: '/hardware' },
    { name: 'Guides', href: '/guides' },
    { name: 'Methodology', href: '/methodology' },
    { name: 'About', href: '/about' },
  ],
  
  // Categories
  categories: [
    { name: 'All Categories', slug: 'all', count: 247 },
    { name: 'AI Language Models', slug: 'ai-language-models', count: 32 },
    { name: 'Developer Tools', slug: 'developer-tools', count: 45 },
    { name: 'Productivity Software', slug: 'productivity', count: 38 },
    { name: 'Security Tools', slug: 'security', count: 29 },
    { name: 'Cloud Services', slug: 'cloud', count: 41 },
    { name: 'Mobile Apps', slug: 'mobile', count: 35 },
    { name: 'Smart Home', slug: 'smart-home', count: 27 },
  ],
  
  // Trust indicators
  trustIndicators: [
    'We buy all products with our own funds',
    '200+ hours average testing per category',
    'No sponsored content or paid placements',
    'Expert reviewers with 10+ years experience'
  ],
  
  // Stats
  stats: {
    readers: '127,000+',
    reviewsPublished: 247,
    hoursTesting: '200+',
    savedByReaders: '$2.4M+'
  },
  
  // Social links
  social: {
    twitter: 'https://twitter.com/aireviewed',
    linkedin: 'https://linkedin.com/company/ai-reviewed',
    youtube: 'https://youtube.com/ai-reviewed',
    instagram: 'https://instagram.com/aireviewed'
  },
  
  // Footer
  footer: {
    categories: [
      { name: 'AI & Machine Learning', href: '/ai-ml' },
      { name: 'Developer Tools', href: '/developer-tools' },
      { name: 'Productivity Software', href: '/productivity' },
      { name: 'Security & Privacy', href: '/security' },
      { name: 'Cloud Services', href: '/cloud' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'How We Test', href: '/methodology' },
      { name: 'Editorial Guidelines', href: '/guidelines' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press Kit', href: '/press' },
    ],
    resources: [
      { name: 'Buying Guides', href: '/guides' },
      { name: 'Tech Glossary', href: '/glossary' },
      { name: 'Price Tracker', href: '/price-tracker' },
      { name: 'Deals & Discounts', href: '/deals' },
      { name: 'API Access', href: '/api' },
    ],
    connect: [
      { name: 'Newsletter', href: '/newsletter' },
      { name: 'Podcast', href: '/podcast' },
      { name: 'RSS Feed', href: '/rss' },
      { name: 'Contact Support', href: '/contact' },
    ],
  },
  
  // Announcement bar
  announcement: {
    enabled: true,
    text: '🎉 New: Our 2025 Best AI Tools guide is here!',
    link: '/guides/best-ai-tools-2025',
    linkText: 'Read it now →'
  }
};