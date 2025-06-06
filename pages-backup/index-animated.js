import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import useSWR from 'swr';
import ModernLayout from '../components/ModernLayout';
import ModernHeroSection from '../components/ModernHeroSection';
import ModernArticleCard, { ArticleCardSkeleton } from '../components/ModernArticleCard';
import { Filter, TrendingUp, Sparkles } from 'lucide-react';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ModernHome() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: articles, error: articlesError } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/articles/published?limit=12`,
    fetcher,
    { refreshInterval: 60000 }
  );

  const { data: trending, error: trendingError } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/topics/trending?limit=5`,
    fetcher
  );

  const categories = [
    { id: 'all', name: 'All Tech', icon: '🔍' },
    { id: 'smartphones', name: 'Smartphones', icon: '📱' },
    { id: 'laptops', name: 'Laptops', icon: '💻' },
    { id: 'audio', name: 'Audio', icon: '🎧' },
    { id: 'gaming', name: 'Gaming', icon: '🎮' },
    { id: 'wearables', name: 'Wearables', icon: '⌚' },
    { id: 'smart-home', name: 'Smart Home', icon: '🏠' }
  ];

  // Filter articles by category
  const filteredArticles = articles?.filter(article => 
    selectedCategory === 'all' || article.category === selectedCategory
  );

  return (
    <ModernLayout>
      <Head>
        <title>ARIA Tech - UK's Most Trusted AI-Powered Tech Reviews | AI-Reviewed.com</title>
        <meta name="description" content="Stop wasting money on tech that disappoints. ARIA analyzes thousands of reviews to bring you honest UK tech buying advice. Real prices from Currys, Argos & more." />
      </Head>

      <ModernHeroSection />

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Latest Tech Analysis
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            AI-powered insights from analyzing thousands of reviews across the UK tech landscape
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all flex items-center space-x-2 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-xl">{category.icon}</span>
                <span>{category.name}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {articlesError ? (
            <div className="col-span-full text-center py-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-block"
              >
                <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-6 mb-4">
                  <Sparkles className="w-12 h-12 text-red-500 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Oops! Something went wrong
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We're having trouble loading the latest tech reviews. Please try again later.
                </p>
              </motion.div>
            </div>
          ) : !articles ? (
            // Loading Skeletons
            [...Array(6)].map((_, i) => <ArticleCardSkeleton key={i} index={i} />)
          ) : filteredArticles?.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {filteredArticles.map((article, index) => (
                <ModernArticleCard key={article.id} article={article} index={index} />
              ))}
            </AnimatePresence>
          ) : (
            <div className="col-span-full text-center py-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-block"
              >
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-full p-6 mb-4">
                  <Filter className="w-12 h-12 text-purple-500 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No articles in this category yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Check back soon or explore other categories
                </p>
              </motion.div>
            </div>
          )}
        </div>

        {/* Trending Topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 md:p-12"
        >
          <div className="flex items-center justify-center mb-8">
            <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3" />
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Trending in UK Tech
            </h3>
          </div>
          
          {trendingError || !trending ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-white/50 dark:bg-gray-800/50 rounded-2xl" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trending.slice(0, 3).map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {topic.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {topic.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                      {topic.article_count} articles
                    </span>
                    <div className="flex -space-x-2">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full border-2 border-white dark:border-gray-800"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Never Waste Money on Disappointing Tech Again
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join 127,000+ UK buyers getting honest tech advice from ARIA
            </p>
            <div className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 rounded-full bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-purple-600 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                >
                  Get Updates
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </ModernLayout>
  );
}