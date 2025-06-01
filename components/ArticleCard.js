import Link from 'next/link';
import { format } from 'date-fns';

export default function ArticleCard({ article, featured = false }) {
  const categoryEmoji = {
    smartphones: '📱',
    laptops: '💻',
    audio: '🎧',
    gaming: '🎮',
    wearables: '⌚',
    smart_home: '🏠',
    general: '🔍'
  };
  
  const emoji = categoryEmoji[article.category] || '📰';
  
  return (
    <article className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow ${featured ? 'col-span-2' : ''}`}>
      <Link href={`/article/${article.slug}`} className="block">
        {/* Image placeholder - in production, use actual featured images */}
        <div className={`bg-gradient-to-br from-aria-primary to-aria-secondary ${featured ? 'h-64' : 'h-48'} rounded-t-lg flex items-center justify-center`}>
          <span className="text-6xl">{emoji}</span>
        </div>
        
        <div className="p-6">
          {/* Category & Date */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span className="capitalize">{article.category.replace('_', ' ')}</span>
            <time dateTime={article.published_date}>
              {format(new Date(article.published_date), 'dd MMM yyyy')}
            </time>
          </div>
          
          {/* Title */}
          <h3 className={`font-bold text-gray-900 mb-2 hover:text-aria-secondary transition-colors ${featured ? 'text-2xl' : 'text-xl'}`}>
            {article.title}
          </h3>
          
          {/* Excerpt */}
          <p className="text-gray-600 mb-4 line-clamp-3">
            {article.excerpt}
          </p>
          
          {/* Meta info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              {article.rating && (
                <span className="flex items-center">
                  <span className="text-aria-accent mr-1">★</span>
                  {article.rating}/5
                </span>
              )}
              {article.view_count > 0 && (
                <span>{article.view_count.toLocaleString()} views</span>
              )}
            </div>
            
            <span className="text-aria-secondary font-medium text-sm">
              Read more →
            </span>
          </div>
          
          {/* UK Price indicator if available */}
          {article.uk_prices && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-600">
                From £{Math.min(...Object.values(article.uk_prices).filter(p => p > 0))} at UK retailers
              </span>
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}