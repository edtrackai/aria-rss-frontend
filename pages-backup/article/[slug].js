import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { format } from 'date-fns';
import Layout from '../../components/Layout';
import Newsletter from '../../components/Newsletter';
import RelatedArticles from '../../components/RelatedArticles';
import PriceTable from '../../components/PriceTable';
import ShareButtons from '../../components/ShareButtons';

export default function Article({ article, related }) {
  const router = useRouter();
  
  if (router.isFallback) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!article) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-8">
            Blimey, can't find that article anywhere. It might have been moved or deleted.
          </p>
          <Link href="/" className="text-aria-secondary hover:underline">
            ← Back to homepage
          </Link>
        </div>
      </Layout>
    );
  }
  
  // Parse UK prices if available
  const ukPrices = article.uk_prices ? 
    (typeof article.uk_prices === 'string' ? JSON.parse(article.uk_prices) : article.uk_prices) : 
    null;
  
  // Parse schema markup if available
  const schemaMarkup = article.schema_markup ? 
    (typeof article.schema_markup === 'string' ? JSON.parse(article.schema_markup) : article.schema_markup) : 
    null;
  
  return (
    <Layout>
      <Head>
        <title>{article.seo_meta?.metaTitle || article.title} | ARIA Tech</title>
        <meta name="description" content={article.seo_meta?.metaDescription || article.excerpt} />
        <meta name="keywords" content={article.seo_meta?.keywords?.join(', ') || 'uk tech, reviews'} />
        
        {/* Open Graph */}
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://ai-reviewed.com/article/${article.slug}`} />
        <meta property="article:published_time" content={article.published_date} />
        <meta property="article:author" content="ARIA Tech" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.excerpt} />
        
        <link rel="canonical" href={`https://ai-reviewed.com/article/${article.slug}`} />
        
        {/* Schema Markup */}
        {schemaMarkup && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
          />
        )}
      </Head>
      
      <article className="max-w-4xl mx-auto px-4 py-8 lg:py-12">
        {/* Article Header */}
        <header className="mb-8">
          {/* Breadcrumbs */}
          <nav className="text-sm mb-4">
            <ol className="flex items-center space-x-2 text-gray-600">
              <li><Link href="/" className="hover:text-aria-secondary">Home</Link></li>
              <li>/</li>
              <li><Link href={`/category/${article.category}`} className="hover:text-aria-secondary capitalize">{article.category.replace('_', ' ')}</Link></li>
              <li>/</li>
              <li className="text-gray-900 font-medium">{article.title}</li>
            </ol>
          </nav>
          
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span>By ARIA</span>
            <span>•</span>
            <time dateTime={article.published_date}>
              {format(new Date(article.published_date), 'dd MMMM yyyy')}
            </time>
            <span>•</span>
            <span>{article.view_count || 0} views</span>
            {article.rating && (
              <>
                <span>•</span>
                <span className="flex items-center">
                  <span className="text-aria-accent mr-1">★</span>
                  {article.rating}/5
                </span>
              </>
            )}
          </div>
        </header>
        
        {/* Share Buttons */}
        <ShareButtons article={article} />
        
        {/* Brexit Warning if applicable */}
        {article.brexit_warning && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8">
            <h3 className="text-lg font-bold text-red-800 mb-2">
              ⚠️ Brexit Import Warning
            </h3>
            <p className="text-red-700">
              This product may be subject to import fees if bought from EU sellers. 
              Add 20% VAT plus £8-12 handling fee to any non-UK prices.
            </p>
          </div>
        )}
        
        {/* UK Price Comparison Table */}
        {ukPrices && <PriceTable prices={ukPrices} productName={article.product_name} />}
        
        {/* Main Content */}
        <div 
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
        
        {/* Sources */}
        {article.sources_json && article.sources_json.length > 0 && (
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h3 className="text-lg font-bold mb-4">📚 My Analysis Is Based On:</h3>
            <ul className="space-y-2">
              {article.sources_json.map((source, index) => (
                <li key={index}>
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="nofollow noopener"
                    className="text-aria-secondary hover:underline"
                  >
                    {source.name}
                  </a>
                  {source.quote && (
                    <span className="text-gray-600"> - "{source.quote}"</span>
                  )}
                </li>
              ))}
            </ul>
            <p className="text-sm text-gray-600 mt-4 italic">
              Full transparency: I get the same tiny commission regardless of which retailer you choose. 
              My job is helping you avoid expensive mistakes, not pushing you towards pricier options.
            </p>
          </div>
        )}
        
        {/* Newsletter CTA */}
        <Newsletter />
        
        {/* Related Articles */}
        {related && related.length > 0 && (
          <RelatedArticles articles={related} currentArticleId={article.id} />
        )}
        
        {/* Comments Section */}
        <div className="mt-12 pt-8 border-t">
          <h3 className="text-2xl font-bold mb-6">Questions? Comments?</h3>
          <p className="text-gray-600 mb-8">
            Drop them below - I personally read every single one. If you've found a better deal or spotted an error, let me know!
          </p>
          {/* You can integrate Disqus or another comment system here */}
          <div className="bg-gray-100 p-8 rounded-lg text-center text-gray-600">
            Comments loading...
          </div>
        </div>
      </article>
    </Layout>
  );
}

// Server-side data fetching
export async function getStaticProps({ params }) {
  try {
    // In production, fetch from WordPress API or database
    // For now, using mock data
    const article = {
      id: '1',
      slug: params.slug,
      title: 'iPhone 15 Pro Max Review: Worth the UK Price Premium?',
      excerpt: 'I\'ve analyzed 23 reviews to tell you if the iPhone 15 Pro Max is worth £1,199 at Currys. Spoiler: there\'s a cheaper option that\'s nearly as good.',
      content: `
        <h2>The Bottom Line Upfront</h2>
        <p>Here's the deal: The iPhone 15 Pro Max is brilliant, but at £1,199, it's taking the mick. Unless you absolutely need the telephoto camera and titanium build, the regular iPhone 15 at £799 does 90% of the same job.</p>
        
        <h2>UK Pricing Reality Check</h2>
        <p>Current UK prices vary quite a bit:</p>
        <ul>
          <li>Currys: £1,199 (includes 1-year warranty)</li>
          <li>John Lewis: £1,199 (but with 2-year warranty - worth it!)</li>
          <li>Amazon UK: £1,179 (often out of stock)</li>
          <li>Argos: £1,199 (reserve & collect available)</li>
        </ul>
        
        <h2>What The Reviews Actually Say</h2>
        <p>The Verge bangs on about the titanium build, and honestly, they're not wrong - it feels properly premium. But here's what matters for UK buyers...</p>
        
        <h2>The Stuff They Don't Tell You</h2>
        <p>That USB-C port? Brilliant. But you'll need new cables, and Apple's official ones are £35 each. The Action Button is nice, but most people just set it to silent mode anyway.</p>
        
        <h2>Who Should Actually Buy This</h2>
        <p><strong>Brilliant for:</strong> Professional photographers, content creators, and anyone upgrading from an iPhone 12 or older.</p>
        <p><strong>Rubbish for:</strong> Anyone with an iPhone 14 Pro - the upgrades are minimal.</p>
        <p><strong>Better alternative:</strong> iPhone 15 (£799) or last year's 14 Pro from John Lewis with 2-year warranty.</p>
        
        <h2>My Verdict</h2>
        <p>The iPhone 15 Pro Max is the best iPhone ever made, but that doesn't mean you should buy it. At £1,199, it's a luxury purchase. The regular iPhone 15 offers incredible value at £400 less.</p>
        <p><strong>Rating: 4/5</strong> - Brilliant phone, painful price.</p>
        <p><strong>Best place to buy:</strong> John Lewis for the 2-year warranty.</p>
      `,
      published_date: new Date().toISOString(),
      category: 'smartphones',
      rating: 4,
      product_name: 'iPhone 15 Pro Max',
      brand: 'Apple',
      brexit_warning: false,
      uk_prices: {
        currys: 1199,
        argos: 1199,
        amazonUK: 1179,
        johnLewis: 1199,
        very: 1229
      },
      sources_json: [
        { name: 'The Verge', url: 'https://www.theverge.com', quote: 'The titanium build is a game-changer' },
        { name: 'TechRadar UK', url: 'https://www.techradar.com/uk', quote: 'Best iPhone ever, but at what cost?' },
        { name: 'Trusted Reviews', url: 'https://www.trustedreviews.com', quote: 'UK buyers should consider the standard 15' }
      ],
      seo_meta: {
        metaTitle: 'iPhone 15 Pro Max UK Review: Worth £1,199? | ARIA',
        metaDescription: 'iPhone 15 Pro Max costs £1,199 at Currys - but is it worth it? ARIA analyzed 20+ reviews to save you from an expensive mistake. Real UK prices included.',
        keywords: ['iPhone 15 Pro Max', 'UK review', 'UK price', 'Currys', 'worth it'],
        focusKeyword: 'iPhone 15 Pro Max UK'
      },
      view_count: 1234
    };
    
    // Fetch related articles
    const related = [
      {
        id: '2',
        title: 'iPhone 15 vs Samsung Galaxy S24: Which Flagship Wins?',
        slug: 'iphone-15-vs-samsung-galaxy-s24',
        excerpt: 'The eternal battle continues. I break down which flagship actually deserves your money.',
        category: 'smartphones',
        published_date: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Best iPhone 15 Cases: Protect Your £1,000+ Investment',
        slug: 'best-iphone-15-cases-uk',
        excerpt: "You've spent a fortune on your iPhone. Here are the cases that'll actually protect it.",
        category: 'smartphones',
        published_date: new Date().toISOString()
      }
    ];
    
    return {
      props: {
        article,
        related
      },
      revalidate: 300 // Revalidate every 5 minutes
    };
    
  } catch (error) {
    console.error('Error fetching article:', error);
    return {
      notFound: true
    };
  }
}

// Generate static paths
export async function getStaticPaths() {
  // In production, fetch all article slugs
  // For now, return empty to use fallback
  return {
    paths: [],
    fallback: true
  };
}