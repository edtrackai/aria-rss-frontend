import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function ProfessionalArticleCard({ article }) {
  const [isSaved, setIsSaved] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  
  const verdictStyles = {
    'BEST OVERALL': 'bg-green-600 text-white',
    'EDITOR\'S CHOICE': 'bg-green-600 text-white',
    'RECOMMENDED': 'bg-blue-600 text-white',
    'GOOD VALUE': 'bg-orange-600 text-white',
    'AVOID': 'bg-red-600 text-white'
  };
  
  const handleSave = () => {
    setIsSaved(!isSaved);
    // In real app, this would update the saved count in parent
  };
  
  const handleShare = (type) => {
    const url = window.location.href;
    const title = article.title;
    
    switch(type) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        break;
    }
    setIsShareOpen(false);
  };
  
  return (
    <article className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
        {/* Image */}
        <div className="relative aspect-[4/3] lg:aspect-auto bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 overflow-hidden">
          {article.image ? (
            <img 
              src={article.image} 
              alt={article.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full" />
          )}
          {article.price && (
            <span className="absolute bottom-4 left-4 bg-black/80 text-white px-3 py-1 rounded text-sm font-semibold">
              {article.price}
            </span>
          )}
        </div>
        
        {/* Content */}
        <div className="p-6 flex flex-col">
          <div className="mb-3">
            <Link 
              href={`/category/${article.category}`}
              className="text-blue-600 dark:text-blue-400 font-semibold uppercase text-xs tracking-wider hover:text-blue-700 dark:hover:text-blue-300"
            >
              {article.category}
            </Link>
            <Link href={`/article/${article.slug}`}>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {article.title}
              </h3>
            </Link>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
            {article.excerpt}
          </p>
          
          {/* Quick Verdict */}
          {article.quickVerdict && (
            <div className="bg-gray-50 dark:bg-gray-700/50 border-l-4 border-blue-600 p-4 mb-4 rounded-r">
              <div className="text-blue-600 dark:text-blue-400 font-semibold text-xs uppercase tracking-wider mb-2">
                Quick Take
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <h5 className="text-gray-500 dark:text-gray-400 text-xs mb-1">Pros:</h5>
                  {article.quickVerdict.pros.map((pro, i) => (
                    <div key={i} className="text-green-600 dark:text-green-400">✓ {pro}</div>
                  ))}
                </div>
                <div>
                  <h5 className="text-gray-500 dark:text-gray-400 text-xs mb-1">Cons:</h5>
                  {article.quickVerdict.cons.map((con, i) => (
                    <div key={i} className="text-red-600 dark:text-red-400">✗ {con}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Meta */}
          <div className="mt-auto flex items-center justify-between flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full" />
              <span>{article.author || 'AI-Reviewed Team'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Save Button */}
              <button
                onClick={handleSave}
                className={`flex items-center gap-1 px-3 py-1.5 border rounded text-xs font-medium transition-all ${
                  isSaved 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <span className={isSaved ? 'animate-bounce' : ''}>🔖</span>
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
              
              {/* Share Button */}
              <div className="relative">
                <button
                  onClick={() => setIsShareOpen(!isShareOpen)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  📤
                </button>
                
                {isShareOpen && (
                  <div className="absolute bottom-full right-0 mb-2 flex gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-lg z-10">
                    <button 
                      onClick={() => handleShare('twitter')}
                      className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      title="Share on Twitter"
                    >
                      𝕏
                    </button>
                    <button 
                      onClick={() => handleShare('linkedin')}
                      className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      title="Share on LinkedIn"
                    >
                      in
                    </button>
                    <button 
                      onClick={() => handleShare('facebook')}
                      className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      title="Share on Facebook"
                    >
                      f
                    </button>
                    <button 
                      onClick={() => handleShare('email')}
                      className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      title="Share via Email"
                    >
                      ✉
                    </button>
                    <button 
                      onClick={() => handleShare('copy')}
                      className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      title="Copy Link"
                    >
                      🔗
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Rating */}
            {article.rating && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★★★★★</span>
                <span>{article.rating}/5</span>
              </div>
            )}
            
            {/* Verdict Badge */}
            {article.verdict && (
              <span className={`px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider ${verdictStyles[article.verdict] || 'bg-gray-600 text-white'}`}>
                {article.verdict}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}