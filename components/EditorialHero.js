import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function EditorialHero() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <article className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="relative aspect-[16/10] bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-4 left-4 text-white">
            <span className="text-sm font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded">
              Featured Review
            </span>
          </div>
        </div>
        
        <div className="space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Featured Review
          </span>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            iPhone 15 Pro Max: The Best Phone Nobody Should Buy
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>By Sarah Chen</span>
            <span>•</span>
            <span>Updated 2 June 2025</span>
          </div>
          <p className="text-lg text-gray-600 leading-relaxed">
            After 3 weeks of testing, I can tell you exactly why Apple's £1,199 flagship is technically brilliant but financially bonkers for most UK buyers.
          </p>
          <Link 
            href="/article/iphone-15-pro-max-review"
            className="inline-flex items-center text-blue-600 font-medium hover:gap-3 transition-all gap-2"
          >
            Read the full review <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </article>
    </section>
  );
}