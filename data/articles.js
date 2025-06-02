// Article data management
export const articles = [
  {
    id: '1',
    title: 'GPT-5 vs Claude 4: Which AI Assistant Should You Choose?',
    slug: 'gpt-5-vs-claude-4-comparison',
    excerpt: 'We put the latest language models through rigorous real-world tests across coding, writing, analysis, and reasoning tasks. The results surprised even our AI experts.',
    category: 'AI Tools',
    author: 'Michael Torres',
    verdict: 'BEST OVERALL',
    rating: '4.8',
    price: 'From $20/mo',
    quickVerdict: {
      pros: ['Superior reasoning', 'Better context handling'],
      cons: ['Higher cost', 'Slower responses']
    },
    published_date: '2025-02-06',
    featured: false
  },
  {
    id: '2',
    title: 'GitHub Copilot X Review: The Future of Pair Programming',
    slug: 'github-copilot-x-review',
    excerpt: 'Microsoft\'s AI coding assistant promises to write entire functions from comments. We tested it on production code across 5 languages to see if it delivers.',
    category: 'Developer Tools',
    author: 'Alex Kim',
    verdict: 'RECOMMENDED',
    rating: '4.5',
    price: '$19/mo',
    quickVerdict: {
      pros: ['Excellent autocomplete', 'IDE integration'],
      cons: ['Language limitations', 'Requires fine-tuning']
    },
    published_date: '2025-02-05',
    featured: false
  },
  {
    id: '3',
    title: 'Notion AI vs Obsidian: Smart Note-Taking Showdown',
    slug: 'notion-ai-vs-obsidian',
    excerpt: 'Both promise to revolutionize how you organize information with AI assistance. Our month-long test reveals which actually helps you think better.',
    category: 'Productivity',
    author: 'Emma Davis',
    verdict: 'EDITOR\'S CHOICE',
    rating: '4.7',
    price: '$8-16/mo',
    quickVerdict: {
      pros: ['AI summarization', 'Cross-platform sync'],
      cons: ['Learning curve', 'Limited offline AI']
    },
    published_date: '2025-02-04',
    featured: false
  }
];

// Featured article
export const featuredArticle = {
  id: 'featured-1',
  title: 'The Best AI Code Assistants of 2025',
  slug: 'best-ai-code-assistants-2025',
  excerpt: 'After 200 hours of testing with real development projects, we\'ve identified the AI coding tools that actually improve productivity—and the ones that just get in the way.',
  category: 'Featured Review',
  author: 'Sarah Chen',
  image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&h=500&fit=crop',
  stats: {
    toolsTested: 23,
    hoursTesting: '200+',
    winners: 5
  },
  readTime: '47 min read',
  lastUpdated: 'June 2, 2025',
  featured: true
};

// Add new article helper
export const addArticle = (article) => {
  const newArticle = {
    id: Date.now().toString(),
    published_date: new Date().toISOString(),
    ...article
  };
  articles.unshift(newArticle);
  return newArticle;
};

// Update article helper
export const updateArticle = (id, updates) => {
  const index = articles.findIndex(article => article.id === id);
  if (index !== -1) {
    articles[index] = { ...articles[index], ...updates };
    return articles[index];
  }
  return null;
};

// Delete article helper
export const deleteArticle = (id) => {
  const index = articles.findIndex(article => article.id === id);
  if (index !== -1) {
    return articles.splice(index, 1)[0];
  }
  return null;
};