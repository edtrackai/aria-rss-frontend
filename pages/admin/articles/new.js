import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  Save, 
  X, 
  Link2, 
  Image, 
  BarChart3, 
  Sparkles,
  Plus,
  Minus,
  Eye,
  Code,
  List,
  Table,
  Quote
} from 'lucide-react';

// Rich text editor - dynamically imported
const RichTextEditor = dynamic(() => import('../../../components/admin/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
});

export default function NewArticle() {
  const router = useRouter();
  const [article, setArticle] = useState({
    title: '',
    slug: '',
    excerpt: '',
    category: 'AI Tools',
    author: 'AI-Reviewed Team',
    verdict: 'RECOMMENDED',
    rating: '4.5',
    price: '',
    content: '',
    quickVerdict: {
      pros: [''],
      cons: ['']
    },
    affiliateLinks: [],
    seoTitle: '',
    seoDescription: '',
    tags: []
  });

  const [aiSuggestions, setAiSuggestions] = useState({
    title: '',
    excerpt: '',
    pros: [],
    cons: []
  });

  const categories = [
    'AI Tools', 'Developer Tools', 'Productivity', 'Security Tools', 
    'Cloud Services', 'Mobile Apps', 'Smart Home', 'Gaming', 'Hardware'
  ];

  const verdicts = [
    'BEST OVERALL', 'EDITOR\'S CHOICE', 'RECOMMENDED', 'GOOD VALUE', 'AVOID'
  ];

  // Generate slug from title
  const generateSlug = (title) => {
    return title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // AI-powered suggestions
  const generateAISuggestions = async () => {
    // In production, this would call your AI API
    setAiSuggestions({
      title: `${article.title}: Comprehensive Review & Analysis`,
      excerpt: `We tested ${article.title} extensively to determine if it's worth your investment. Our in-depth analysis covers performance, features, pricing, and real-world usage.`,
      pros: [
        'Excellent performance in real-world tests',
        'Intuitive user interface',
        'Competitive pricing for the features offered'
      ],
      cons: [
        'Limited customization options',
        'Requires stable internet connection',
        'Learning curve for advanced features'
      ]
    });
  };

  // Add/remove pros and cons
  const addPro = () => {
    setArticle({
      ...article,
      quickVerdict: {
        ...article.quickVerdict,
        pros: [...article.quickVerdict.pros, '']
      }
    });
  };

  const updatePro = (index, value) => {
    const newPros = [...article.quickVerdict.pros];
    newPros[index] = value;
    setArticle({
      ...article,
      quickVerdict: {
        ...article.quickVerdict,
        pros: newPros
      }
    });
  };

  const removePro = (index) => {
    setArticle({
      ...article,
      quickVerdict: {
        ...article.quickVerdict,
        pros: article.quickVerdict.pros.filter((_, i) => i !== index)
      }
    });
  };

  // Similar functions for cons
  const addCon = () => {
    setArticle({
      ...article,
      quickVerdict: {
        ...article.quickVerdict,
        cons: [...article.quickVerdict.cons, '']
      }
    });
  };

  const updateCon = (index, value) => {
    const newCons = [...article.quickVerdict.cons];
    newCons[index] = value;
    setArticle({
      ...article,
      quickVerdict: {
        ...article.quickVerdict,
        cons: newCons
      }
    });
  };

  const removeCon = (index) => {
    setArticle({
      ...article,
      quickVerdict: {
        ...article.quickVerdict,
        cons: article.quickVerdict.cons.filter((_, i) => i !== index)
      }
    });
  };

  // Save article
  const saveArticle = async (status = 'draft') => {
    try {
      const articleData = {
        ...article,
        status,
        quick_verdict_pros: article.quickVerdict.pros.filter(p => p),
        quick_verdict_cons: article.quickVerdict.cons.filter(c => c),
        published_at: status === 'published' ? new Date().toISOString() : null
      };

      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      });

      if (!response.ok) {
        throw new Error('Failed to save article');
      }

      const savedArticle = await response.json();
      alert(`Article ${status === 'published' ? 'published' : 'saved as draft'} successfully!`);
      router.push('/admin');
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Error saving article. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>New Article - AI-Reviewed Admin</title>
      </Head>

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Article</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => saveArticle('draft')}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>
              <button
                onClick={() => saveArticle('published')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Publish
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={article.title}
                    onChange={(e) => {
                      setArticle({ 
                        ...article, 
                        title: e.target.value,
                        slug: generateSlug(e.target.value)
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter article title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={article.slug}
                    onChange={(e) => setArticle({ ...article, slug: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Excerpt
                  </label>
                  <textarea
                    value={article.excerpt}
                    onChange={(e) => setArticle({ ...article, excerpt: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Brief description of the article..."
                  />
                  {aiSuggestions.excerpt && (
                    <button
                      onClick={() => setArticle({ ...article, excerpt: aiSuggestions.excerpt })}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Sparkles className="w-4 h-4" />
                      Use AI suggestion
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={article.category}
                      onChange={(e) => setArticle({ ...article, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Author
                    </label>
                    <input
                      type="text"
                      value={article.author}
                      onChange={(e) => setArticle({ ...article, author: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Content Editor */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Content</h2>
              <RichTextEditor
                value={article.content}
                onChange={(content) => setArticle({ ...article, content })}
              />
            </div>

            {/* Quick Verdict */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Verdict</h2>
                <button
                  onClick={generateAISuggestions}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate with AI
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-green-600 mb-2">Pros</h3>
                  {article.quickVerdict.pros.map((pro, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={pro}
                        onChange={(e) => updatePro(index, e.target.value)}
                        className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        placeholder="Enter a pro..."
                      />
                      <button
                        onClick={() => removePro(index)}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addPro}
                    className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Pro
                  </button>
                </div>

                <div>
                  <h3 className="font-medium text-red-600 mb-2">Cons</h3>
                  {article.quickVerdict.cons.map((con, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={con}
                        onChange={(e) => updateCon(index, e.target.value)}
                        className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        placeholder="Enter a con..."
                      />
                      <button
                        onClick={() => removeCon(index)}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addCon}
                    className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Con
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Review Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Review Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Verdict
                  </label>
                  <select
                    value={article.verdict}
                    onChange={(e) => setArticle({ ...article, verdict: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {verdicts.map(verdict => (
                      <option key={verdict} value={verdict}>{verdict}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rating
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={article.rating}
                    onChange={(e) => setArticle({ ...article, rating: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price
                  </label>
                  <input
                    type="text"
                    value={article.price}
                    onChange={(e) => setArticle({ ...article, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., $19/mo or From $99"
                  />
                </div>
              </div>
            </div>

            {/* Affiliate Links */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Affiliate Links</h2>
              
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center gap-2">
                  <Link2 className="w-4 h-4" />
                  Add Affiliate Link
                </button>
                
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage affiliate links from the <Link href="/admin/affiliates" className="text-blue-600 hover:underline">Affiliate Manager</Link>
                </p>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">SEO Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={article.seoTitle}
                    onChange={(e) => setArticle({ ...article, seoTitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Custom SEO title..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {article.seoTitle.length || 0}/60 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SEO Description
                  </label>
                  <textarea
                    value={article.seoDescription}
                    onChange={(e) => setArticle({ ...article, seoDescription: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Meta description..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {article.seoDescription.length || 0}/160 characters
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}