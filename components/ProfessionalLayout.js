import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function ProfessionalLayout({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [savedCount, setSavedCount] = useState(3);
  const router = useRouter();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setIsDarkMode(savedTheme === 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <a href="#main" className="skip-to-content">Skip to main content</a>
      
      {/* Announcement Bar */}
      <div className="bg-blue-600 text-white py-2 text-center text-sm">
        🎉 New: Our 2025 Best AI Tools guide is here! <Link href="/guides/best-ai-tools-2025" className="underline">Read it now →</Link>
      </div>

      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-baseline gap-2">
                  <Link href="/" className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    AI-Reviewed
                  </Link>
                  <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400 italic">Est. 2020</span>
                </div>
                <p className="hidden sm:block text-sm text-gray-600 dark:text-gray-400 italic">Independent tech reviews you can trust</p>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Search */}
                <div className="hidden lg:block relative">
                  <input 
                    type="search" 
                    placeholder="Search reviews..." 
                    className="w-64 xl:w-80 px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <button className="absolute right-3 top-2.5 text-gray-400">
                    🔍
                  </button>
                </div>
                
                {/* Saved Articles */}
                <button className="relative p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <span>📑</span>
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
                    {savedCount}
                  </span>
                </button>
                
                {/* Theme Toggle */}
                <button 
                  onClick={toggleTheme}
                  className="p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  🌓
                </button>
                
                {/* User Menu */}
                <div className="relative">
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="w-9 h-9 rounded-full overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
                  >
                    <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                      J
                    </div>
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="font-semibold text-gray-900 dark:text-white">John Doe</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Premium Member</div>
                      </div>
                      <div className="py-2">
                        <Link href="/my-reviews" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                          My Reviews
                        </Link>
                        <Link href="/saved" className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                          Saved Articles
                          <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">3</span>
                        </Link>
                        <Link href="/alerts" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                          Price Alerts
                        </Link>
                        <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                          Settings
                        </Link>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                        <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className={`flex gap-8 items-center ${isMobileMenuOpen ? 'flex-col absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 shadow-md' : 'hidden md:flex'}`}>
              <Link href="/" className={`font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 ${router.pathname === '/' ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                All Reviews
              </Link>
              <Link href="/best-ai-tools" className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                Best AI Tools
              </Link>
              <Link href="/software" className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                Software
              </Link>
              <Link href="/hardware" className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                Hardware
              </Link>
              <Link href="/guides" className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                Guides
              </Link>
              <Link href="/methodology" className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                Methodology
              </Link>
              <Link href="/about" className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                About
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/subscribe" className="bg-blue-600 text-white px-5 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors">
                Subscribe
              </Link>
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-2xl text-gray-900 dark:text-white"
              >
                {isMobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {children}

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-12 pb-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-70">Categories</h3>
              <ul className="space-y-2">
                <li><Link href="/ai-ml" className="text-sm opacity-80 hover:opacity-100">AI & Machine Learning</Link></li>
                <li><Link href="/developer-tools" className="text-sm opacity-80 hover:opacity-100">Developer Tools</Link></li>
                <li><Link href="/productivity" className="text-sm opacity-80 hover:opacity-100">Productivity Software</Link></li>
                <li><Link href="/security" className="text-sm opacity-80 hover:opacity-100">Security & Privacy</Link></li>
                <li><Link href="/cloud" className="text-sm opacity-80 hover:opacity-100">Cloud Services</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-70">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-sm opacity-80 hover:opacity-100">About Us</Link></li>
                <li><Link href="/methodology" className="text-sm opacity-80 hover:opacity-100">How We Test</Link></li>
                <li><Link href="/guidelines" className="text-sm opacity-80 hover:opacity-100">Editorial Guidelines</Link></li>
                <li><Link href="/careers" className="text-sm opacity-80 hover:opacity-100">Careers</Link></li>
                <li><Link href="/press" className="text-sm opacity-80 hover:opacity-100">Press Kit</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-70">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="/guides" className="text-sm opacity-80 hover:opacity-100">Buying Guides</Link></li>
                <li><Link href="/glossary" className="text-sm opacity-80 hover:opacity-100">Tech Glossary</Link></li>
                <li><Link href="/price-tracker" className="text-sm opacity-80 hover:opacity-100">Price Tracker</Link></li>
                <li><Link href="/deals" className="text-sm opacity-80 hover:opacity-100">Deals & Discounts</Link></li>
                <li><Link href="/api" className="text-sm opacity-80 hover:opacity-100">API Access</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-70">Connect</h3>
              <ul className="space-y-2">
                <li><Link href="/newsletter" className="text-sm opacity-80 hover:opacity-100">Newsletter</Link></li>
                <li><Link href="/podcast" className="text-sm opacity-80 hover:opacity-100">Podcast</Link></li>
                <li><Link href="/rss" className="text-sm opacity-80 hover:opacity-100">RSS Feed</Link></li>
                <li><Link href="/contact" className="text-sm opacity-80 hover:opacity-100">Contact Support</Link></li>
              </ul>
              <div className="flex gap-3 mt-4">
                <a href="#" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">𝕏</a>
                <a href="#" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">in</a>
                <a href="#" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">▶</a>
                <a href="#" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">📷</a>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm opacity-70">
            <p>© 2025 AI-Reviewed. All rights reserved. AI-Reviewed is supported by its audience. When you purchase through links on our site, we may earn an affiliate commission.</p>
            <div className="flex gap-4">
              <span className="bg-white/10 px-3 py-1 rounded text-xs">SOC 2 Certified</span>
              <span className="bg-white/10 px-3 py-1 rounded text-xs">GDPR Compliant</span>
              <span className="bg-white/10 px-3 py-1 rounded text-xs">Member: Tech Reviews Alliance</span>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Comparison Tool */}
      <div className="fixed bottom-8 right-8 bg-blue-600 text-white px-6 py-4 rounded-full shadow-lg cursor-pointer flex items-center gap-2 font-medium hover:transform hover:-translate-y-1 transition-all z-40">
        <span>⚖️ Compare Products</span>
        <span className="bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">2</span>
      </div>
      
      {/* Click outside handlers */}
      {(isUserMenuOpen || isMobileMenuOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setIsUserMenuOpen(false);
            setIsMobileMenuOpen(false);
          }}
        />
      )}
    </div>
  );
}