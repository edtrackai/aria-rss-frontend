import { motion } from 'framer-motion';
import { Calendar, Clock, TrendingUp, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function ModernArticleCard({ article, index = 0 }) {
  const categoryColors = {
    smartphones: 'from-blue-500 to-purple-500',
    laptops: 'from-green-500 to-teal-500',
    audio: 'from-orange-500 to-red-500',
    gaming: 'from-purple-500 to-pink-500',
    wearables: 'from-indigo-500 to-blue-500',
    'smart-home': 'from-yellow-500 to-orange-500'
  };

  const categoryIcons = {
    smartphones: '📱',
    laptops: '💻',
    audio: '🎧',
    gaming: '🎮',
    wearables: '⌚',
    'smart-home': '🏠'
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
    >
      {/* Gradient Border */}
      <div className={`absolute inset-0 bg-gradient-to-r ${categoryColors[article.category] || 'from-gray-500 to-gray-600'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
        <div className="absolute inset-[1px] bg-white dark:bg-gray-800 rounded-2xl" />
      </div>

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{categoryIcons[article.category] || '📄'}</span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {article.category}
            </span>
          </div>
          {article.trending && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center space-x-1 text-orange-500"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium">Trending</span>
            </motion.div>
          )}
        </div>

        {/* Title */}
        <Link href={`/article/${article.slug}`}>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
            {article.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {article.excerpt}
        </p>

        {/* Metadata */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(article.published_date), 'MMM d')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{article.reading_time || '5 min read'}</span>
            </div>
          </div>
          {article.price_drop && (
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
              Price Drop
            </span>
          )}
        </div>

        {/* Action */}
        <Link
          href={`/article/${article.slug}`}
          className="inline-flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors"
        >
          Read Analysis
          <ExternalLink className="ml-1 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </Link>

        {/* Hover Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </div>
    </motion.article>
  );
}

// Skeleton Loading Card
export function ArticleCardSkeleton({ index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
    >
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
      </div>
    </motion.div>
  );
}