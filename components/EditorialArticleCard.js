import Link from 'next/link';
import { format } from 'date-fns';

export default function EditorialArticleCard({ article }) {
  const verdictStyles = {
    'BEST OVERALL': 'bg-green-600 text-white',
    'RECOMMENDED': 'bg-blue-600 text-white',
    'GOOD VALUE': 'bg-orange-600 text-white',
    'AVOID': 'bg-red-600 text-white'
  };

  return (
    <article className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow group">
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr]">
        <div className="aspect-[4/3] bg-gradient-to-br from-purple-400 to-pink-400 relative overflow-hidden">
          {article.image && (
            <img 
              src={article.image} 
              alt={article.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        
        <div className="p-6 flex flex-col">
          <div className="flex-1">
            <Link 
              href={`/category/${article.category}`}
              className="text-xs font-semibold uppercase tracking-wider text-blue-600 hover:text-blue-700"
            >
              {article.category}
            </Link>
            
            <Link href={`/article/${article.slug}`}>
              <h3 className="text-xl font-semibold text-gray-900 mt-2 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                {article.title}
              </h3>
            </Link>
            
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              {article.excerpt}
            </p>
          </div>
          
          <div className="flex items-center justify-between mt-auto pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-300 rounded-full" />
                <span>{article.author || 'ARIA Team'}</span>
              </div>
            </div>
            
            {article.verdict && (
              <span className={`text-xs font-semibold uppercase px-3 py-1 rounded ${verdictStyles[article.verdict] || 'bg-gray-600 text-white'}`}>
                {article.verdict}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}