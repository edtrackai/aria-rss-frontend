import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Link2, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  TrendingUp,
  DollarSign,
  MousePointer,
  Calendar,
  Search,
  Filter,
  Download,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function AffiliateManager() {
  const [affiliateLinks, setAffiliateLinks] = useState([
    {
      id: 1,
      product: 'GitHub Copilot',
      merchant: 'GitHub',
      originalUrl: 'https://github.com/features/copilot',
      affiliateUrl: 'https://github.com/features/copilot?ref=aireviewed',
      shortUrl: 'https://ai-reviewed.com/go/github-copilot',
      commission: '30%',
      clicks: 2341,
      conversions: 87,
      revenue: '$1,740',
      status: 'active',
      expiresAt: '2025-12-31',
      lastChecked: '2025-02-06'
    },
    {
      id: 2,
      product: 'Claude Pro',
      merchant: 'Anthropic',
      originalUrl: 'https://claude.ai/pro',
      affiliateUrl: 'https://claude.ai/pro?partner=aireviewed',
      shortUrl: 'https://ai-reviewed.com/go/claude-pro',
      commission: '$10 per signup',
      clicks: 1876,
      conversions: 62,
      revenue: '$620',
      status: 'active',
      expiresAt: '2025-08-15',
      lastChecked: '2025-02-06'
    },
    {
      id: 3,
      product: 'Notion AI',
      merchant: 'Notion',
      originalUrl: 'https://notion.so/ai',
      affiliateUrl: 'https://notion.so/ai?ref=aireviewed123',
      shortUrl: 'https://ai-reviewed.com/go/notion-ai',
      commission: '20%',
      clicks: 1543,
      conversions: 45,
      revenue: '$450',
      status: 'active',
      expiresAt: '2025-06-30',
      lastChecked: '2025-02-05'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newLink, setNewLink] = useState({
    product: '',
    merchant: '',
    originalUrl: '',
    affiliateUrl: '',
    commission: '',
    expiresAt: ''
  });

  // Filter links
  const filteredLinks = affiliateLinks.filter(link => {
    const matchesSearch = link.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         link.merchant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || link.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Add new affiliate link
  const addAffiliateLink = () => {
    const shortUrl = `https://ai-reviewed.com/go/${newLink.product.toLowerCase().replace(/\s+/g, '-')}`;
    const newAffiliateLink = {
      ...newLink,
      id: Date.now(),
      shortUrl,
      clicks: 0,
      conversions: 0,
      revenue: '$0',
      status: 'active',
      lastChecked: new Date().toISOString().split('T')[0]
    };
    setAffiliateLinks([...affiliateLinks, newAffiliateLink]);
    setShowAddModal(false);
    setNewLink({
      product: '',
      merchant: '',
      originalUrl: '',
      affiliateUrl: '',
      commission: '',
      expiresAt: ''
    });
  };

  // Check link status
  const checkLinkStatus = async (linkId) => {
    // In production, this would actually check if the link is still valid
    const link = affiliateLinks.find(l => l.id === linkId);
    if (link) {
      setAffiliateLinks(affiliateLinks.map(l => 
        l.id === linkId 
          ? { ...l, lastChecked: new Date().toISOString().split('T')[0] }
          : l
      ));
    }
  };

  // Export data
  const exportData = () => {
    const csv = [
      ['Product', 'Merchant', 'Commission', 'Clicks', 'Conversions', 'Revenue', 'Status'],
      ...affiliateLinks.map(link => [
        link.product,
        link.merchant,
        link.commission,
        link.clicks,
        link.conversions,
        link.revenue,
        link.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'affiliate-links.csv';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>Affiliate Link Manager - AI-Reviewed</title>
      </Head>

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Affiliate Link Manager</h1>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Link
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <Link2 className="w-8 h-8 text-blue-600" />
              <span className="text-xs text-gray-600 font-semibold">Total</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{affiliateLinks.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Links</div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <MousePointer className="w-8 h-8 text-purple-600" />
              <span className="text-xs text-green-600 font-semibold">+18%</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {affiliateLinks.reduce((sum, link) => sum + link.clicks, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Clicks</div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <span className="text-xs text-green-600 font-semibold">3.5%</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {affiliateLinks.reduce((sum, link) => sum + link.conversions, 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Conversions</div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              <span className="text-xs text-green-600 font-semibold">+23%</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">$2,810</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products or merchants..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="paused">Paused</option>
            </select>
            <button
              onClick={exportData}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Links Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {link.product}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {link.merchant}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {link.shortUrl}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="flex items-center gap-4">
                          <div>
                            <span className="font-medium">{link.clicks.toLocaleString()}</span>
                            <span className="text-gray-500 dark:text-gray-400"> clicks</span>
                          </div>
                          <div>
                            <span className="font-medium">{link.conversions}</span>
                            <span className="text-gray-500 dark:text-gray-400"> conv</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {((link.conversions / link.clicks) * 100).toFixed(1)}% CVR
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {link.commission}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-green-600">
                        {link.revenue}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          link.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                            : link.status === 'expired'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                        }`}>
                          {link.status === 'active' ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <AlertCircle className="w-3 h-3 mr-1" />
                          )}
                          {link.status}
                        </span>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Expires: {link.expiresAt}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => checkLinkStatus(link.id)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                          title="Check link status"
                        >
                          <ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                          <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Link Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Affiliate Link</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={newLink.product}
                  onChange={(e) => setNewLink({ ...newLink, product: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Merchant
                </label>
                <input
                  type="text"
                  value={newLink.merchant}
                  onChange={(e) => setNewLink({ ...newLink, merchant: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Original URL
                </label>
                <input
                  type="url"
                  value={newLink.originalUrl}
                  onChange={(e) => setNewLink({ ...newLink, originalUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Affiliate URL
                </label>
                <input
                  type="url"
                  value={newLink.affiliateUrl}
                  onChange={(e) => setNewLink({ ...newLink, affiliateUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Commission
                  </label>
                  <input
                    type="text"
                    value={newLink.commission}
                    onChange={(e) => setNewLink({ ...newLink, commission: e.target.value })}
                    placeholder="e.g., 20% or $10"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expires
                  </label>
                  <input
                    type="date"
                    value={newLink.expiresAt}
                    onChange={(e) => setNewLink({ ...newLink, expiresAt: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={addAffiliateLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}