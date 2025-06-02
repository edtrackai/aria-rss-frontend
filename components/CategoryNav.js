import { useState, useRef } from 'react';
import Link from 'next/link';

const categories = [
  { name: 'All Categories', slug: 'all', count: 247 },
  { name: 'AI Language Models', slug: 'ai-language-models', count: 32 },
  { name: 'Developer Tools', slug: 'developer-tools', count: 45 },
  { name: 'Productivity Software', slug: 'productivity', count: 38 },
  { name: 'Security Tools', slug: 'security', count: 29 },
  { name: 'Cloud Services', slug: 'cloud', count: 41 },
  { name: 'Mobile Apps', slug: 'mobile', count: 35 },
  { name: 'Smart Home', slug: 'smart-home', count: 27 },
];

export default function CategoryNav({ activeCategory = 'all' }) {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
    containerRef.current.style.cursor = 'grabbing';
  };
  
  const handleMouseLeave = () => {
    setIsDragging(false);
    containerRef.current.style.cursor = 'grab';
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    containerRef.current.style.cursor = 'grab';
  };
  
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };
  
  return (
    <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-[73px] z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div 
          ref={containerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide cursor-grab"
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={category.slug === 'all' ? '/' : `/category/${category.slug}`}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap text-sm font-medium transition-all
                ${activeCategory === category.slug 
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-blue-600 hover:text-white hover:border-blue-600'}
              `}
            >
              {category.name}
              <span className={`
                px-2 py-0.5 rounded-full text-xs
                ${activeCategory === category.slug 
                  ? 'bg-white/20 dark:bg-gray-900/20' 
                  : 'bg-gray-100 dark:bg-gray-600'}
              `}>
                {category.count}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}