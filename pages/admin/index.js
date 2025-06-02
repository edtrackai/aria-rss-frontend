import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  BarChart3, 
  FileText, 
  Link2, 
  TrendingUp, 
  DollarSign, 
  Settings,
  PlusCircle,
  Search,
  Eye,
  Edit,
  Trash2,
  ExternalLink
} from 'lucide-react';

// Demo authentication - in production, use proper auth
const ADMIN_PASSWORD = 'admin123';

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState({
    totalArticles: 247,
    totalViews: '1.2M',
    affiliateClicks: '45.3K',
    revenue: '$12,450',
    avgRating: 4.6,
    activeDeals: 23
  });

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
    } else {
      alert('Invalid password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    router.push('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Admin Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>Admin Dashboard - AI-Reviewed</title>
      </Head>

      {/* Admin Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">AI-Reviewed CMS</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                View Site <ExternalLink className="inline w-4 h-4 ml-1" />
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-blue-600" />
              <span className="text-xs text-green-600 font-semibold">+12%</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalArticles}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Articles</div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-8 h-8 text-green-600" />
              <span className="text-xs text-green-600 font-semibold">+23%</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalViews}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Views</div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <Link2 className="w-8 h-8 text-purple-600" />
              <span className="text-xs text-green-600 font-semibold">+18%</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.affiliateClicks}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Affiliate Clicks</div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              <span className="text-xs text-green-600 font-semibold">+34%</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.revenue}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Revenue</div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-8 h-8 text-yellow-600" />
              <span className="text-xs text-gray-600 font-semibold">4.6/5</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgRating}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <span className="text-xs text-green-600 font-semibold">Active</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeDeals}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Live Deals</div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/admin/articles/new" className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                  <PlusCircle className="w-8 h-8 text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">New Article</span>
                </Link>
                
                <Link href="/admin/affiliates" className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                  <Link2 className="w-8 h-8 text-green-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Manage Links</span>
                </Link>
                
                <Link href="/admin/analytics" className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                  <BarChart3 className="w-8 h-8 text-purple-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Analytics</span>
                </Link>
                
                <Link href="/admin/settings" className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Settings className="w-8 h-8 text-gray-600 dark:text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Settings</span>
                </Link>
              </div>
            </div>

            {/* Recent Articles */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Articles</h2>
                <Link href="/admin/articles" className="text-blue-600 hover:text-blue-700 text-sm">
                  View All →
                </Link>
              </div>
              <div className="space-y-4">
                {[
                  { id: 1, title: 'GPT-5 vs Claude 4: Which AI Assistant Should You Choose?', status: 'published', views: '12.3K' },
                  { id: 2, title: 'GitHub Copilot X Review: The Future of Pair Programming', status: 'draft', views: '0' },
                  { id: 3, title: 'Notion AI vs Obsidian: Smart Note-Taking Showdown', status: 'published', views: '8.7K' },
                ].map((article) => (
                  <div key={article.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{article.title}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          article.status === 'published' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                        }`}>
                          {article.status}
                        </span>
                        <span>{article.views} views</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/articles/edit/${article.id}`} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                        <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </Link>
                      <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Performing */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Top Performing</h2>
              <div className="space-y-3">
                {[
                  { product: 'GitHub Copilot', clicks: '2.3K', revenue: '$437' },
                  { product: 'Claude Pro', clicks: '1.8K', revenue: '$360' },
                  { product: 'Notion AI', clicks: '1.5K', revenue: '$240' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{item.product}</span>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-green-600">{item.revenue}</div>
                      <div className="text-xs text-gray-500">{item.clicks} clicks</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Tools */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">AI Tools</h2>
              <div className="space-y-3">
                <Link href="/admin/ai/content" className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg hover:shadow-md transition-all">
                  <span className="font-medium text-gray-900 dark:text-white">Content Generator</span>
                  <span className="text-purple-600">→</span>
                </Link>
                <Link href="/admin/ai/seo" className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg hover:shadow-md transition-all">
                  <span className="font-medium text-gray-900 dark:text-white">SEO Optimizer</span>
                  <span className="text-blue-600">→</span>
                </Link>
                <Link href="/admin/ai/comparison" className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg hover:shadow-md transition-all">
                  <span className="font-medium text-gray-900 dark:text-white">Comparison Builder</span>
                  <span className="text-green-600">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}