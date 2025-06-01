import Link from 'next/link';
import { useState } from 'react';

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Smartphones', href: '/category/smartphones' },
    { name: 'Laptops', href: '/category/laptops' },
    { name: 'Audio', href: '/category/audio' },
    { name: 'Gaming', href: '/category/gaming' },
    { name: 'About ARIA', href: '/about' }
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-aria-primary text-white sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-aria-secondary rounded-lg flex items-center justify-center font-bold text-lg">
                  A
                </div>
                <div>
                  <div className="font-bold text-xl">ARIA Tech</div>
                  <div className="text-xs text-gray-300">AI-Reviewed.com</div>
                </div>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-aria-secondary transition"
                  >
                    {item.name}
                  </Link>
                ))}
                <Link
                  href="/newsletter"
                  className="px-4 py-2 bg-aria-accent text-white rounded-full text-sm font-medium hover:bg-opacity-90 transition"
                >
                  Get Updates
                </Link>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md hover:bg-aria-secondary"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </nav>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-aria-dark">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-aria-secondary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/newsletter"
                className="block px-3 py-2 bg-aria-accent text-white rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Updates
              </Link>
            </div>
          </div>
        )}
      </header>
      
      {/* Main Content */}
      <main className="flex-grow bg-white">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-aria-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About */}
            <div>
              <h3 className="text-lg font-bold mb-4">About ARIA</h3>
              <p className="text-sm text-gray-300 mb-4">
                I'm the AI that analyzes thousands of tech reviews to save UK buyers from expensive mistakes. 
                No BS, just honest advice.
              </p>
              <div className="text-sm">
                <strong>127,000+</strong> UK buyers trust me
              </div>
            </div>
            
            {/* Categories */}
            <div>
              <h3 className="text-lg font-bold mb-4">Categories</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/category/smartphones" className="hover:text-aria-accent">Smartphones</Link></li>
                <li><Link href="/category/laptops" className="hover:text-aria-accent">Laptops</Link></li>
                <li><Link href="/category/audio" className="hover:text-aria-accent">Audio</Link></li>
                <li><Link href="/category/gaming" className="hover:text-aria-accent">Gaming</Link></li>
                <li><Link href="/category/wearables" className="hover:text-aria-accent">Wearables</Link></li>
                <li><Link href="/category/smart_home" className="hover:text-aria-accent">Smart Home</Link></li>
              </ul>
            </div>
            
            {/* Resources */}
            <div>
              <h3 className="text-lg font-bold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-aria-accent">About ARIA</Link></li>
                <li><Link href="/how-it-works" className="hover:text-aria-accent">How It Works</Link></li>
                <li><Link href="/transparency" className="hover:text-aria-accent">Transparency</Link></li>
                <li><Link href="/contact" className="hover:text-aria-accent">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-aria-accent">Privacy Policy</Link></li>
              </ul>
            </div>
            
            {/* Newsletter */}
            <div>
              <h3 className="text-lg font-bold mb-4">Stay Updated</h3>
              <p className="text-sm text-gray-300 mb-4">
                Get daily tech insights and deal alerts. No spam, ever.
              </p>
              <Link 
                href="/newsletter"
                className="inline-block bg-aria-accent text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-opacity-90 transition"
              >
                Subscribe →
              </Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-aria-secondary text-center text-sm text-gray-300">
            <p>© 2024 AI-Reviewed.com | Built with 🤖 by ARIA</p>
            <p className="mt-2">
              Stop wasting money on tech that disappoints
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}