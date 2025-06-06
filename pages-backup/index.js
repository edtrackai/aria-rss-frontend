import Head from 'next/head';
import ProfessionalLayout from '../components/ProfessionalLayout';
import CategoryNav from '../components/CategoryNav';
import FeaturedHero from '../components/FeaturedHero';
import ProfessionalArticleCard from '../components/ProfessionalArticleCard';
import ProfessionalSidebar from '../components/ProfessionalSidebar';
import { articles } from '../data/articles';
import { siteConfig } from '../data/siteConfig';

// Use articles from data file
const displayArticles = articles.slice(0, 5); // Show first 5 articles


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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="main">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Article List */}
          <section className="space-y-6">
            {/* Affiliate Disclosure */}
            <div className="affiliate-disclosure">
              <span className="disclosure-icon">ℹ️</span>
              <p>AI-Reviewed is supported by its audience. When you purchase through links on our site, we may earn an affiliate commission at no additional cost to you. <a href="/disclosure" className="text-blue-600 dark:text-blue-400 hover:underline">Learn more</a></p>
            </div>

            {/* Article Cards */}
            {displayArticles.map((article) => (
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