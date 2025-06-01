import Link from 'next/link';
import { format } from 'date-fns';

export default function RelatedArticles({ articles, currentArticleId }) {
  const filteredArticles = articles.filter(a => a.id !== currentArticleId).slice(0, 3);
  
  if (filteredArticles.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-12 pt-8 border-t">
      <h3 className="text-2xl font-bold mb-6">Related Articles</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredArticles.map(article => (
          <Link 
            key={article.id} 
            href={`/article/${article.slug}`}
            className="group"
          >
            <article className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition">
              <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-aria-secondary transition">
                {article.title}
              </h4>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {article.excerpt}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="capitalize">{article.category.replace('_', ' ')}</span>
                <time dateTime={article.published_date}>
                  {format(new Date(article.published_date), 'dd MMM')}
                </time>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}