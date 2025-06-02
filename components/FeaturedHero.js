import Link from 'next/link';

export default function FeaturedHero() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <article className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="relative aspect-[16/10] bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg overflow-hidden">
          <span className="absolute top-4 left-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded text-xs font-semibold uppercase">
            Updated Today
          </span>
          <img 
            src="https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&h=500&fit=crop" 
            alt="AI code assistants comparison"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="space-y-4">
          <span className="text-blue-600 dark:text-blue-400 font-semibold uppercase text-xs tracking-wider">
            Featured Review
          </span>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
            The Best AI Code Assistants of 2025
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                <img src="https://i.pravatar.cc/150?img=16" alt="Sarah Chen" className="w-full h-full object-cover" />
              </div>
              <span>By Sarah Chen</span>
            </div>
            <span>•</span>
            <span>Updated June 2, 2025</span>
            <span>•</span>
            <span>47 min read</span>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            After 200 hours of testing with real development projects, we've identified the AI coding tools that actually improve productivity—and the ones that just get in the way.
          </p>
          <div className="flex gap-8 py-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">23</div>
              <div className="text-xs uppercase text-gray-500 dark:text-gray-500">Tools Tested</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">200+</div>
              <div className="text-xs uppercase text-gray-500 dark:text-gray-500">Hours Testing</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">5</div>
              <div className="text-xs uppercase text-gray-500 dark:text-gray-500">Winners</div>
            </div>
          </div>
          <Link 
            href="/article/best-ai-code-assistants-2025"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium hover:gap-3 transition-all gap-2"
          >
            Read the full review →
          </Link>
        </div>
      </article>
    </section>
  );
}