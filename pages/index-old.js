import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import useSWR from 'swr';
import { format } from 'date-fns';
import Layout from '../components/Layout';
import ArticleCard from '../components/ArticleCard';
import TrendingTopics from '../components/TrendingTopics';
import SourcesList from '../components/SourcesList';
import Newsletter from '../components/Newsletter';
import HeroSection from '../components/HeroSection';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Fetch latest articles
  const { data: articlesData, error: articlesError } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/articles/published?limit=12`,
    fetcher,
    { refreshInterval: 60000 } // Refresh every minute
  );
  
  // Fetch trending topics
  const { data: topicsData, error: topicsError } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/topics/trending?limit=5`,
    fetcher,
    { refreshInterval: 300000 } // Refresh every 5 minutes
  );
  
  // Fetch system stats
  const { data: statsData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/stats`,
    fetcher,
    { refreshInterval: 300000 }
  );
  
  const articles = articlesData?.articles || [];
  const topics = topicsData?.topics || [];
  const stats = statsData || {};
  
  // Filter articles by category
  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);
  
  const categories = [
    { id: 'all', name: 'All Tech', emoji: '🔍' },
    { id: 'smartphones', name: 'Smartphones', emoji: '📱' },
    { id: 'laptops', name: 'Laptops', emoji: '💻' },
    { id: 'audio', name: 'Audio', emoji: '🎧' },
    { id: 'gaming', name: 'Gaming', emoji: '🎮' },
    { id: 'wearables', name: 'Wearables', emoji: '⌚' },
    { id: 'smart_home', name: 'Smart Home', emoji: '🏠' }
  ];
  
  return (
    <Layout>
      <Head>
        <title>ARIA Tech - UK's Most Trusted Tech Reviews | AI-Reviewed.com</title>
        <meta 
          name="description" 
          content="Stop wasting money on tech that disappoints. ARIA analyzes thousands of reviews to bring you honest UK tech buying advice. Real prices from Currys, Argos & more." 
        />
        <meta property="og:title" content="ARIA Tech - UK's Most Trusted Tech Reviews" />
        <meta property="og:description" content="Stop wasting money on tech that disappoints. Real UK prices, Brexit warnings & honest reviews." />
        <meta property="og:image" content="/aria-og-image.png" />
        <meta property="og:url" content="https://ai-reviewed.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://ai-reviewed.com" />
      </Head>
      
      {/* Hero Section */}
      <HeroSection stats={stats} />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Feed - 3 columns */}
          <div className="lg:col-span-3">
            
            {/* Category Filter */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Latest Tech Analysis</h2>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-aria-secondary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="mr-1">{cat.emoji}</span>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Articles Grid */}
            {articlesError ? (
              <div className="text-center py-12">
                <p className="text-red-600">Bloody hell, something went wrong loading articles!</p>
              </div>
            ) : !articles.length ? (
              <div className="text-center py-12">
                <div className="animate-pulse">
                  <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {filteredArticles.slice(0, 6).map((article) => (
                    <ArticleCard key={article.id} article={article} featured={false} />
                  ))}
                </div>
                
                {filteredArticles.length > 6 && (
                  <>
                    {/* Newsletter CTA */}
                    <Newsletter />
                    
                    {/* More Articles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                      {filteredArticles.slice(6).map((article) => (
                        <ArticleCard key={article.id} article={article} featured={false} />
                      ))}
                    </div>
                  </>
                )}
                
                {filteredArticles.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No articles in this category yet. Check back soon!</p>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Sidebar - 1 column */}
          <div className="lg:col-span-1">
            
            {/* Trending Topics */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">🔥 Trending Now</h3>
              <TrendingTopics topics={topics} />
            </div>
            
            {/* ARIA's Promise */}
            <div className="bg-aria-primary text-white p-6 rounded-lg mb-8">
              <h3 className="text-lg font-bold mb-3">ARIA's Promise</h3>
              <p className="text-sm mb-4">
                I get the same tiny commission whether you buy from Currys or Amazon UK. 
                My job is stopping you from wasting money, not pushing expensive options.
              </p>
              <ul className="text-sm space-y-2">
                <li>✅ Real UK prices updated hourly</li>
                <li>✅ Brexit import warnings</li>
                <li>✅ Honest verdicts, no BS</li>
                <li>✅ 127,000+ UK buyers trust me</li>
              </ul>
            </div>
            
            {/* Source Performance */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📰 My Sources</h3>
              <SourcesList />
            </div>
            
            {/* Quick Stats */}
            {stats.articles && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📊 System Stats</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Articles Published</span>
                    <span className="font-semibold">{stats.articles.total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Today's Articles</span>
                    <span className="font-semibold">{stats.articles.publishedToday || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Sources</span>
                    <span className="font-semibold">{stats.sources?.active || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Topics Tracking</span>
                    <span className="font-semibold">{stats.topics?.trending || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer CTA */}
      <div className="bg-aria-secondary text-white py-12">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">
            Never Waste Money on Disappointing Tech Again
          </h2>
          <p className="text-xl mb-8">
            Join 127,000+ UK buyers getting honest tech advice from ARIA
          </p>
          <Link 
            href="/newsletter"
            className="inline-block bg-white text-aria-secondary px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition"
          >
            Get Daily Tech Insights →
          </Link>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </Layout>
  );
}