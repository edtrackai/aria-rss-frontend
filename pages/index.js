import { useState } from 'react';
import Head from 'next/head';
import EditorialLayout from '../components/EditorialLayout';
import EditorialHero from '../components/EditorialHero';
import EditorialArticleCard from '../components/EditorialArticleCard';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

// Demo data
const articles = [
  {
    id: '1',
    title: 'Samsung Galaxy S24 Ultra Review: Android Perfection at a Price',
    slug: 'samsung-galaxy-s24-ultra-review',
    excerpt: 'Samsung\'s latest flagship nails almost everything, but at £1,249, it\'s asking UK buyers to dig deep. We tested it for a month to see if it\'s worth it.',
    category: 'smartphones',
    author: 'Michael Torres',
    verdict: 'BEST OVERALL',
    published_date: new Date().toISOString()
  },
  {
    id: '2',
    title: 'MacBook Air M3 vs Dell XPS 13: The Ultimate Ultrabook Battle',
    slug: 'macbook-air-m3-vs-dell-xps-13',
    excerpt: 'We put the two best ultrabooks through real-world tests. The winner might surprise you, especially when you factor in UK pricing.',
    category: 'laptops',
    author: 'Alex Kim',
    verdict: 'RECOMMENDED',
    published_date: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Sony WH-1000XM5: Still the Noise-Cancelling King?',
    slug: 'sony-wh-1000xm5-review',
    excerpt: 'After Bose\'s latest challenge, we retested Sony\'s flagship headphones. Here\'s whether they\'re still worth £380.',
    category: 'audio',
    author: 'Emma Davis',
    verdict: 'RECOMMENDED',
    published_date: new Date().toISOString()
  },
  {
    id: '4',
    title: 'PS5 Pro: Don\'t Buy It (Yet)',
    slug: 'ps5-pro-review',
    excerpt: 'Sony\'s mid-gen refresh costs £700 in the UK. We explain why patience will save you hundreds.',
    category: 'gaming',
    author: 'James Wilson',
    verdict: 'AVOID',
    published_date: new Date().toISOString()
  },
  {
    id: '5',
    title: 'Best Budget Smartphones Under £300: 2025 Edition',
    slug: 'best-budget-phones-2025',
    excerpt: 'We tested 15 budget phones to find the ones that don\'t feel cheap. Our top pick costs just £249.',
    category: 'smartphones',
    author: 'Rachel Green',
    verdict: 'GOOD VALUE',
    published_date: new Date().toISOString()
  }
];

const trending = [
  {
    title: 'Apple Vision Pro UK Launch: Everything You Need to Know',
    category: 'Wearables',
    slug: 'apple-vision-pro-uk-launch'
  },
  {
    title: 'The Complete Guide to Black Friday Tech Deals',
    category: 'Guides',
    slug: 'black-friday-tech-guide-2025'
  },
  {
    title: 'Best Mesh WiFi Systems for UK Homes',
    category: 'Smart Home',
    slug: 'best-mesh-wifi-uk'
  },
  {
    title: 'Steam Deck OLED Long-Term Review',
    category: 'Gaming',
    slug: 'steam-deck-oled-review'
  },
  {
    title: 'Why I Switched from iPhone to Android (And Back)',
    category: 'Opinion',
    slug: 'iphone-to-android-switch'
  }
];

export default function EditorialHome() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setEmail('');
    }, 3000);
  };

  return (
    <EditorialLayout>
      <Head>
        <title>AI-Reviewed | UK Tech Reviews That Actually Tell the Truth</title>
        <meta name="description" content="Independent tech reviews by UK experts. We buy everything we test, accept no free products, and tell you exactly what's worth your money." />
      </Head>

      <EditorialHero />

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Article List */}
          <div className="lg:col-span-2 space-y-6">
            {articles.map((article) => (
              <EditorialArticleCard key={article.id} article={article} />
            ))}
            
            {/* Load More */}
            <div className="text-center pt-8">
              <button className="px-8 py-3 bg-white border-2 border-gray-900 text-gray-900 font-semibold rounded hover:bg-gray-900 hover:text-white transition-colors">
                Load More Reviews
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Trending */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-4">
                Trending Now
              </h3>
              <ul className="space-y-4">
                {trending.map((item, index) => (
                  <li key={index} className="pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                    <Link href={`/article/${item.slug}`} className="group">
                      <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                        {item.title}
                      </h4>
                      <span className="text-xs text-gray-500 mt-1">{item.category}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                Get Our Best Reviews
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Weekly digest of our most helpful tech reviews and buying guides.
              </p>
              <form onSubmit={handleSubscribe} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  className={`w-full py-2 rounded-md text-sm font-medium transition-colors ${
                    subscribed 
                      ? 'bg-green-600 text-white' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {subscribed ? '✓ Subscribed!' : 'Subscribe Free'}
                </button>
              </form>
            </div>

            {/* About */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                Why Trust Us
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                We spend hundreds of hours testing tech so you don't have to. We buy everything with our own money and never accept free products from manufacturers.
              </p>
              <Link href="/about" className="text-sm text-blue-600 font-medium mt-3 inline-flex items-center hover:gap-2 gap-1 transition-all">
                Learn more <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-900 mb-4">
                ARIA's Promise
              </h3>
              <ul className="space-y-2 text-sm text-blue-900">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> 127,000+ UK readers trust us
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Real UK prices, updated daily
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> No sponsored content ever
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Brexit import warnings included
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* Newsletter CTA Section */}
      <section className="bg-gray-900 text-white py-16 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Stop Wasting Money on Tech That Disappoints
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Join 127,000+ UK buyers getting honest tech advice every week
          </p>
          <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-md hover:bg-gray-100 transition-colors"
            >
              Get Updates
            </button>
          </form>
        </div>
      </section>
    </EditorialLayout>
  );
}