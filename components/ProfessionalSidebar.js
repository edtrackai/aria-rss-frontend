import { useState } from 'react';
import Link from 'next/link';

export default function ProfessionalSidebar() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPriceAlertSet, setIsPriceAlertSet] = useState(false);
  
  const handleSubscribe = (e) => {
    e.preventDefault();
    setIsSubscribed(true);
    setTimeout(() => {
      setIsSubscribed(false);
      setEmail('');
    }, 3000);
  };
  
  const handlePriceAlert = () => {
    setIsPriceAlertSet(true);
    setTimeout(() => {
      setIsPriceAlertSet(false);
    }, 2000);
  };
  
  const trendingItems = [
    {
      title: 'Apple Vision Pro 2 Review: Finally Worth It?',
      category: 'Hardware',
      comments: 234,
      image: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=100&h=100&fit=crop'
    },
    {
      title: 'The Complete Guide to Prompt Engineering',
      category: 'Guides',
      comments: 189,
      gradient: 'from-teal-300 to-pink-300'
    },
    {
      title: 'Midjourney 6 vs DALL-E 3: Image Face-Off',
      category: 'AI Tools',
      comments: 156,
      gradient: 'from-orange-200 to-red-400'
    }
  ];
  
  return (
    <aside className="space-y-6">
      {/* Why Trust Us */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-4">
          Why Trust Us
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-green-600 text-lg flex-shrink-0">✓</span>
            <p className="text-sm text-gray-600 dark:text-gray-400">We buy all products with our own funds</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-600 text-lg flex-shrink-0">✓</span>
            <p className="text-sm text-gray-600 dark:text-gray-400">200+ hours average testing per category</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-600 text-lg flex-shrink-0">✓</span>
            <p className="text-sm text-gray-600 dark:text-gray-400">No sponsored content or paid placements</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-600 text-lg flex-shrink-0">✓</span>
            <p className="text-sm text-gray-600 dark:text-gray-400">Expert reviewers with 10+ years experience</p>
          </div>
        </div>
        <Link href="/methodology" className="text-blue-600 dark:text-blue-400 text-sm font-medium mt-4 inline-block hover:underline">
          Read our methodology →
        </Link>
      </div>
      
      {/* Price Alert */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💰</span>
            <strong className="text-gray-900 dark:text-white">Track Price Drops</strong>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Average savings: $127/year</p>
          <button 
            onClick={handlePriceAlert}
            className={`w-full py-2 rounded-md text-sm font-medium transition-all ${
              isPriceAlertSet 
                ? 'bg-green-600 text-white' 
                : 'bg-yellow-400 text-gray-900 hover:bg-yellow-500'
            }`}
          >
            {isPriceAlertSet ? '✓ Alert Set!' : 'Set Price Alerts'}
          </button>
        </div>
      </div>
      
      {/* Trending Reviews */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-4">
          Trending Now
        </h3>
        <ul className="space-y-4">
          {trendingItems.map((item, index) => (
            <li key={index} className={`pb-4 ${index < trendingItems.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Link href="#" className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm leading-snug">
                    {item.title}
                  </Link>
                  <div className="flex gap-2 mt-1 text-xs text-gray-500 dark:text-gray-500">
                    <span>{item.category}</span>
                    <span>•</span>
                    <span>{item.comments} comments</span>
                  </div>
                </div>
                <div className="w-15 h-15 rounded flex-shrink-0 overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${item.gradient}`} />
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Newsletter Signup */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
          Get Our Best Reviews
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Weekly digest of our most helpful tech reviews and buying guides.
        </p>
        <form onSubmit={handleSubscribe} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button
            type="submit"
            className={`w-full py-2 rounded-md text-sm font-medium transition-all ${
              isSubscribed 
                ? 'bg-green-600 text-white' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubscribed ? '✓ Subscribed!' : 'Subscribe Free'}
          </button>
        </form>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-3 leading-relaxed">
          No spam. Unsubscribe anytime. By subscribing, you agree to our <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</Link>.
        </p>
      </div>
    </aside>
  );
}