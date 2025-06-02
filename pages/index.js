import Head from 'next/head';
import ProfessionalLayout from '../components/ProfessionalLayout';
import CategoryNav from '../components/CategoryNav';
import FeaturedHero from '../components/FeaturedHero';
import ProfessionalArticleCard from '../components/ProfessionalArticleCard';
import ProfessionalSidebar from '../components/ProfessionalSidebar';

// Demo articles with enhanced data
const articles = [
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
    published_date: new Date().toISOString()
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
    published_date: new Date().toISOString()
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
    published_date: new Date().toISOString()
  },
  {
    id: '4',
    title: '1Password vs Bitwarden: Ultimate Security Showdown',
    slug: '1password-vs-bitwarden-2025',
    excerpt: 'We tested both password managers with security experts to find out which one actually keeps your data safer in 2025.',
    category: 'Security Tools',
    author: 'Sarah Chen',
    verdict: 'RECOMMENDED',
    rating: '4.6',
    price: 'From $3/mo',
    quickVerdict: {
      pros: ['Zero-knowledge encryption', 'Cross-platform support'],
      cons: ['Complex setup', 'Premium features locked']
    },
    published_date: new Date().toISOString()
  },
  {
    id: '5',
    title: 'Midjourney 6 Review: Is AI Art Finally Professional-Grade?',
    slug: 'midjourney-6-review',
    excerpt: 'After generating 1,000+ images for commercial projects, we can definitively answer whether Midjourney is ready for professional use.',
    category: 'AI Tools',
    author: 'Rachel Green',
    verdict: 'GOOD VALUE',
    rating: '4.4',
    price: '$10-30/mo',
    quickVerdict: {
      pros: ['Stunning image quality', 'Fast generation'],
      cons: ['Inconsistent styles', 'Discord-only interface']
    },
    published_date: new Date().toISOString()
  }
];

export default function Home() {
  return (
    <ProfessionalLayout>
      <Head>
        <title>AI-Reviewed | Independent Tech Reviews You Can Trust</title>
        <meta name="description" content="We buy all products with our own funds, test them extensively, and tell you exactly what's worth your money. No sponsored content, ever." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Breadcrumbs */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-sm text-gray-500 dark:text-gray-400">
        <a href="/" className="hover:text-gray-700 dark:hover:text-gray-300">Home</a> / <a href="/" className="hover:text-gray-700 dark:hover:text-gray-300">Reviews</a> / All Reviews
      </nav>

      {/* Category Navigation */}
      <CategoryNav activeCategory="all" />

      {/* Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <p className="text-gray-600 dark:text-gray-400 text-sm">Showing 247 reviews</p>
        <div className="flex gap-4">
          <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer">
            <option>Most Recent</option>
            <option>Highest Rated</option>
            <option>Most Popular</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer">
            <option>All Time</option>
            <option>2025</option>
            <option>2024</option>
            <option>Last 6 Months</option>
          </select>
        </div>
      </div>

      {/* Featured Hero */}
      <FeaturedHero />

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Article List */}
          <section className="space-y-6">
            {/* Affiliate Disclosure */}
            <div className="affiliate-disclosure">
              <span className="disclosure-icon">ℹ️</span>
              <p>AI-Reviewed is supported by its audience. When you purchase through links on our site, we may earn an affiliate commission at no additional cost to you. <a href="/disclosure" className="text-blue-600 dark:text-blue-400 hover:underline">Learn more</a></p>
            </div>

            {/* Article Cards */}
            {articles.map((article) => (
              <ProfessionalArticleCard key={article.id} article={article} />
            ))}

            {/* Load More */}
            <div className="text-center pt-8">
              <button className="bg-white dark:bg-gray-800 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white px-8 py-3 rounded-md font-semibold hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900 transition-all">
                Load More Reviews
              </button>
            </div>
          </section>

          {/* Sidebar */}
          <ProfessionalSidebar />
        </div>
      </main>
    </ProfessionalLayout>
  );
}