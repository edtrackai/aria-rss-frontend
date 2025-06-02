import { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X } from 'lucide-react';

export default function EditorialLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { name: 'All Reviews', href: '/' },
    { name: 'Smartphones', href: '/category/smartphones' },
    { name: 'Laptops', href: '/category/laptops' },
    { name: 'Audio', href: '/category/audio' },
    { name: 'Gaming', href: '/category/gaming' },
    { name: 'Smart Home', href: '/category/smart-home' },
    { name: 'About', href: '/about' }
  ];

  const categories = [
    'All Categories',
    'Flagship Phones',
    'Budget Phones',
    'Gaming Laptops',
    'Ultrabooks',
    'Wireless Earbuds',
    'Smart Speakers',
    'Tablets',
    'Smartwatches'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/" className="text-3xl font-bold text-gray-900 tracking-tight">
                  AI-Reviewed
                </Link>
                <p className="text-sm text-gray-600 italic mt-1">
                  UK tech reviews that actually tell the truth
                </p>
              </div>
              <div className="hidden lg:flex items-center gap-4">
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Search reviews..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-80 px-4 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-gray-900 hover:text-blue-600 py-4 text-sm font-medium transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform" />
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/newsletter"
                className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Subscribe
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block text-gray-900 hover:text-blue-600 py-2 text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Category Pills */}
      <div className="bg-gray-50 border-b border-gray-200 sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {categories.map((category, index) => (
              <button
                key={category}
                className={`
                  px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
                  ${index === 0 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-600'
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
                Categories
              </h3>
              <ul className="space-y-2">
                {['Smartphones', 'Laptops', 'Audio', 'Gaming', 'Smart Home'].map((item) => (
                  <li key={item}>
                    <Link href={`/category/${item.toLowerCase()}`} className="text-gray-300 hover:text-white text-sm">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
                Company
              </h3>
              <ul className="space-y-2">
                {['About Us', 'How We Test', 'Editorial Guidelines', 'Contact'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-gray-300 hover:text-white text-sm">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
                Legal
              </h3>
              <ul className="space-y-2">
                {['Privacy Policy', 'Terms of Service', 'Affiliate Disclosure'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-gray-300 hover:text-white text-sm">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
                Connect
              </h3>
              <ul className="space-y-2">
                {['Newsletter', 'Twitter', 'RSS Feed'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-gray-300 hover:text-white text-sm">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-400">
              © 2025 AI-Reviewed.com | Built with integrity by UK tech enthusiasts
            </p>
            <p className="text-xs text-gray-500 mt-2">
              When you buy through our links, we may earn a commission. We test everything ourselves.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}